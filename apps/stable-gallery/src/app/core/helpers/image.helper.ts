import {ImageEntry, ImageEntryInsert} from "../db/schema";

const exifr = window.require('exifr');
const fs = window.require('fs/promises');

export class ImageItem {
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

  loaded = false;

  static fromImageEntry(entry: ImageEntry): ImageItem {
    const item = new ImageItem(entry.path);
    item.loaded = true;
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
    item.createdAt = entry.createdAt
    item.updatedAt = entry.updatedAt ?? undefined;
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
    this.loaded = true;
  }

  getModel(): ImageEntryInsert {
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
    }
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

    if (meta.parameters) {
      const chunks = meta.parameters.split('\n');

      prompt = chunks.length > 0 ? chunks[0] : undefined;
      negative = chunks.length > 1 ? chunks[1].substring(18) : undefined;
      const infoChunk =
        chunks.length > 2
          ? (chunks[2] as string).split(', ').reduce((pre, cur) => {
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
}
