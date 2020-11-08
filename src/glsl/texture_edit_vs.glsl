attribute vec3 position;
attribute vec2 texCoord;
uniform mat4 mvp;
uniform float flipY;
varying vec2 vTextureCoord;

void main() {
    vTextureCoord = texCoord;

    gl_Position = mvp * vec4(position.xy * vec2(1, flipY), position.z, 1.0);
}
