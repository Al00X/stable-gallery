const exifr = window.require('exifr');
const fs = window.require('fs/promises');

export class ImageItem {
  prompt!: string;
  negativePrompt!: string;
  steps!: string;
  hash!: string;
  seed!: string;
  sampler!: string;
  modelHash!: string;
  cfgScale!: string;
  width!: string;
  height!: string;
  createdAt!: Date;
  updatedAt!: Date;

  loaded = false;

  constructor(public path: string, load = false) {
    if (load) {
      this.load();
    }
  }

  async load() {
    await this.extractStat();
    await this.extractMetadata();
    this.loaded = true;
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
    this.cfgScale = cfg;
    this.steps = steps;
    this.hash = hash;
    this.seed = seed;
    this.sampler = sampler;
    this.modelHash = hash;
    this.width = meta.ImageWidth;
    this.height = meta.ImageHeight;
  }
}
