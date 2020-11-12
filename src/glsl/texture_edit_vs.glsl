#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec2 texCoord;
uniform mat4 mvp;
uniform float flipY;
out vec2 vTextureCoord;

void main() {
    vTextureCoord = texCoord;

    gl_Position = mvp * vec4(position.xy * vec2(1, flipY), position.z, 1.0);
}
