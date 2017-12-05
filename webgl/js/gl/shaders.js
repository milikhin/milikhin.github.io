/*
*	Shader programs for image and points rendering
*/

export default {
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
};