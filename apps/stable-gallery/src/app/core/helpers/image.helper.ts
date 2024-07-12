import {ImageEntry} from '../db';
import {signal} from "@angular/core";

const exifr = window.require('exifr');
const fs = window.require('fs/promises');
const sharp = window.require('sharp');

export class ImageItem {
  id?: number;
  prompt?: string;
  negativePrompt?: string;
  steps?: number;
  seed?: string;
  sampler?: string;
  modelHash?: string;
  cfgScale?: number;
  clipSkip?: number;
  width!: number;
  height!: number;
  createdAt!: Date;
  updatedAt?: Date;

  nsfw = signal(false);
  favorite = signal(false);

  loaded = false;
  path: string;

  private _wrongFilePath: boolean;
  private _fileInput?: File;

  static fromImageEntry(entry: ImageEntry): ImageItem {
    const item = new ImageItem(entry.path);
    item.loaded = true;
    item.id = entry.id ?? undefined;
    item.seed = entry.seed ?? undefined;
    item.steps = entry.steps ?? undefined;
    item.prompt = entry.prompt ?? undefined;
    item.negativePrompt = entry.negativePrompt ?? undefined;
    item.sampler = entry.sampler ?? undefined;
    item.modelHash = entry.modelHash ?? undefined;
    item.cfgScale = entry.cfg ?? undefined;
    item.clipSkip = entry.clipSkip ?? undefined;
    item.width = entry.width ?? 0;
    item.height = entry.height ?? 0;
    item.createdAt = entry.createdAt;
    item.updatedAt = entry.updatedAt ?? undefined;
    item.nsfw.set(entry.nsfw ?? false)
    item.favorite.set(entry.favorite ?? false)

    return item;
  }

  // input as file or path
  constructor(input: File | string, load = false) {
    this.path = typeof input === 'string' ? input : (input.path && input.path.length ? input.path : input.name);
    if (typeof input !== 'string') {
      this._fileInput = input;
    }
    const ext = this.path.substring(this.path.lastIndexOf('.') + 1);
    this._wrongFilePath = !['png', 'jpeg', 'jpg', 'bmp'].includes(ext);
    if (load) {
      this.load();
    }

    if (this._wrongFilePath) {
      console.error('ImageItem: Wrong image file');
    }
  }

  async load(force?: boolean) {
    if (this._wrongFilePath) throw new Error('ImageItem: Cannot load this file. It is unsupported.');
    if (!force && this.loaded) return;
    await this.extractStat();
    await this.extractMetadata();

    this.extractPopulatedFields();
    this.loaded = true;
  }

  getModel() {
    return {
      path: this.path,
      width: this.width,
      height: this.height,
      cfg: this.cfgScale,
      clipSkip: this.clipSkip,
      modelHash: this.modelHash,
      modelName: undefined,
      negativePrompt: this.negativePrompt,
      prompt: this.prompt,
      sampler: this.sampler,
      seed: this.seed,
      steps: this.steps,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      nsfw: this.nsfw(),
      favorite: this.favorite(),
    };
  }

  toggleNsfw(value?: boolean) {
    this.nsfw.set(value === undefined ? !this.nsfw() : value);
    this.saveStatesToDb();
  }
  toggleFavorite(value?: boolean) {
    this.favorite.set(value === undefined ? !this.favorite() : value);
    this.saveStatesToDb();
  }

  isImageValid() {
    return !this._wrongFilePath;
  }

  isInMemory() {
    return this._fileInput && !this._fileInput.path.length;
  }

  async buffer() {
    return this._fileInput ? await this._fileInput.arrayBuffer() : await fs.readFile(this.path);
  }

  blob() {
    return this._fileInput;
  }

  private async extractStat() {
    if (this.isInMemory()) return;

    const stat = await fs.stat(this.path);
    this.createdAt = stat.birthtime;
    this.updatedAt = stat.mtime;
  }

