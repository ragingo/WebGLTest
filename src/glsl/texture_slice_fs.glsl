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

vec4 getCharacter(vec2 uv, float left, float top, float right, float bottom)
{
	if (includes(uv, left, top, right, bottom)) {
		return texture2D(uSampler, uv);
	}
	return vec4(0.0);
}

void main() {

	vec2 uv = vTextureCoord;

	vec4 charA = getCharacter(vec2(uv.x + (0.0/512.0), uv.y),  8.0,  8.0, 16.0, 16.0);
	vec4 charC = getCharacter(vec2(uv.x + (8.0/512.0), uv.y), 24.0,  8.0, 32.0, 16.0);

	vec4 result = charA + charC;

	gl_FragColor = result;
}
