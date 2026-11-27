export class AssetLoader {
  private images = new Map<string, HTMLImageElement>();
  private sounds = new Map<string, HTMLAudioElement>();

  loadImage(key: string, src: string, crossOrigin?: string): Promise<HTMLImageElement> {
    const cached = this.images.get(key);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }

      img.onload = () => {
        this.images.set(key, img);
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`Falha ao carregar imagem "${key}" de: ${src}`));
      };

      img.src = src;
    });
  }

  loadSound(key: string, src: string): Promise<HTMLAudioElement> {
    const cached = this.sounds.get(key);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = "auto";

      audio.oncanplaythrough = () => {
        this.sounds.set(key, audio);
        resolve(audio);
      };

      audio.onerror = () => {
        reject(new Error(`Falha ao carregar áudio "${key}" de: ${src}`));
      };

      audio.src = src;
      audio.load();
    });
  }

  async loadImages(entries: Array<{ key: string; src: string; crossOrigin?: string }>): Promise<void> {
    await Promise.all(
      entries.map((entry) => this.loadImage(entry.key, entry.src, entry.crossOrigin))
    );
  }

  getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  getSound(key: string): HTMLAudioElement | undefined {
    return this.sounds.get(key);
  }

  clear(): void {
    this.images.clear();
    this.sounds.clear();
  }
}