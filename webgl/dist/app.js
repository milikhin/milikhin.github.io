/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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

/* harmony default export */ __webpack_exports__["a"] = (new GlUtils());


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
*  AppEvent used to implement pub/sub pattern in the app
*	dispatch - dispatch event with the given type and details
*	addEventListener - add event listener for the events with given type
*	removeEventListener - remove event listener
*/
class AppEvent {
    constructor() {}

    dispatch(evtName, evtDetail) {
        if (!evtName) {
            throw new Error("AppEvent name is missing");
        }

        evtDetail = evtDetail || {};
        evtDetail._evtName = evtName;
        document.body.dispatchEvent(new CustomEvent('app-event', {
            bubbles: true,
            cancelable: true,
            detail: evtDetail || {}
        }));
    }

    on(evtName, callback) {
        this.addEventListener(evtName, callback);
    }

    addEventListener(evtName, callback) {
        let callbackFunction = function (evt) {
            if (evt.detail._evtName == evtName) {
                callback(evt);
            }
        };

        document.body.addEventListener("app-event", callbackFunction);
        return callbackFunction;
    }

    removeEventListener(callbackOnFunction) {
        document.body.removeEventListener("app-event", callbackOnFunction);
    }
}

/* harmony default export */ __webpack_exports__["a"] = (new AppEvent());

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
*	Shader programs for image and points rendering
*/

/* harmony default export */ __webpack_exports__["a"] = ({
  	image: {
      	vertex: `
			attribute vec2 a_position;
            attribute vec2 a_texCoord;
			
			varying vec2 v_texCoord;
			uniform vec2 u_translation;
            uniform vec2 u_resolution;
			uniform vec2 u_scale;

            void main() {
				// transform pixels to clipspace
				// for image we apply scaling and translation                
                vec2 clipSpaceCoords = (a_position * u_scale + u_translation) / u_resolution * 2.0 - 1.0;
				gl_Position = vec4(clipSpaceCoords * vec2(1, -1), 0.5, 1);

				// set varying for fragment shader
                v_texCoord = a_texCoord;
            } 
		`,
      	fragment: `
			precision mediump float;
            uniform sampler2D u_image;
            varying vec2 v_texCoord;
            
            void main() {
                gl_FragColor = texture2D(u_image, v_texCoord);
            } 	
		`
    },
  	points: {
      	vertex: `
			attribute vec2 a_position;
            uniform vec2 u_translation;
            uniform vec2 u_resolution;
			
            void main() {
				// transform pixels to clipspace
				// for points we only apply translation, and not scaling
                vec2 clipSpaceCoords = (a_position + u_translation) / u_resolution * 2.0 - 1.0;
				gl_Position = vec4(clipSpaceCoords * vec2(1, -1), -0.5, 1);
            }
		`,
      	fragment: `
			precision mediump float;
            uniform vec4 u_color;

            void main() {
                gl_FragColor = u_color;
            }
		`
    }
});

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = rectangle;
/*
*	Fill buffers to draw rectangle
*/
function rectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2, 
      	x2, y1,
        x2, y2
    ]), gl.STATIC_DRAW);
};

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_file_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__gl_gl_app_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__ = __webpack_require__(1);




class App {
    constructor() {
        this.uiElems = {
            imageInput: document.getElementById('app-image-input'),
            canvas: document.getElementById('app-canvas'),
            textCanvas: document.getElementById('text-canvas')
        };
        this._appMode = 'pan';
        this.glApp = new __WEBPACK_IMPORTED_MODULE_1__gl_gl_app_js__["a" /* default */](this.uiElems.canvas, this.uiElems.textCanvas);
        this._handleUiEvents();
        this._handleMouseMoveEvents();
        this._handleMouseZoomEvents();
        this._handleMouseClickEvents();
        this._handleResizeEvents();
        this._initAppMode();
    }

    _downloadJson() {
        let points = this.glApp.getPoints();
        __WEBPACK_IMPORTED_MODULE_0__utils_file_js__["a" /* default */].downloadJson({points: points}, 'points');
    }

