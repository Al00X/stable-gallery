import {ImageEntry, ImagePartialEntry, ImagePartialEntryInsert} from '../db/schema';

const exifr = window.require('exifr');
const fs = window.require('fs/promises');

export class ImageItem {
  id?: number;
  prompt?: string;
  negativePrompt?: string;
  steps?: number;
  hash?: string;
  seed?: string;
  sampler?: string;
  modelHash?: string;
  cfgScale?: number;
  width!: number;
  height!: number;
  createdAt!: Date;
  updatedAt?: Date;
  nsfw = false;

  loaded = false;

  static fromImageEntry(entry: ImageEntry): ImageItem {
    const item = new ImageItem(entry.path);
    item.loaded = true;
    item.id = entry.id ?? undefined;
    item.hash = entry.modelHash ?? undefined;
    item.seed = entry.seed ?? undefined;
    item.steps = entry.steps ?? undefined;
    item.prompt = entry.prompt ?? undefined;
    item.negativePrompt = entry.negativePrompt ?? undefined;
    item.sampler = entry.sampler ?? undefined;
    item.modelHash = entry.modelHash ?? undefined;
    item.cfgScale = entry.cfg ?? undefined;
    item.width = entry.width ?? 0;
    item.height = entry.height ?? 0;
    item.createdAt = entry.createdAt;
    item.updatedAt = entry.updatedAt ?? undefined;
    item.nsfw = entry.nsfw ?? false;
    return item;
  }

  constructor(public path: string, load = false) {
    if (load) {
      this.load();
    }
  }

  async load(force?: boolean) {
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
      modelHash: this.modelHash,
      modelName: undefined,
      negativePrompt: this.negativePrompt,
      prompt: this.prompt,
      sampler: this.sampler,
      seed: this.seed,
      steps: this.steps,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      nsfw: this.nsfw,
    };
  }

  private async extractStat() {
    const stat = await fs.stat(this.path);
    this.createdAt = stat.birthtime;
    this.updatedAt = stat.mtime;
  }

  private async extractMetadata() {
    const buffer = await fs.readFile(this.path);
    const meta = await exifr.parse(buffer, true);

    let prompt, negative, steps, hash, cfg, seed, sampler;

    let generateInfo: string | undefined = undefined;
    if (meta.parameters) {
      generateInfo = meta.parameters;
    } else if (meta.userComment) {
      generateInfo = decodeUserCommentBuffer(meta.userComment);
    } else if (meta.XPComment) {
      generateInfo = meta.XPComment;
    }

    if (generateInfo) {
      const chunks = generateInfo
        .split('\n')
        .map((t) => t.trim())
        .filter((t) => t.length);

      prompt = (chunks.length > 0 ? chunks.slice(0, -2) : undefined)
        ?.join(' ')
        ?.trim();
      negative = (
        chunks.length > 1 ? chunks.at(-2)!.substring(17) : undefined
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
      }
    }

    this.prompt = prompt;
    this.negativePrompt = negative;
    this.cfgScale = cfg ? +cfg : undefined;
    this.steps = steps ? +steps : undefined;
    this.hash = hash;
    this.seed = seed;
    this.sampler = sampler;
    this.modelHash = hash;
    this.width = +meta.ImageWidth;
    this.height = +meta.ImageHeight;
  }

  private extractPopulatedFields() {
    this.nsfw = checkForNSFW(this.prompt);
  }
}

// prettier-ignore
const nsfwKeys = [
  'nsfw', 'boobs', 'pussy', 'nude', 'naked', 'breasts', 'butt', 'thigh', 'vagina', 'pubic',
  'porn', 'sex', 'boobs', 'underboob', 'boobies', 'asshole', 'dick', 'penis',
];
function checkForNSFW(text: string | undefined | null) {
  if (!text) return false;
  text = text.toLowerCase();
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
