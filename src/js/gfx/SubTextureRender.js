"use strict";
class SubTextureRender {
    constructor() {
        this.m_TextureLoaded = false;
        this.m_Processing = false;
    }
    getContext() {
        return this.gl;
    }
    setContext(gl) {
        this.gl = gl;
    }
    onBeginDraw() {
        if (!this.m_TextureLoaded) {
            this.loadTexture().then(r2 => {
            });
        }
    }
    onDraw() {
        if (this.m_Sprite) {
            this.m_Sprite.draw(this.gl);
        }
    }
    onEndDraw() {
    }
    async loadTexture() {
        if (this.m_Processing) {
            return false;
        }
        this.m_Processing = true;
        let img = new Image();
        img.onload = () => {
            let tex = Graphics.createTexture(this.gl, img);
            if (!tex) {
                console.log("texture is null.");
                return;
            }
            this.m_Sprite = new Sprite();
            this.m_Sprite.texture = tex;
            this.m_Sprite.initialize();
            this.m_TextureLoaded = true;
            this.m_Processing = false;
            console.log("texture loaded.");
        };
        img.src = "./res/smile_basic_font_table.png";
        return true;
    }
}