    _initAppMode() {
        [].forEach.call(document.querySelectorAll('.app-mode-input'), function (inputElem) {
            if (inputElem.checked) {
                this._appMode = inputElem.value;
                document.body.className = `mode-${this._appMode}`;
                __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('mode-change', {mode: this._appMode});
            }
        }, this);
      
      	this._handleUiButtons();
    }

    _handleUiEvents() {
        this.uiElems.imageInput.addEventListener('change', this._handleImageSelection.bind(this));
    }

    _handleResizeEvents() {
        window.addEventListener('resize', function (evt) {
            __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('canvas-resize', {});
        });
    }

    _handleUiButtons() {
        document.getElementById('zoom-in').addEventListener('click', function () {
            __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('zoom-image', {
                delta: 1,
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            });
        });
      	document.getElementById('zoom-out').addEventListener('click', function () {
            __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('zoom-image', {
                delta: -1,
              	x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            });
        });
      	document.getElementById('zoom-reset').addEventListener('click', function () {
            __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('transformation-reset', {});
        });
    }

    _handleMouseClickEvents() {
        const self = this;
        document.body.addEventListener('click', function (evt) {

            if (evt.target && evt.target.id == 'app-download-points') {
                self._downloadJson();
            }
            // listen only to events on our canvas, ignore other elems
            if (!evt.target || !~ evt.target.className.indexOf("app-canvas")) {
                return;
            }
            evt.preventDefault();
            switch (self._appMode) {
                case 'add':
                    {
                        __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('add-point', {
                            x: evt.clientX,
                            y: evt.clientY
                        });
                        break;
                    }
                case 'remove':
                    {
                        __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('remove-point', {
                            x: evt.clientX,
                            y: evt.clientY
                        });
                        break;
                    }
                case 'pan':
                case 'move':
                default:
                    return;
            }
        });

        document.body.addEventListener('change', function (evt) {
            // listen only to events on our canvas, ignore other elems
            if (!evt.target || !~ evt.target.className.indexOf("app-mode-input")) {
                return;
            }
            self._appMode = evt.target.value;
            document.body.className = `mode-${self._appMode}`;
            __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('mode-change', {mode: self._appMode});
        });
    }

    _handleMouseZoomEvents() {
        document.body.addEventListener('wheel', function (evt) {
            // listen only to events on our canvas, ignore other elems
            if (!evt.target || !~ evt.target.className.indexOf("app-canvas")) {
                return;
            }
            evt.preventDefault();
            let deltaY = evt.deltaY;
            __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('zoom-image', {
                delta: deltaY > 0 ? -1 : 1,
                x: evt.clientX,
                y: evt.clientY
            });
        });
    }

    _handleMouseMoveEvents() {
        // start coords to count delta X and delta Y
        let startX;
        let startY;
        let self = this;

        // flag - shows whether translation is undergoing now or not
        let isMoving = false;
        document.body.addEventListener('mousedown', function (evt) {
            // listen only to events on our canvas, ignore other elems
            if (!evt.target || !~ evt.target.className.indexOf("app-canvas")) {
                return;
            }
            switch (self._appMode) {
                case 'pan':
                    {
                        evt.preventDefault();
                        startX = evt.clientX;
                        startY = evt.clientY;
                        isMoving = true;
                        document.body.classList.add('moving');
                        break;
                    }
                case 'move':
                    {
                        evt.preventDefault();
                        startX = evt.clientX;
                        startY = evt.clientY;
                        isMoving = true;
                        document.body.classList.add('moving');
                    }
            }

        });

        document.body.addEventListener('mousemove', function (evt) {
            // listen only to events on our canvas, ignore other elems
            if (!evt.target || !~ evt.target.className.indexOf("app-canvas")) {
                return;
            }

            switch (self._appMode) {
                case 'pan':
                    {
                        evt.preventDefault();
                        let deltaX = evt.clientX - startX;
                        let deltaY = evt.clientY - startY;

                        if (isMoving) {
                            __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('move-image', {
                                x: deltaX,
                                y: deltaY
                            });

                            startX = evt.clientX;
                            startY = evt.clientY;
                        }
                        break;
                    }
                case 'remove':
                    {
                        evt.preventDefault();
                        __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('hover-image--delete', {
                            x: evt.clientX,
                            y: evt.clientY
                        });
                    }

                case 'move':
                    {
                        evt.preventDefault();
                        __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('hover-image--move', {
                            x: evt.clientX,
                            y: evt.clientY,
                            isMoving: isMoving
                        });
                    }
                case 'add':
                default:
                    return;
            }
            // prevent default mousemove behaviour: to prevent text selection in control elems

        });

        document.body.addEventListener('mouseup', function (evt) {
            // listen only to events on our canvas, ignore other elems if (!evt.target || evt.target.id !=
            // "app-canvas") {     return; } evt.preventDefault();
            document.body.classList.remove('moving');
            isMoving = false;
        });
    }

