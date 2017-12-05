/*
* Various WebGL utils:
* - create shaders from sources
* - create program from shaders
* - resize canvas to fit <canvas> element
* - get browser window dimensions
*
*/


class GlUtils {
    constructor() {}

    createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    _createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
  
  	createProgram(gl, vertexSource, fragmentSource) {
      	let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexSource);
        let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        return this._createProgram(gl, vertexShader, fragmentShader);
    }
  
    resizeCanvas(canvasElement) {
        // get canvas element size;
        var displayWidth = canvasElement.clientWidth;
        var displayHeight = canvasElement.clientHeight;

        // compare it to canvas size
        if (canvasElement.width != displayWidth || canvasElement.height != displayHeight) {
            // make the canvas the same size
            canvasElement.width = displayWidth;
            canvasElement.height = displayHeight;
        }
    }

    getWindowSize() {
        return {width: window.innerWidth, height: window.innerHeight};
    }
}

export default new GlUtils();
