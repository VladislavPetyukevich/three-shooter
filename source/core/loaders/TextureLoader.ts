import { TextureLoader as ThreeTextureLoader, Texture } from 'three';

export const threeTextureLoader = new ThreeTextureLoader();

interface TexturesInfo {
  [name: string]: string;
}

interface TexturesMap {
  [name: string]: Texture;
}

export class TextureLoader {
  texturesMap: TexturesMap;

  constructor() {
    this.texturesMap = {};
  }

  loadTextures(textures: TexturesInfo, onLoad?: () => void, onProgress?: (progress: number) => void) {
    const texturesEntries = Object.entries(textures);
    const onTextureLoad = (textureName: string) => (texture: Texture) => {
      this.texturesMap[textureName] = texture;
      const loadTexturesCount = Object.keys(this.texturesMap).length;
      if (onProgress) {
        onProgress(loadTexturesCount / texturesEntries.length * 100);
      }
      if (onLoad && (loadTexturesCount === texturesEntries.length)) {
        onLoad();
      }
    };

    texturesEntries.forEach(
      ([name, path]) => threeTextureLoader.load(path, onTextureLoad(name))
    );
  }

  getTexture(name: string) {
    return this.texturesMap[name];
  }

  cloneTexture(originalName: string, cloneName: string) {
    const original = this.texturesMap[originalName];
    const clone = original.clone();
    this.texturesMap[cloneName] = clone;
    return clone;
  }
}

export const texturesStore = new TextureLoader();
