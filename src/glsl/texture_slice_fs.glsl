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
	// ※ B の位置の場合、そこから横へ8px右へずらした C を参照して返す
	else if (includes(uv, 16.0, 8.0, 24.0, 16.0)) {
		gl_FragColor = texture2D(uSampler, vec2(uv.x + (8.0/512.0), uv.y));
	}
	else {
		gl_FragColor = vec4(0.0);
	}

}
