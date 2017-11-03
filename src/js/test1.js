// TODO: グローバルに剥き出し・・・直す。

// View
var view = {
	
	// スライダ群
	sliders: null,

	// エフェクト選択ドロップダウン
	effectSelector: null,

	// 描画対象のキャンバス
	canvas: null,

	// 初期化
	init: function() {
		// スライダ初期化
		this.sliders = {
			polygon: { body: ragii.dom.getElem("#slider_polygon"), label: ragii.dom.getElem("#label_polygon") },
			rotation_x: { body: ragii.dom.getElem("#slider_rotation_x"), label: ragii.dom.getElem("#label_rotation_x") },
			rotation_y: { body: ragii.dom.getElem("#slider_rotation_y"), label: ragii.dom.getElem("#label_rotation_y") },
			rotation_z: { body: ragii.dom.getElem("#slider_rotation_z"), label: ragii.dom.getElem("#label_rotation_z") },
			scale_x: { body: ragii.dom.getElem("#slider_scale_x"), label: ragii.dom.getElem("#label_scale_x") },
			scale_y: { body: ragii.dom.getElem("#slider_scale_y"), label: ragii.dom.getElem("#label_scale_y") },
			scale_z: { body: ragii.dom.getElem("#slider_scale_z"), label: ragii.dom.getElem("#label_scale_z") },
			r: { body: ragii.dom.getElem("#slider_color_r"), label: ragii.dom.getElem("#label_color_r_value") },
			g: { body: ragii.dom.getElem("#slider_color_g"), label: ragii.dom.getElem("#label_color_g_value") },
			b: { body: ragii.dom.getElem("#slider_color_b"), label: ragii.dom.getElem("#label_color_b_value") },
			a: { body: ragii.dom.getElem("#slider_color_a"), label: ragii.dom.getElem("#label_color_a_value") },
			vivid_k1: { body: ragii.dom.getElem("#slider_vivid_k1"), label: ragii.dom.getElem("#label_vivid_k1_value") },
			vivid_k2: { body: ragii.dom.getElem("#slider_vivid_k2"), label: ragii.dom.getElem("#label_vivid_k2_value") },
		};
		{
			let that = this;
			this.sliders.polygon.body.oninput = function() { return that.onSliderValueChanged(that.sliders.polygon); };
			this.sliders.rotation_x.body.oninput = function() { return that.onSliderValueChanged(that.sliders.rotation_x); };
			this.sliders.rotation_y.body.oninput = function() { return that.onSliderValueChanged(that.sliders.rotation_y); };
			this.sliders.rotation_z.body.oninput = function() { return that.onSliderValueChanged(that.sliders.rotation_z); };
			this.sliders.scale_x.body.oninput = function() { return that.onSliderValueChanged(that.sliders.scale_x); };
			this.sliders.scale_y.body.oninput = function() { return that.onSliderValueChanged(that.sliders.scale_y); };
			this.sliders.scale_z.body.oninput = function() { return that.onSliderValueChanged(that.sliders.scale_z); };
			this.sliders.r.body.oninput = function() { return that.onSliderValueChanged(that.sliders.r); };
			this.sliders.g.body.oninput = function() { return that.onSliderValueChanged(that.sliders.g); };
			this.sliders.b.body.oninput = function() { return that.onSliderValueChanged(that.sliders.b); };
			this.sliders.a.body.oninput = function() { return that.onSliderValueChanged(that.sliders.a); };
			this.sliders.vivid_k1.body.oninput = function() { return that.onSliderValueChanged(that.sliders.vivid_k1); };
			this.sliders.vivid_k2.body.oninput = function() { return that.onSliderValueChanged(that.sliders.vivid_k2); };
		}

		this.effectSelector = ragii.dom.getElem('#comboEffectSelector');
		this.effectSelector.onchange = this.onEffectTypeSelectedValueChanged;

		this.canvas = ragii.dom.getElem('#canvas');
	},

	// スライダーの値変更時
	onSliderValueChanged: function(slider) {
		slider.label.innerText = slider.body.value;
	},

	// エフェクト種別切替時
	onEffectTypeSelectedValueChanged: function() {
		if (view.getSelectedEffectType() == 16) {
			Array.prototype.forEach.call(
				ragii.dom.getElems(".vivid_params"),
				function(elem) {
					elem.style.visibility = "visible";
				}
			);
		}
		else {
			Array.prototype.forEach.call(
				ragii.dom.getElems(".vivid_params"),
				function(elem) {
					elem.style.visibility = "collapse";
				}
			);
		}
	},

	getSelectedEffectType: function() {
		let value = this.effectSelector.options[this.effectSelector.selectedIndex].value;
		return parseInt(value, 10);
	},

	getEditColor: function() {
		return [
			this.sliders.r.body.value,
			this.sliders.g.body.value,
			this.sliders.b.body.value,
			this.sliders.a.body.value
		];
	},

	getVividEffectParameters: function() {
		return [
			this.sliders.vivid_k1.body.value,
			this.sliders.vivid_k2.body.value
		];
	},

	getScale : function() {
		return {
			x: this.sliders.scale_x.body.value,
			y: this.sliders.scale_y.body.value,
			z: this.sliders.scale_z.body.value,
		};
	},

	getPolygonCount : function() {
		return this.sliders.polygon.body.value;
	},

	getRotation : function() {
		return {
			x: this.sliders.rotation_x.body.value,
			y: this.sliders.rotation_y.body.value,
			z: this.sliders.rotation_z.body.value,
		};
	},
};