    _handleImageSelection(evt) {
        if (!(evt && evt.target && evt.target.files)) {
            throw new Error('Image file is required but not selected');
        }

        let file = evt.target.files[0];
        let imageUrl = __WEBPACK_IMPORTED_MODULE_0__utils_file_js__["a" /* default */].getUrlForInputFile(file);
        __WEBPACK_IMPORTED_MODULE_2__utils_app_event_js__["a" /* default */].dispatch('image-change', {url: imageUrl});
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new App();
});

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
* Вспомогательные функции для работы с файлами.
* */
class FileUtils {
    constructor() {}

    getUrlForInputFile (file) {
        if (!file) {
            throw new Error('FILE_NOT_FOUND');
        }

        var fileURL = URL.createObjectURL(file);
        return fileURL;
    }
  
  	downloadJson(data, name) {
      	let pointsJson = JSON.stringify(data);
        var blob = new Blob([pointsJson], {type: "application/json"});
        var url = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.href = url;
        a.download = name + ".json";
        document.body.appendChild(a);
        a.click();
      	document.body.removeChild(a);
    }
}

/* harmony default export */ __webpack_exports__["a"] = (new FileUtils());


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__gl_utils_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shaders_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__constructors_layer_constructor_js__ = __webpack_require__(7);





// requestAnimationFrame is used inside 'render' method to make rendering smoother
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

class GlApp {
    constructor(rootElem, textElem) {
        let self = this;
        // When zoom in/out : NewScale = PrevScale * ZOOM_MULTIPLIER;
      	this.ZOOM_MULTIPLIER = 1.1;
      	
      	// point width in browser pixels
        this.POINT_WIDTH = 8;
      
      	// array of current image's points
		this.points = [];
      
        const gl = this.gl = rootElem.getContext("webgl");
        const textContext = this.textContext = textElem.getContext("2d");

        // Only continue if WebGL is available and working
        if (!this.gl) {
            throw new Error("Unable to initialize WebGL. Your browser or machine may not support it.");
        }

      	// Wee need depth test to draw points on top of image
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // layer constructor handles drawing operations
      	this.layerConstructor = new __WEBPACK_IMPORTED_MODULE_3__constructors_layer_constructor_js__["a" /* default */](gl);
		this.init();        
    }
  
  	// used to inititalize UI
  	init() {
      	const self = this;
      	this.image = new Image();
        this.image.src = "./image.jpg";
        
      	// wait until image is loaded and then render!
        this.image.onload = function () {
            self.render();
        };

        this._handleUiEvents();
    }

  	// returns current image's points
    getPoints() {
        return this.points;
    }