  private async extractMetadata() {
    const buffer = await this.buffer();
    const meta = await sharp(buffer).metadata();
    const exif = await exifr.parse(buffer, true);

    let prompt, negative, steps, hash, cfg, seed, sampler, clipSkip;

    let generateInfo: string | undefined = undefined;
    if (exif.parameters) {
      generateInfo = exif.parameters;
    } else if (exif.userComment) {
      generateInfo = decodeUserCommentBuffer(exif.userComment);
    } else if (exif.XPComment) {
      generateInfo = exif.XPComment;
    }

    if (generateInfo) {
      const chunks = generateInfo
        .split('\n')
        .map((t) => t.trim())
        .filter((t) => t.length);

      prompt = (chunks.length === 2 ? chunks.slice(0, -1) : chunks.length > 0 ? chunks.slice(0, -2) : undefined)
        ?.join(' ')
        ?.trim();
      negative = (
        chunks.length === 2 ? undefined : chunks.length > 1 ? chunks.at(-2)!.substring(17) : undefined
      )?.trim();
      const infoChunk =
        chunks.length > 2
          ? chunks
              .at(-1)!
              .split(', ')
              .reduce((pre, cur) => {
                const entry = cur.split(': ');

                if (entry.length <= 1) return pre;
                pre[entry[0]] = entry[1];

                return pre;
              }, {} as any)
          : undefined;

      if (infoChunk && Object.keys(infoChunk).length > 0) {
        steps = infoChunk.Steps;
        hash = infoChunk['Model hash'];
        cfg = infoChunk['CFG scale'];
        seed = infoChunk.Seed;
        sampler = infoChunk.Sampler;
        clipSkip = infoChunk['Clip skip']
      }
    }

    this.prompt = prompt;
    this.negativePrompt = negative;
    this.cfgScale = cfg ? +cfg : undefined;
    this.clipSkip = clipSkip ? +clipSkip : undefined;
    this.steps = steps ? +steps : undefined;
    this.seed = seed;
    this.sampler = sampler;
    this.modelHash = hash;
    this.width = meta.width;
    this.height = meta.height;
  }

  private extractPopulatedFields() {
    this.nsfw.set(checkForNSFW(this.prompt))
  }

  private saveStateTimeout: any;
  private saveStatesToDb() {
    if (!this.id) return;
    if (this.saveStateTimeout) {
      clearTimeout(this.saveStateTimeout);
    }
    this.saveStateTimeout = setTimeout(() => {
      return db$.update(this);
    }, 1000);
  }
}

// prettier-ignore
const nsfwKeys = [
  'nsfw', 'pussy', 'nude', 'nudity', 'naked', 'breast', 'thigh', 'vagina', 'pubic',
  'porn', 'boobs', 'underboob', 'boobies', 'asshole', 'dick', 'penis',
  'nipple', 'titties', 'tight', 'masturbation',

  // words that could be a part of a non-nsfw words (trailed by a space)
  ' ass ', ' butt ', ' boob ', ' tits ',

  // or things that are not just about porn!
  // 'gore',
];
function checkForNSFW(text: string | undefined | null) {
  if (!text) return false;
  text = text.toLowerCase().replace(/,/g, ' , ');
  for (const key of nsfwKeys) {
    if (text.includes(key)) return true;
  }
  return false;
}

// Below are some civitAi functions

const decoder = new TextDecoder('utf-16le');
function decodeUserCommentBuffer(buffer: Uint8Array): string {
  const bufferWithoutBOM = removeUnicodeHeader(buffer);
  const littleEndianBuffer = swapByteOrder(bufferWithoutBOM);
  return decoder.decode(littleEndianBuffer);
}

/**
 * Swap the byte order of a Uint8Array from big-endian to little-endian.
 * @param buffer - The input Uint8Array with big-endian byte order.
 * @returns A new Uint8Array with little-endian byte order.
 */
function swapByteOrder(buffer: Uint8Array): Uint8Array {
  const swapped = new Uint8Array(buffer.length);
  for (let i = 0; i < buffer.length; i += 2) {
    swapped[i] = buffer[i + 1];
    swapped[i + 1] = buffer[i];
  }
  return swapped;
}

/**
 * Remove Unicode header bytes if present.
 * @param buffer - The input Uint8Array.
 * @returns A new Uint8Array without BOM or header bytes.
 */
const unicodeHeader = new Uint8Array([85, 78, 73, 67, 79, 68, 69, 0]);
function removeUnicodeHeader(buffer: Uint8Array): Uint8Array {
  if (buffer.length < unicodeHeader.length) return buffer;

  // Check for BOM (Byte Order Mark) for big-endian UTF-16 (0xFEFF) and remove it if present
  for (let i = 0; i < unicodeHeader.length; i++) {
    if (buffer[i] !== unicodeHeader[i]) return buffer;
  }
  return buffer.slice(unicodeHeader.length);
}
