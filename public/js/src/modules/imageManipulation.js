/*
 *	Adding resizablity and cropping functions
 *	Author: Jesse
 *
 */
//resize the images with the javascript external lib loadImage();
function manipulateImages(storage, i, antiAlias) {
	loadImage(
		storage[i],
		function(newImg){
			templatingCanvas(newImg, storage, i, antiAlias);
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
function cropImage(storage, i, antiAlias){
	loadImage(
		storage[i],
		function(newImg){
			templatingCanvas(newImg, storage, i, antiAlias);
		},
		{
			maxWidth: inputWidth.value,
			maxHeight: inputHeight.value,
			crop: true,
			canvas: true
		}
	);
}