    _handleUiEvents() {
        let self = this;

      	// reset transformation and points when new image loaded
        __WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__["a" /* default */].on('image-change', function (evt) {
            self.image.src = evt.detail.url;
          	self.points = [];
            __WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__["a" /* default */].dispatch('transformation-reset');
        });

      	__WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__["a" /* default */].on('transformation-reset', function (evt) {
            let pointsTranslation = self.layerConstructor.transform([0, 0], 1);
            self.render();
        });
      
      	// re-render when canvas resized
        __WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__["a" /* default */].on('canvas-resize', function (evt) {
            self.render();
        });

      	// Move, Zoom operations
        // ...handled by LayerConstructor
        __WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__["a" /* default */].on('move-image', function (evt) {
            let moveX = evt.detail.x;
            let moveY = evt.detail.y;

            self.layerConstructor.translate(moveX, moveY);
            self.render();
        });

        __WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__["a" /* default */].on('zoom-image', function (evt) {
            let zoomDelta = evt.detail.delta;
            let zoomSpeed = zoomDelta > 0 ? self.ZOOM_MULTIPLIER : (1 / self.ZOOM_MULTIPLIER);
            let zoomRealDelta = -(zoomSpeed - 1);

            let pointsTranslation = self.layerConstructor.getTranslation();
            self.layerConstructor.translate((evt.detail.x - pointsTranslation[0]) * zoomRealDelta, (evt.detail.y - pointsTranslation[1]) * zoomRealDelta);
            self.layerConstructor.zoomIn(zoomSpeed);
            self.render();
        });       

        __WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__["a" /* default */].on('add-point', function (evt) {            
            self.addPoint(evt.detail.x, evt.detail.y);
        });

        __WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__["a" /* default */].on('hover-image--delete', function (evt) {
            self.hoverPoint(evt.detail.x, evt.detail.y, 'delete');
        });

        __WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__["a" /* default */].on('hover-image--move', function (evt) {
            self.hoverPoint(evt.detail.x, evt.detail.y, 'move', evt.detail.isMoving);
        });

        __WEBPACK_IMPORTED_MODULE_1__utils_app_event_js__["a" /* default */].on('remove-point', function (evt) {
            self.removePoint(evt.detail.x, evt.detail.y);
        });
    }

  	// get point under cursor pointer, or null if there is no such point
    _getActivePoint(clientCoords) {
        let hoveredPoint = null;
        let pointsTranslation = this.layerConstructor.getTranslation();
        let zoom = this.layerConstructor.getZoom();
        let x = (clientCoords[0] - pointsTranslation[0]) / zoom;
        let y = (clientCoords[1] - pointsTranslation[1]) / zoom;

        this.points.forEach(function (point, index) {
            if ((point[0] + this.POINT_WIDTH / 2 >= x) && (point[0] - this.POINT_WIDTH / 2 <= x) && (point[1] + this.POINT_WIDTH / 2 >= y) && (point[1] - this.POINT_WIDTH /2 <= y)) {
                hoveredPoint = index;
            }
        }, this);
        return hoveredPoint;
    }
  	
  	// add point by screen coords
    addPoint(clientX, clientY) {
        let pointsTranslation = this.layerConstructor.getTranslation();
        let zoom = this.layerConstructor.getZoom();
        let x = (clientX - pointsTranslation[0]) / zoom;
        let y = (clientY - pointsTranslation[1]) / zoom;
        this.points.push([x, y]);
        this.render();
    }

  	// handle Hover event logics
  	// changing point color, or moving point with the pointer
    hoverPoint(clientX, clientY, mode, isMoving) {
        switch (mode) {
            case 'delete':
                {
                    this._hoveredPoint = this._getActivePoint([clientX, clientY]);
                    this.render();
                    break;
                }
            case 'move':
                {
                    if (isMoving) {
                        if (this._hoveredPoint !== null) {
                            let pointsTranslation = this.layerConstructor.getTranslation();
                            let zoom = this.layerConstructor.getZoom();
                            let x = (clientX - pointsTranslation[0]) / zoom;
                            let y = (clientY - pointsTranslation[1]) / zoom;
                            this.points[this._hoveredPoint][0] = x;
                            this.points[this._hoveredPoint][1] = y;
                        }
                    } else {
                        this._hoveredPoint = this._getActivePoint([clientX, clientY]);
                    }
                    this.render();
                    break;
                }
        }

    }

  	// remove point by screen coords
    removePoint(clientX, clientY) {
        this._hoveredPoint = this._getActivePoint([clientX, clientY]);
        if (this._hoveredPoint !== null) {
            this.points.splice(this._hoveredPoint, 1);
            this._hoveredPoint = null;
        }
        this.render();
    }

    _getShaders() {
        return __WEBPACK_IMPORTED_MODULE_2__shaders_js__["a" /* default */];
    }

