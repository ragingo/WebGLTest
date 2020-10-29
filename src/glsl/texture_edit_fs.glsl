precision mediump float;

uniform sampler2D uSampler;
uniform int       uShowBorder;
uniform int       effectType;
uniform vec2      textureSize;
uniform float     binarizeThreshold;
uniform vec4      editColor;
uniform vec2      vividParams;
varying vec2      vTextureCoord;

bool isBorder(vec2 v) {
	if (v.x <= (2.0 / textureSize.x) ||
		v.x >= ((textureSize.x-2.0) / textureSize.x) ||
		v.y <= (2.0 / textureSize.y) ||
		v.y >= ((textureSize.y-2.0) / textureSize.y)
	   ) {
		return true;
	}
	return false;
}

// 外部指定の色を掛ける
vec4 apply_edit_color(vec4 color) {
	return color * (editColor / 255.0);
}

// グレースケール
vec4 grayscale(vec4 color) {
	float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
	return vec4(gray, gray, gray, color.a);
}

// 2値化
vec4 binarize(vec4 color, float threshold) {
	if (color.r > threshold ||
		color.g > threshold ||
		color.b > threshold) {
		color = vec4(0.0, 0.0, 0.0, 1.0);
	}
	else {
		color = vec4(1.0, 1.0, 1.0, 1.0);
	}
	return color;
}

// 二次微分 laplacian 4方向
vec4 laplacian4(vec4 pix[9]) {
	vec4 d =
		0.0 * pix[0] + -1.0 * pix[1] +  0.0 * pix[2] +
	   -1.0 * pix[3] +  4.0 * pix[4] + -1.0 * pix[5] +
		0.0 * pix[6] + -1.0 * pix[7] +  0.0 * pix[8];
	vec4 x = abs(d);
	return x;
}

// 二次微分 laplacian 8方向
vec4 laplacian8(vec4 pix[9]) {
	vec4 d =
		-1.0 * pix[0] + -1.0 * pix[1] + -1.0 * pix[2] +
		-1.0 * pix[3] +  8.0 * pix[4] + -1.0 * pix[5] +
		-1.0 * pix[6] + -1.0 * pix[7] + -1.0 * pix[8];
	vec4 x = abs(d);
	return x;
}

// 一次微分 Roberts
vec4 roberts(vec4 pix[9]) {
	vec4 dx =
		 0.0 * pix[0] +  0.0 * pix[1] +  0.0 * pix[2] +
		 0.0 * pix[3] +  1.0 * pix[4] +  0.0 * pix[5] +
		 0.0 * pix[6] +  0.0 * pix[7] + -1.0 * pix[8];

	vec4 dy =
		 0.0 * pix[0] +  0.0 * pix[1] +  0.0 * pix[2] +
		 0.0 * pix[3] +  0.0 * pix[4] +  1.0 * pix[5] +
		 0.0 * pix[6] + -1.0 * pix[7] +  0.0 * pix[8];

	vec4 x = sqrt(pow(dx,vec4(2.0)) + pow(dy,vec4(2.0))) * 0.5;
	return x;
}

// Prewitt
// TODO: だいぶ前に書いてみたやつだったけど、計算全然違うものかも？！
vec4 prewitt(vec4 pix[9]) {
	for (int i = 0; i < 9; i++) {
		pix[i] = grayscale(pix[i]); // グレースケール化して上書き
	}

	vec4 m[8];
	m[0] =  pix[0] + pix[1] + pix[2] + pix[3] - 2.0 * pix[4] + pix[5] - pix[6] - pix[7] - pix[8];
	m[1] =  pix[0] + pix[1] + pix[2] + pix[3] - 2.0 * pix[4] - pix[5] + pix[6] - pix[7] - pix[8];
	m[2] =  pix[0] + pix[1] - pix[2] + pix[3] - 2.0 * pix[4] - pix[5] + pix[6] + pix[7] - pix[8];
	m[3] =  pix[0] - pix[1] - pix[2] + pix[3] - 2.0 * pix[4] - pix[5] + pix[6] + pix[7] + pix[8];
	m[4] = -pix[0] - pix[1] - pix[2] + pix[3] - 2.0 * pix[4] + pix[5] + pix[6] + pix[7] + pix[8];
	m[5] = -pix[0] - pix[1] + pix[2] - pix[3] - 2.0 * pix[4] + pix[5] + pix[6] + pix[7] + pix[8];
	m[6] = -pix[0] + pix[1] + pix[2] - pix[3] - 2.0 * pix[4] + pix[5] - pix[6] + pix[7] + pix[8];
	m[7] =  pix[0] + pix[1] + pix[2] - pix[3] - 2.0 * pix[4] + pix[5] - pix[6] - pix[7] + pix[8];

	vec4 n = vec4(0.0);
	for (int i = 0; i < 8; i++) {
		n = max(n, m[i]);
	}
	vec4 x = n * 0.8;
	return x;
}

