precision mediump float;

uniform sampler2D uSampler;
uniform int       uShowBorder;
uniform vec2      uTextureSize;
varying vec2      vTextureCoord;

bool isBorder(vec2 v) {
    if (v.x <= (2.0 / uTextureSize.x) ||
        v.x >= ((uTextureSize.x-2.0) / uTextureSize.x) ||
        v.y <= (2.0 / uTextureSize.y) ||
        v.y >= ((uTextureSize.y-2.0) / uTextureSize.y)
       ) {
        return true;
    }
    return false;
}

void main() {
    vec2 uv = vTextureCoord;
    vec4 color = texture2D(uSampler, uv);

    // if (uShowBorder == 1 && isBorder(uv)) {
    // 	color = vec4(0.0, 1.0, 0.0, 1.0);
    // }

    gl_FragColor = color;
}
