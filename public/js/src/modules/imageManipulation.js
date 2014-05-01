/*
 *	Adding resizablity and cropping functions
 *	Author: Jesse
 *
 */
//resize the images with the javascript external lib loadImage();
function manipulateImages(storage, i, alias) {
	// console.log(storage[i]);
	loadImage(
		storage[i],
		function(newImg){
			templatingCanvas(newImg, storage, i, alias);

		},
		{
			minWidth: inputWidth.value,
			maxHeight: inputHeight.value,
			contain: true,
			canvas: true
		}
	);
}
//start the crop function
function cropImage(storage, i){
	loadImage(
		storage[i],
		function(newImg){
			templatingCanvas(newImg, storage, i);
			antiAlias(newImg, storage, i);
			imageDimensions(newImg, storage, i);
		},
		{
			maxWidth: inputWidth.value,
			maxHeight: inputHeight.value,
			crop: true,
			canvas: true
		}
	);
}