// 階調反転
vec4 reverse(vec4 pix) {
	return vec4(vec3(1.0) - pix.rgb, 1.0);
}

// 色深度変換
// TODO: 式合ってるのか？
vec4 convert_colordepth(vec4 pix, int depth) {
	vec4 result = pix;

	if (depth == 8) {
		// r 3bit, g 3bit, b 2bit
		result = vec4(floor(pix.rgb * vec3(8.0, 8.0, 4.0)) / (vec3(8.0, 8.0, 4.0) - 1.0), 1.0);
	}
	if (depth == 15) {
		// r 5bit, g 5bit, b 5bit
		result = vec4(floor(pix.rgb * vec3(32.0, 32.0, 32.0)) / (vec3(32.0, 32.0, 32.0) - 1.0), 1.0);
	}
	if (depth == 16) {
		// r 5bit, g 6bit, b 5bit
		result = vec4(floor(pix.rgb * vec3(32.0, 64.0, 32.0)) / (vec3(32.0, 64.0, 32.0) - 1.0), 1.0);
	}
	if (depth == 24) {
		result = vec4(floor(pix.rgb * vec3(256.0, 256.0, 256.0)) / (vec3(256.0, 256.0, 256.0) - 1.0), 1.0);
	}
	if (depth == 32) {
		result = pix;
	}

	return result;
}

// 周辺ピクセル取得
void get_neighbour_pixels(out vec4 pix[9]) {
	for (int row = 0; row < 3; row++) {
		for (int col = 0; col < 3; col++) {
			vec2 offset = vec2(1.0 / textureSize.x, 1.0 / textureSize.y);
			float x = vTextureCoord.x + (float(col)-1.0) * offset.x;
			float y = vTextureCoord.y + (float(row)-1.0) * offset.y;
			vec2 kernel = vec2(x, y);
			vec4 result = texture2D(uSampler, kernel);

			pix[row+col] = apply_edit_color(result); // 外部指定色を掛けて更新
		}
	}
}

// 円
vec4 circle(vec4 pix) {
	vec2 inv = vec2(1.0 / textureSize.x, 1.0 / textureSize.y);

	// 中心
	vec2 center = (textureSize.x * 0.5) * inv;

	// 現在位置
	vec2 uv = vTextureCoord.xy;

	vec4 result = pix;

	// 横線
	if (int(uv.x * 1000.0) == int(center.x * 1000.0)) {
		result = mix(result, vec4(0.0, 0.0, 1.0, 1.0), 0.5);
	}
	// 縦線
	if (int(uv.y * 1000.0) == int(center.y * 1000.0)) {
		result = mix(result, vec4(0.0, 0.0, 1.0, 1.0), 0.5);
	}

	// 半径
	float r = 100.0 * inv.x;

	// 円
	if (length(uv - center) < r) {
		result = mix(result, vec4(1.0, 0.0, 0.0, 1.0), 0.5);
		//discard;
	}

	return result;
}

// 球
vec4 sphere(vec4 pix) {
	vec2 inv = vec2(1.0 / textureSize.x, 1.0 / textureSize.y);
	vec2 center = (textureSize.x * 0.5) * inv;
	float r = 100.0 * inv.x;
	vec2 uv = vTextureCoord.xy;
	vec2 pos = uv - center;

	float z = sqrt(pow(r, 2.0) - pow(pos.x, 2.0) - pow(pos.y, 2.0)) / r;

	vec4 result = mix(pix, vec4(vec3(z), 1.0), 0.5);

	return result;
}