    render() {
        const gl = this.gl;
      	const self = this;        
        // requestAnimationFrame is used to prevent rendering glitches in Firefox
      	// TODO: learn whether it is really required or not
        requestAnimationFrame(function () {
            __WEBPACK_IMPORTED_MODULE_0__gl_utils_js__["a" /* default */].resizeCanvas(gl.canvas);
            __WEBPACK_IMPORTED_MODULE_0__gl_utils_js__["a" /* default */].resizeCanvas(self.textContext.canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            //render points and image
            self.textContext.clearRect(0, 0, self.textContext.canvas.width, self.textContext.canvas.height);

            self.layerConstructor.drawImage(self.image);
            self.points.forEach(function (point, index) {
                self.layerConstructor.drawPoint(point[0], point[1], self.textContext, index, self._hoveredPoint == index);
            }, self);
        });
    }
}

/* harmony default export */ __webpack_exports__["a"] = (GlApp);


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shaders_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__elements_maximized_rectangle_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__elements_rectangle_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__gl_utils_js__ = __webpack_require__(0);
/*
*	constructor: sets shader programs, attributes, buffers and uniforms locations
*	drawPoint: draws point by coords, label and isHovered state
*	drawImage: renders image with it's 100%-width, 100%-height
*
*/





class LayerConstructor {
    constructor(gl) {
        this.gl = gl;
      	this.POINT_WIDTH = 8;
        this._transformation = {
            translation: [0, 0],
            zoom: [1, 1]
        };
      	
      	this.programs = {
          	points: __WEBPACK_IMPORTED_MODULE_3__gl_utils_js__["a" /* default */].createProgram(gl, __WEBPACK_IMPORTED_MODULE_0__shaders_js__["a" /* default */].points.vertex, __WEBPACK_IMPORTED_MODULE_0__shaders_js__["a" /* default */].points.fragment),
          	image: __WEBPACK_IMPORTED_MODULE_3__gl_utils_js__["a" /* default */].createProgram(gl, __WEBPACK_IMPORTED_MODULE_0__shaders_js__["a" /* default */].image.vertex, __WEBPACK_IMPORTED_MODULE_0__shaders_js__["a" /* default */].image.fragment)
        };
      
        this.locations = {
          	points: {
             	positionAttributeLocation: gl.getAttribLocation(this.programs.points, "a_position"),
                resolutionLocation: gl.getUniformLocation(this.programs.points, "u_resolution"),
                translationLocation: gl.getUniformLocation(this.programs.points, "u_translation"),
                scaleLocation: gl.getUniformLocation(this.programs.points, "u_scale"),
              	colorUniformLocation: gl.getUniformLocation(this.programs.points, "u_color")
            },
          	image: {
              	positionAttributeLocation: gl.getAttribLocation(this.programs.image, "a_position"),
                resolutionLocation: gl.getUniformLocation(this.programs.image, "u_resolution"),
                translationLocation: gl.getUniformLocation(this.programs.image, "u_translation"),
                scaleLocation: gl.getUniformLocation(this.programs.image, "u_scale"),
              	texCoordLocation: gl.getAttribLocation(this.programs.image, "a_texCoord")        
            }
        };
      
        this.buffers = {
          	points: {
              	positionBuffer: gl.createBuffer()
            },
            image: {
              	positionBuffer: gl.createBuffer(),
              	texCoordBuffer: gl.createBuffer()
            }   
        };
    }
  
  	getTranslation(){
      	return this._transformation.translation;
    }
  	
  	getZoom(){
      	return this._transformation.zoom[0];
    }
  
  	translate(moveX = 0, moveY = 0) {
      	this.transform([this.getTranslation()[0] + moveX, this.getTranslation()[1] + moveY], this._transformation.zoom[0]);
    }
  
  	zoomIn(scaleFactor){
      	this._transformation.zoom[0] *= scaleFactor;
      	this._transformation.zoom[1] *= scaleFactor;        
    }
  
  	transform(translation = [0, 0], scale = 1) {
      	this._transformation = {
            translation: translation,
            zoom: [scale, scale]
        };
    }
  