async function loadShaderCodes(callback)
{
	var vs = await HttpUtils.getText("./glsl/default_vs.glsl");
	var fs = await HttpUtils.getText("./glsl/default_fs.glsl");
	if (callback) {
		callback(vs, fs);
	}
}

// グラフィックスクラス
let Graphics = function() {
	this.gl = null;
	this.program = null;
	this.textureInfo = {
		src: "res/Lenna.png",
		texture: null,
	};
	this.subTextureInfo = {
		src: "res/smile_basic_font_table.png",
		texture: null,
	};
};

// 初期化
Graphics.prototype.init = async function(gl) {

	this.gl = gl;
	if (!this.gl) {
		return false;
	}

	let that = this;

	await loadShaderCodes(function(vs_src, fs_src) {

			that.program = gl.createProgram();

			// vs 生成 & コンパイル
			let vs = gl.createShader(gl.VERTEX_SHADER);
			that.compileShader(vs, vs_src);
			gl.attachShader(that.program, vs);

			// fs 生成 & コンパイル
			let fs = gl.createShader(gl.FRAGMENT_SHADER);
			that.compileShader(fs, fs_src);
			gl.attachShader(that.program, fs);

			gl.linkProgram(that.program);

			if (!gl.getProgramParameter(that.program, gl.LINK_STATUS)) {
				console.log(gl.getProgramInfoLog(that.program));
				return false;
			}

			gl.useProgram(that.program);

			gl.viewport(0, 0, canvas.width, canvas.height);

			// 深度テストの有効化
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
		});


	return true;
}

// 準備
Graphics.prototype.prepare = function() {
	this.createTexture(this.textureInfo);
	//this.createTexture(this.subTextureInfo);

	return true;
}

// テクスチャ生成
Graphics.prototype.createTexture = function(texInfo) {
    let that = this;
    let gl = this.gl;

    let info = texInfo;
    let img = new Image();
    img.onload = function() {
        info.texture = Graphics2.createTexture(gl, img);
    };

    img.src = info.src;
}

