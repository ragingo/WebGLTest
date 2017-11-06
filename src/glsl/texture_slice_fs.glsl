precision mediump float;

uniform sampler2D uSampler;
uniform vec2      textureSize;
varying vec2      vTextureCoord;

bool includes(vec2 uv, float left, float top, float right, float bottom)
{
	float l = left / 512.0;
	float t = top / 512.0;
	float r = right / 512.0;
	float b = bottom / 512.0;
	if (uv.x >= l && uv.x <= r &&
		uv.y >= t && uv.y <= b) {
		return true;
	}
	return false;
}

void main() {

	vec2 uv = vTextureCoord;

	// "A" を切り取り
	if (includes(uv, 8.0, 8.0, 16.0, 16.0)) {
		gl_FragColor = texture2D(uSampler, uv);
	}
	// "C" を切り取り
	// TODO: A と C の間を埋める(B の位置に C を移動する)
	else if (includes(uv, 24.0, 8.0, 32.0, 16.0)) {
		gl_FragColor = texture2D(uSampler, uv);
	}
	else {
		gl_FragColor = vec4(0.0);
	}

}