	drawPoint(x, y, txtContext, txtLabel, isHovered) {
        const gl = this.gl;
        gl.useProgram(this.programs.points);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.points.positionBuffer);
      	let coords = [(x * this._transformation.zoom[0] - this.POINT_WIDTH/2), y * this._transformation.zoom[1] - this.POINT_WIDTH/2];
      
      	Object(__WEBPACK_IMPORTED_MODULE_2__elements_rectangle_js__["a" /* default */])(gl, coords[0], coords[1], this.POINT_WIDTH, this.POINT_WIDTH);
		gl.enableVertexAttribArray(this.locations.points.positionAttributeLocation);

        var size = 2; // 2 components per iteration
        var type = gl.FLOAT; // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0; // start at the beginning of the buffer

        gl.vertexAttribPointer(this.locations.points.positionAttributeLocation, size, type, normalize, stride, offset);
        var primitiveType = gl.TRIANGLES;
        var count = 6;
      
        gl.uniform2f(this.locations.points.resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2fv(this.locations.points.translationLocation, this._transformation.translation);
        gl.uniform2fv(this.locations.points.scaleLocation, this._transformation.zoom);
      	if(isHovered) {
        	gl.uniform4f(this.locations.points.colorUniformLocation, 0.9, 0.6, 0.2, 1);  
        } else {
          	gl.uniform4f(this.locations.points.colorUniformLocation, 0.2, 0.6, 0.9, 1);  
        }
      	
        gl.drawArrays(primitiveType, offset, count);
      
      	txtContext.font="14px Arial";
      	txtContext.shadowColor = "white";
        txtContext.shadowOffsetX = 0; 
        txtContext.shadowOffsetY = 0; 
        txtContext.shadowBlur = 5;
       	txtContext.fillText(`${txtLabel}`, coords[0] + this._transformation.translation[0], coords[1] + 14 + this.POINT_WIDTH + this._transformation.translation[1]);      	
    }
  
    drawImage(image) {
        const gl = this.gl;
        gl.useProgram(this.programs.image);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.image.positionBuffer);

        Object(__WEBPACK_IMPORTED_MODULE_1__elements_maximized_rectangle_js__["a" /* default */])(gl, image.width, image.height);
		// Turn on the attribute
        gl.enableVertexAttribArray(this.locations.image.positionAttributeLocation);


        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2; // 2 components per iteration
        var type = gl.FLOAT; // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0; // start at the beginning of the buffer
        gl.vertexAttribPointer(this.locations.image.positionAttributeLocation, size, type, normalize, stride, offset);

        // draw
        var primitiveType = gl.TRIANGLES;
        var count = 6;
        gl.uniform2f(this.locations.image.resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2fv(this.locations.image.translationLocation, this._transformation.translation);
        gl.uniform2fv(this.locations.image.scaleLocation, this._transformation.zoom);

        // provide texture coordinates for the rectangle        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.image.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.locations.image.texCoordLocation);
        gl.vertexAttribPointer(this.locations.image.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Create a texture.
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(primitiveType, offset, count);
    }
}

/* harmony default export */ __webpack_exports__["a"] = (LayerConstructor);

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = maximizedRectangle;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__rectangle__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__gl_utils__ = __webpack_require__(0);
/*
*	Fill buffers to draw rectangle from (0,0) to (width, height)
*/



function maximizedRectangle(gl, width, height) {
    const ratio = width / height;

    // let windowSize = glUtils.getWindowSize();
    // let widthRatio = width / windowSize.width;
    // let heightRatio = height / windowSize.height;
    let x1 = 0;
    let y1 = 0;
    let x2 = width;
    let y2 = height;
	let scale = 1;
  
    // if (widthRatio > 1 && widthRatio > heightRatio) {
    //     x2 = windowSize.width;
    //     y2 = windowSize.width / ratio;
    //   	scale = widthRatio;
    // } else if (heightRatio > 1) {
    //     x2 = windowSize.height * ratio;
    //     y2 = windowSize.height;
    //   	scale = heightRatio;
    // }

    Object(__WEBPACK_IMPORTED_MODULE_0__rectangle__["a" /* default */])(gl, x1, y1, x2 - x1, y2 - y1);
    return scale;
}

/***/ })
/******/ ]);