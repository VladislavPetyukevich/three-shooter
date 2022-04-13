/**
 * @author alteredq / http://alteredqualia.com/
 */

import {
	ShaderMaterial,
	UniformsUtils
} from "three";
import { Pass } from "./Pass";
import { FilmShader } from "./Shaders/FilmShader";

var FilmPass = function ( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale, colorThreshold ) {

	Pass.call( this );

	if ( FilmShader === undefined )
		console.error( "FilmPass relies on FilmShader" );

	var shader = FilmShader;

	this.uniforms = UniformsUtils.clone( shader.uniforms );

	this.material = new ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
	if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
	if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
	if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;
  if ( colorThreshold !== undefined ) this.uniforms.cThreshold.value = colorThreshold;

	this.fsQuad = new Pass.FullScreenQuad( this.material );

};

FilmPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: FilmPass,

	render: function ( renderer, writeBuffer, readBuffer, deltaTime /*, maskActive */ ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ "time" ].value += deltaTime;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			this.fsQuad.render( renderer );

		}

	}

} );

export { FilmPass };
