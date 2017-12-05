import glUtils from './gl-utils.js';
import appEvent from '../utils/app-event.js';
import shaders from './shaders.js';
import LayerConstructor from './constructors/layer-constructor.js';

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
      	this.layerConstructor = new LayerConstructor(gl);
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
        appEvent.on('image-change', function (evt) {
            self.image.src = evt.detail.url;
          	self.points = [];
            appEvent.dispatch('transformation-reset');
        });

      	appEvent.on('transformation-reset', function (evt) {
            let pointsTranslation = self.layerConstructor.transform([0, 0], 1);
          	self.layerConstructor._gamma = 1;
          	document.getElementById('gamma-value').innerHTML = 1;
          	document.getElementById('gamma-filter').value = 1;
            self.render();
        });
      
      	// re-render when canvas resized
        appEvent.on('canvas-resize', function (evt) {
            self.render();
        });
      
      	appEvent.on('gamma-filter', function (evt) {
            self.layerConstructor._gamma = evt.detail.value;
          	self.render();
        });

      	// Move, Zoom operations
        // ...handled by LayerConstructor
        appEvent.on('move-image', function (evt) {
            let moveX = evt.detail.x;
            let moveY = evt.detail.y;

            self.layerConstructor.translate(moveX, moveY);
            self.render();
        });

        appEvent.on('zoom-image', function (evt) {
            let zoomDelta = evt.detail.delta;
            let zoomSpeed = zoomDelta > 0 ? self.ZOOM_MULTIPLIER : (1 / self.ZOOM_MULTIPLIER);
            let zoomRealDelta = -(zoomSpeed - 1);

            let pointsTranslation = self.layerConstructor.getTranslation();
            self.layerConstructor.translate((evt.detail.x - pointsTranslation[0]) * zoomRealDelta, (evt.detail.y - pointsTranslation[1]) * zoomRealDelta);
            self.layerConstructor.zoomIn(zoomSpeed);
            self.render();
        });       

        appEvent.on('add-point', function (evt) {            
            self.addPoint(evt.detail.x, evt.detail.y);
        });

        appEvent.on('hover-image--delete', function (evt) {
            self.hoverPoint(evt.detail.x, evt.detail.y, 'delete');
        });

        appEvent.on('hover-image--move', function (evt) {
            self.hoverPoint(evt.detail.x, evt.detail.y, 'move', evt.detail.isMoving);
        });

        appEvent.on('remove-point', function (evt) {
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
            if ((point[0] >= x - this.POINT_WIDTH / 2 / zoom) && 
                (point[0] <= x + this.POINT_WIDTH / 2 / zoom) && 
              	(point[1] >= y - this.POINT_WIDTH / 2 / zoom) &&
              	(point[1] <= y + this.POINT_WIDTH / 2 / zoom)) {
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
        return shaders;
    }

    render() {
        const gl = this.gl;
      	const self = this;        
        // requestAnimationFrame is used to prevent rendering glitches in Firefox
      	// TODO: learn whether it is really required or not
        requestAnimationFrame(function () {
            glUtils.resizeCanvas(gl.canvas);
            glUtils.resizeCanvas(self.textContext.canvas);
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

export default GlApp;