// 描画
// 毎フレーム実行される
Graphics.prototype.render = function() {

	if (!this.program) {
		return;
	}

	let gl = this.gl;
	// クリア
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.textureInfo.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	let uniformLocation = {
		sampler: gl.getUniformLocation(this.program, 'uSampler'),
		effectType: gl.getUniformLocation(this.program, 'effectType'),
		textureSize: gl.getUniformLocation(this.program, 'textureSize'),
		editColor: gl.getUniformLocation(this.program, 'editColor'),
		vividParams: gl.getUniformLocation(this.program, 'vividParams'),
	}
	
	// テクスチャ登録
	gl.uniform1i(uniformLocation.sampler, 0);
	gl.uniform2fv(uniformLocation.textureSize, [canvas.width, canvas.height]);
	gl.uniform4fv(uniformLocation.editColor, view.getEditColor());
	gl.uniform2fv(uniformLocation.vividParams, view.getVividEffectParameters());

	// エフェクト切り替え
	gl.uniform1i(uniformLocation.effectType, view.getSelectedEffectType());

	let scale = view.getScale();
	gl.vertexAttrib3f(gl.getAttribLocation(this.program, 'scale'), scale.x, scale.y, scale.z);

	let rotation = view.getRotation();
	gl.vertexAttrib3f(gl.getAttribLocation(this.program, 'rotation'), rotation.x, rotation.y, rotation.z);

	const tex_w = 512.0;
	const tex_h = 512.0;
	let texCoords = [
		{ left:   0, top:   0, width: 256, height: 256 },
		{ left:   0, top: 256, width: 256, height: 256 },
		{ left: 256, top:   0, width: 256, height: 256 },
		{ left: 256, top: 256, width: 256, height: 256 },
	];

	// 遊び要素として、ただポリゴン数を後ろから削るだけ
	for (let i = 0; i < 4 - view.getPolygonCount(); i++) {
		texCoords.pop();
	}

	// 頂点バッファ更新
	let vertices = [];
	for (let i = 0; i < texCoords.length; i++) {
		let tc = texCoords[i];
		let tmp_pos = {
			left:   (tc.left / tex_w) * 2.0 - 1.0,
			top:    (tc.top / tex_h) * 2.0 - 1.0,
			width:  (tc.width / tex_w) * 2.0 - 1.0,
			height: (tc.height / tex_h) * 2.0 - 1.0,
			right:  ((tc.left + tc.width) / tex_w) * 2.0 - 1.0,
			bottom: ((tc.top + tc.height) / tex_h) * 2.0 - 1.0,
		};
		let tmp_texCoord = {
			left:   tc.left / tex_w,
			top:    tc.top / tex_h,
			width:  tc.width / tex_w,
			height: tc.height / tex_h,
			right:  (tc.left + tc.width) / tex_w,
			bottom: (tc.top + tc.height) / tex_h,
		};
		let pos = [
			tmp_pos.left, -tmp_pos.bottom, 0,
			tmp_pos.right, -tmp_pos.bottom, 0,
			tmp_pos.left, -tmp_pos.top, 0,
			tmp_pos.right, -tmp_pos.top, 0,
		];
		let texCoord = [
			tmp_texCoord.left, tmp_texCoord.bottom,
			tmp_texCoord.right, tmp_texCoord.bottom,
			tmp_texCoord.left, tmp_texCoord.top,
			tmp_texCoord.right, tmp_texCoord.top,
		];
		vertices.push({
			pos: pos,
			texCoord: texCoord,
		});
	}

	// インデックスバッファ生成 & 登録
	let indexData = [
		0, 1, 2,
		1, 3, 2,
	];
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics2.createVertexBuffer(gl, indexData));

	let that = this;
	vertices.forEach(function(vertex){
		let vbo_array = [
			{
				buffer: Graphics2.createVertexBuffer(gl, vertex.pos),
				location: gl.getAttribLocation(that.program, 'position'),
				stride: 3
			},
			{
				buffer: Graphics2.createVertexBuffer(gl, vertex.texCoord),
				location: gl.getAttribLocation(that.program, 'texCoord'),
				stride: 2
			},
		];
		vbo_array.forEach(function(item, idx) {
			gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
			gl.enableVertexAttribArray(item.location);
			gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
		});
		gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
	});

	// コンテキストの再描画
	gl.flush();
}

// シェーダーコードをコンパイル
Graphics.prototype.compileShader = function(shader, source) {
	let gl = this.gl;

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));
		return;
	}
}

var main = function(gl) {
	// パーツ初期化
	view.init();

	// グラフィック処理開始
	let g = new Graphics();

	// 初期化
	if (!g.init(gl)) {
		console.log("WebGL 初期化失敗！");
		return;
	}

	let frameCount = 0;
	let now = 0.0;
	let last = 0.0;
	let elapsed = 0.0;
	let prepared = false;

	window.requestAnimationFrame(function(timestamp) {
		now = timestamp;
		elapsed += (now - last);
		last = now;

		frameCount++;

		if (elapsed >= 1000) {
			ragii.dom.getElem("#fps").innerText = frameCount + " FPS";
			frameCount = 0;
			elapsed -= 1000.0;
		}

		if (prepared) {
			// 描画
			g.render();
		}
		else {
			prepared = g.prepare();
		}

		window.requestAnimationFrame(arguments.callee);
	});

};