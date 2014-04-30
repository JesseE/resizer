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
			imageDimensions(newImg, storage, i);
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
function imageDimensions(newImg, storage, i) {
	//get the canvas el widht + height
	var canvas = document.getElementById("canvas" + i);
	var div = document.createElement('div');
	var item = document.getElementById("item" + i);


	//add the dimensions div el
	div.setAttribute("class", "dimensions");
	div.innerHTML = ['<p>actual width: <span class="highlight">',canvas.width,'px</span>',' and actual height: <span class="highlight">',canvas.height,'px</span> </p>'].join('');

	//insert the widht and height values
	item.setAttribute("class", "item");
	item.style.width = canvas.width;
	item.style.height = canvas.height;

	//insert in the div
	item.appendChild(div);
}
