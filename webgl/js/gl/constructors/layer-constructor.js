/*
*	constructor: sets shader programs, attributes, buffers and uniforms locations
*	drawPoint: draws point by coords, label and isHovered state
*	drawImage: renders image with it's 100%-width, 100%-height
*
*/
import shaders from '../shaders.js';
import maximizedRectangle from '../elements/maximized-rectangle.js';
import rectangle from '../elements/rectangle.js';
import glUtils from '../gl-utils.js';

class LayerConstructor {
    constructor(gl) {
        this.gl = gl;
      	this.POINT_WIDTH = 8;
        this._transformation = {
            translation: [0, 0],
            zoom: [1, 1]
        };
      	
      	this.programs = {
          	points: glUtils.createProgram(gl, shaders.points.vertex, shaders.points.fragment),
          	image: glUtils.createProgram(gl, shaders.image.vertex, shaders.image.fragment)
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
      
      	rectangle(gl, coords[0], coords[1], this.POINT_WIDTH, this.POINT_WIDTH);
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

        maximizedRectangle(gl, image.width, image.height);
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

export default LayerConstructor;