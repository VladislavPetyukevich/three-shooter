import { Color } from 'three';

const palette: Color[] = [];

const baseColors: Color[] = [
  new Color(0x130310),
  new Color(0x1d0518),
  new Color(0x270721),
  new Color(0x3c0921),
  new Color(0x520b20),
  new Color(0x7d0f1f),
  new Color(0xa8141d),
  new Color(0xd3181c),
  new Color(0xff252b),
];

baseColors.forEach(color => {
  palette.push(color);
  const offset = -0.1;
  for (let i = 16; i--;) {
    palette.push(new Color(color).offsetHSL(0, i * offset, i * offset));
    palette.push(new Color(color).offsetHSL(0, 0, i * offset));
    palette.push(new Color(color).offsetHSL(0, i * offset, 0));
  }
});

export const ColorPaletteShader = {
  uniforms: {
    tDiffuse: { value: null },
    palette: { value: palette },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * vec4(1.0) * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
    #include <common>
    uniform sampler2D tDiffuse;
    uniform vec3 palette[${palette.length}];
    varying vec2 vUv;

    void main() {
      vec4 cTextureScreen = texture2D(tDiffuse, vUv);
      vec3 cResult = cTextureScreen.rgb;
      vec3 originalColor = cResult;
      float minDis = distance(palette[0], cResult);
      cResult = palette[0];
      for (int i = 1; i < ${palette.length}; i++) {
        float disToColor = distance(palette[i], originalColor);
        if (disToColor < minDis) {
          minDis = disToColor;
          cResult = palette[i];
        }
      }
      gl_FragColor = vec4(cResult, cTextureScreen.a);
    }
  `,
};