// 正弦波
vec4 sine_wave(vec4 pix) {
	vec2 inv = vec2(1.0 / textureSize.x, 1.0 / textureSize.y);
	vec2 center = (textureSize.x * 0.5) * inv;
	vec2 uv = vTextureCoord.xy;

	// 下地
	vec4 result = vec4(0.0, 0.0, 0.0, 0.1);

	float pi = 3.1415926535;
	float amp = 0.1;
	float freq = 600.0;
	float wave = amp * sin(uv.x/180.0 * pi * freq);
	vec2 new_wave = vec2(uv.x, uv.y + wave);

	result = texture2D(uSampler, new_wave);
	result = apply_edit_color(result);

	return result;
}

// 鮮やか
vec4 vivid(vec4 pix, float k1, float k2) {
	mat3 m = mat3(
		vec3(k1, k2, k2),
		vec3(k2, k1, k2),
		vec3(k2, k2, k1)
	);
	vec3 rgb = m * pix.rgb;
	vec4 result = vec4(rgb, 1.0);

	return result;
}

// クロマキー合成
vec4 chromakey(vec4 pix, vec3 back, float threshold) {
	float diff = length(back - pix.rgb);
	if (diff < threshold) {
		discard;
	}
	return pix;
}

void main() {

	// 元の色
	vec4 color = texture2D(uSampler, vTextureCoord);

	if (effectType == 0) {
		color *= apply_edit_color(color);
	}

	if (effectType == 1) {
		color *= apply_edit_color(color);
		color = grayscale(color);
	}

	if (effectType == 2) {
		color *= apply_edit_color(color);
		color = binarize(color, binarizeThreshold);
	}

	if (effectType == 3) {
		color *= apply_edit_color(color);
		vec4 pix[9];
		get_neighbour_pixels(pix);
		color = laplacian4(pix);
	}

	if (effectType == 4) {
		color *= apply_edit_color(color);
		vec4 pix[9];
		get_neighbour_pixels(pix);
		color = laplacian8(pix);
	}

	if (effectType == 5) {
		color *= apply_edit_color(color);
		vec4 pix[9];
		get_neighbour_pixels(pix);
		color = roberts(pix);
	}

	if (effectType == 6) {
		color *= apply_edit_color(color);
		vec4 pix[9];
		get_neighbour_pixels(pix);
		color = prewitt(pix);
	}

	if (effectType == 7) {
		color *= apply_edit_color(color);
		color = reverse(color);
	}

	if (effectType == 8) {
		color *= apply_edit_color(color);
		color = convert_colordepth(color, 8);
	}

	if (effectType == 9) {
		color *= apply_edit_color(color);
		color = convert_colordepth(color, 15);
	}

	if (effectType == 10) {
		color *= apply_edit_color(color);
		color = convert_colordepth(color, 16);
	}

	if (effectType == 11) {
		color *= apply_edit_color(color);
		color = convert_colordepth(color, 24);
	}

	if (effectType == 12) {
		color *= apply_edit_color(color);
		color = convert_colordepth(color, 32);
	}

	if (effectType == 13) {
		color *= apply_edit_color(color);
		color = circle(color);
	}

	if (effectType == 14) {
		color *= apply_edit_color(color);
		color = sphere(color);
	}

	if (effectType == 15) {
		color *= apply_edit_color(color);
		color = sine_wave(color);
	}

	if (effectType == 16) {
		color *= apply_edit_color(color);
		color = vivid(color, vividParams.x, vividParams.y);
	}

	if (effectType == 17) {
		// 背景画像とカメラ映像を合成する実験
		// TODO: 輪郭の外側の色を破棄したい。今は小細工して背景の色をなんとか抜いてる...
		vec4 original = color;
		color *= vec4(0, 149.0/255.0, 0.0, 1.0);
		color = binarize(color, 0.34);
		color = chromakey(color, vec3(0, 0, 0), 0.8);
		color = original * color;
	}

	if (uShowBorder == 1 && isBorder(vTextureCoord)) {
		color = vec4(0.0, 1.0, 0.0, 1.0);
	}

	gl_FragColor = color;
}
