"use strict";
class DefaultDraw {
    getContext() {
        return this.gl;
    }
    setContext(gl) {
        this.gl = gl;
    }
    onBeginDraw() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    onDraw() {
    }
    onEndDraw() {
    }
}
