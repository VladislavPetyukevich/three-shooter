import {
  Vector3
} from 'three';

interface UniformVector3 {
  value: Vector3;
}

export const ColorCorrectionShader: {
  uniforms: {
    tDiffuse: UniformVector3;
    powRGB: UniformVector3;
    mulRGB: UniformVector3;
    addRGB: UniformVector3;
  };
  vertexShader: string;
  fragmentShader: string;
};
