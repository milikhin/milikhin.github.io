/*
*	Fill buffers to draw rectangle from (0,0) to (width, height)
*/
import rectangle from './rectangle';
import glUtils from '../gl-utils';

export default function maximizedRectangle(gl, width, height) {
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

    rectangle(gl, x1, y1, x2 - x1, y2 - y1);
    return scale;
}