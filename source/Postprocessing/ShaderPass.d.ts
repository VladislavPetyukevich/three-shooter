import {
  Material
} from 'three';

import { Pass } from './Pass';

type Uniforms = Record<string, { value: string | number | number[] }>;

export class ShaderPass extends Pass {
  constructor(shader: object, textureID?: string);
  textureID: string;
  uniforms: Uniforms;
  material: Material;
  fsQuad: object;
}
