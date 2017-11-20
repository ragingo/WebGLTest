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

struct GlyphInfo {
	float left;
	float top;
	float right;
	float bottom;
};

vec4 getCharacter(vec2 uv, float left, float top, float right, float bottom)
{
	if (includes(uv, left, top, right, bottom)) {
		return texture2D(uSampler, uv);
	}
	return vec4(0.0);
}

vec4 getCharacter(vec2 uv, GlyphInfo g)
{
	if (includes(uv, g.left, g.top, g.right, g.bottom)) {
		return texture2D(uSampler, uv);
	}
	return vec4(0.0);
}

void main() {

	vec2 uv = vTextureCoord;

	const int kGlyphCount = 2;
	GlyphInfo glyphs[kGlyphCount];
	glyphs[0] = GlyphInfo( 8.0,  8.0, 16.0, 16.0); // A
	glyphs[1] = GlyphInfo(24.0,  8.0, 32.0, 16.0); // C

	float x_offset = 0.0;
	vec4 result = vec4(0.0);

	for (int i = 0; i < kGlyphCount; i++) {
		vec2 offset = vec2(uv.x + x_offset, uv.y);
		GlyphInfo g = glyphs[i];
		result += getCharacter(offset, g);
		x_offset += (8.0/512.0);
	}

	// 文字テクスチャの背景を消したい・・・
	vec4 result2 = vec4(0.0);
	if (result.r > 0.0 && result.g > 0.0 && result.b > 0.0) {
		result2 = vec4(0.0, 0.0, 0.0, 1.0);
	}

	gl_FragColor = vec4(result.rgb + result2.rgb, result.a);
}
