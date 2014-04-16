/*
 *	Adding resizablity and cropping functions
 *	Author: Jesse
 *
*/
//resize the images with the javascript external lib loadImage();
function manipulateImages(storage, i) {
	// console.log(storage[i]);
	loadImage(
		storage[i],
		function(newImg){
			templatingCanvas(newImg, storage, i);
			antiAlias(newImg, storage, i);
		},
		{
			minWidth: inputWidth.value,
			maxHeight: inputHeight.value,
			contain: true,
			canvas: true
		}
	);
}
function cropImage(storage, i){
	loadImage(
		storage[i],
		function(newImg){
			templatingCanvas(newImg, storage, i);
		},
		{
			maxWidth: inputWidth.value,
			maxHeight: inputHeight.value,
			crop: true,
			canvas: true
		}
	);
}
function antiAlias(newImg,storage, i){
	var canvas = document.getElementById("canvas" + i);
   	var ctx	= canvas.getContext("2d");

	var oc  = document.createElement('canvas'),
    octx = oc.getContext('2d');

	oc.width  = newImg.width * 0.5;
	oc.height = newImg.height * 0.5;

	octx.drawImage(newImg, 0, 0, oc.width, oc.height);

	octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

	//  canvas.width = inputWidth.value;
	// canvas.height = inputHeight.value;

	ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5,
                  0, 0, canvas.width,   canvas.height);
}
// problem with resizing image is that the image gets pixalated when using canvas
// this is happening because canvas uses image smoothing or Anti aliasing which makes the edges pixalated