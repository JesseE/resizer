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
function imageDimensions(newImg, storage, i) {
	var canvas = document.getElementById("canvas" + i);
	var div = document.createElement('div');
	div.setAttribute("class", "dimensions");
	div.innerHTML = ['<p>actual width: <span class="highlight">',canvas.width,'px</span>',' and actual height: <span class="highlight">',canvas.height,'px</span> </p>'].join('');
	var item = document.getElementById("item" + i);
	item.setAttribute("class", "item");
	item.setAttribute("width", ""+canvas.width);
	item.setAttribute("height", ""+canvas.height);
	item.insertBefore(div, null);
	//get the canvas el widht + height
	//add the dimensions div el
	//insert the widht and height values
	//insert in the div

}
function antiAlias(newImg, storage, i){
	 var canvas = document.getElementById("canvas"+i);
	 var imgData = canvas.toDataURL();
	 newImg.src = imgData;
	//  newImg.src = imgData;
	// console.log(imgData);
 // 	var canvas=document.getElementById("canvas"+i)
 //    var ctx=canvas.getContext("2d");
 //        /// step 1
 //        var oc = document.createElement('canvas'),
 //            octx = oc.getContext('2d');
 //        oc.width = newImg.width * 0.5;
 //        oc.height = newImg.height * 0.5;
 //        octx.drawImage(newImg, 0,0, oc.width,oc.height);

 //        /// step 2
 //        octx.drawImage(oc,0,0,oc.width * 0.5,oc.height * 0.5);

 //        canvas.width=inputWidth.value;
 //        canvas.height=inputHeight.value;
 //        ctx.drawImage(oc,0,0,oc.width * 0.5, oc.height * 0.5,
 //                         0,0,canvas.width,canvas.height);

	polyFillPerfNow();

	// Example

	var cv = document.getElementById('canvas' +i);
	var context = cv.getContext('2d');

	context.ImageSmoothingEnabled = false;
	context.webkitImageSmoothingEnabled = false;
	context.mozImageSmoothingEnabled = false;

	// context.fillStyle = '#080';
	// context.fillRect(0, 0, 2000, 2000);

	var img = newImg;

	var st =0, ed = 0;
	st = performance.now();

	var scaledImage = downScaleImage(img, 0.8);

	ed = performance.now();

	var pixelCount = img.width * img.height;
	console.log('time taken for ' +( pixelCount) + ' pixels ' + (ed-st) + '.  '
	                   + (1e3*(ed-st)/pixelCount) + ' ns per pixel '  );

}

// problem with resizing image is that the image gets pixalated when using canvas
// this is happening because canvas uses image smoothing or Anti aliasing which makes the edges pixalated