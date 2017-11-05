precision mediump float;

uniform sampler2D uSampler;
uniform vec2      textureSize;
varying vec2      vTextureCoord;


void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);
	gl_FragColor = color;
}
