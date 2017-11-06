precision mediump float;

uniform sampler2D uSampler;
uniform vec2      textureSize;
varying vec2      vTextureCoord;


void main() {

	vec2 uv = vTextureCoord;

	if (uv.x >= (8.0/512.0) && uv.x <= (15.0/512.0) &&
		uv.y >= (8.0/512.0) && uv.y <= (15.0/512.0)) {

		vec4 color = texture2D(uSampler, uv * vec2(1.0, 1.0));
		gl_FragColor = color;
	}
	else {
		gl_FragColor = vec4(0.0);
	}
}
