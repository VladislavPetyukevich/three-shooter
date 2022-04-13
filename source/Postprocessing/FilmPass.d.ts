import {
  Vector2,
  ShaderMaterial
} from 'three';

import { Pass } from './Pass';

export class FilmPass extends Pass {
  constructor(noiseIntensity?: number, scanlinesIntensity?: number, scanlinesCount?: number, grayscale?: number, colorThreshold?: number);
  uniforms: object;
  material: ShaderMaterial;
  fsQuad: object;
}
