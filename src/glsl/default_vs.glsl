attribute vec3 position;
attribute vec2 texCoord;
varying   vec2 vTextureCoord;

/* 単位行列
 *    |c1|c2|c3|c4|
 * |r1| 1| 0| 0| 0|
 * |r2| 0| 1| 0| 0|
 * |r3| 0| 0| 1| 0|
 * |r4| 0| 0| 0| 1|
*/
mat4 mat4_identity() {
    return mat4(
        vec4(1.0, 0.0, 0.0, 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

/* 拡大縮小行列
 *    |c1|c2|c3|c4|
 * |r1| x| 0| 0| 0|
 * |r2| 0| y| 0| 0|
 * |r3| 0| 0| z| 0|
 * |r4| 0| 0| 0| 1|
*/
mat4 mat4_scale(vec3 value) {
    return mat4(
        vec4(value.x, 0.0, 0.0, 0.0),
        vec4(0.0, value.y, 0.0, 0.0),
        vec4(0.0, 0.0, value.z, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

/* 平行移動行列
 *    |c1|c2|c3|c4|
 * |r1| 1| 0| 0| x|
 * |r2| 0| 1| 0| y|
 * |r3| 0| 0| 1| z|
 * |r4| 0| 0| 0| 1|
*/
mat4 mat4_translate(vec3 value) {
    return mat4(
        vec4(1.0, 0.0, 0.0, 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(value.x, value.y, value.z, 1.0)
    );
}

/* 回転行列(X軸)
 *    |    c1   |    c2   |    c3   |    c4   |
 * |r1|        1|        0|        0|        0|
 * |r2|        0|  cos(θ)| -sin(θ)|        0|
 * |r3|        0|  sin(θ)|  cos(θ)|        0|
 * |r4|        0|        0|        0|        1|
*/
mat4 mat4_rotation_x(float rad) {
    return mat4(
        vec4(1.0, 0.0, 0.0, 0.0),
        vec4(0.0, cos(rad), -sin(rad), 0.0),
        vec4(0.0, sin(rad), cos(rad), 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

/* 回転行列(Y軸)
 *    |    c1   |    c2   |    c3   |    c4   |
 * |r1|  cos(θ)|        0|  sin(θ)|        0|
 * |r2|        0|        1|        0|        0|
 * |r3| -sin(θ)|        0|  cos(θ)|        0|
 * |r4|        0|        0|        0|        1|
*/
mat4 mat4_rotation_y(float rad) {
    return mat4(
        vec4(cos(rad), 0.0, -sin(rad), 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(sin(rad), 0.0, cos(rad), 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

/* 回転行列(Z軸)
 *    |    c1   |    c2   |    c3   |    c4   |
 * |r1|  cos(θ)| -sin(θ)|        0|        0|
 * |r2|  sin(θ)|  cos(θ)|        0|        0|
 * |r3|        0|        0|        1|        0|
 * |r4|        0|        0|        0|        1|
*/
mat4 mat4_rotation_z(float rad) {
    return mat4(
        vec4(cos(rad), sin(rad), 0.0, 0.0),
        vec4(-sin(rad), cos(rad), 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}
void main() {
    vTextureCoord = texCoord;

    gl_Position = vec4(position, 1.0);
}
