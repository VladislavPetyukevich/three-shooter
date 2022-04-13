import {
  Uniform
} from 'three';

export const FilmShader: {
  uniforms: {
    tDiffuse: Uniform;
    time: Uniform;
    nIntensity: Uniform;
    sIntensity: Uniform;
    sCount: Uniform;
    grayscale: Uniform;
    cThreshold: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
