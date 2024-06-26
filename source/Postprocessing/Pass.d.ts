import {
  Material,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three';

export class Pass {
  constructor();
  enabled: boolean;
  needsSwap: boolean;
  clear: boolean;
  renderToScreen: boolean;

  setSize(width: number, height: number): void;
  render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime: number, maskActive: boolean): void;
}

export namespace Pass {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
	class FullScreenQuad {
		constructor( material?: Material );

		render( renderer: WebGLRenderer ): void;

		material: Material;
	}
}
