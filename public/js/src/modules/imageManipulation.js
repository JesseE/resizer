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
			templating(newImg, storage, i);
		},
		{
			minWidth: inputWidth.value,
			maxHeight: inputHeight.value,
			contain: true,
			canvas:true
		}
	);
}
function cropImage(storage, i){
	loadImage(
		storage[i],
		function(newImg){
			templating(newImg, storage, i);
		},
		{
			maxWidth: inputWidth.value,
			maxHeight: inputHeight.value,
			crop:true,
			canvas:true
		}
	);
}
// problem with resizing image is that the image gets blurry when using canvas
// this is happening because canvas uses image smoothing or Anti aliasing which makes the edges blurry