attribute vec3 position;
attribute vec4 color;
attribute vec2 texCoord;
varying   vec2 vTextureCoord;

mat4 mat4_identity() {
	return mat4(
		vec4(1.0, 0.0, 0.0, 0.0),
		vec4(0.0, 1.0, 0.0, 0.0),
		vec4(0.0, 0.0, 1.0, 0.0),
		vec4(0.0, 0.0, 0.0, 1.0)
	);
}

mat4 mat4_scale(vec3 value) {
	return mat4(
		vec4(value.x, 0.0, 0.0, 0.0),
		vec4(0.0, value.y, 0.0, 0.0),
		vec4(0.0, 0.0, value.z, 0.0),
		vec4(0.0, 0.0, 0.0, 1.0)
	);
}

mat4 mat4_translate(vec3 value) {
	return mat4(
		vec4(1.0, 0.0, 0.0, 0.0),
		vec4(0.0, 1.0, 0.0, 0.0),
		vec4(0.0, 0.0, 1.0, 0.0),
		vec4(value.x, value.y, value.z, 1.0)
	);
}

mat4 mat4_rotate_x(float rad) {
	return mat4(
		vec4(1.0, 0.0, 0.0, 0.0),
		vec4(0.0, cos(rad), -sin(rad), 0.0),
		vec4(0.0, sin(rad), cos(rad), 0.0),
		vec4(0.0, 0.0, 0.0, 1.0)
	);
}

void main() {
	vTextureCoord = texCoord;
	mat4 mat_result = mat4_identity();
	gl_Position = mat_result * vec4(position, 1.0);
}
