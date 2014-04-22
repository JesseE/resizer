/*
 *	Adding resizablity and cropping functions
 *	Author: Jesse
 *
*/
//this is the new shit
//resize the images with the javascript external lib loadImage();
function manipulateImages(storage, i) {
	// console.log(storage[i]);
	loadImage(
		storage[i],
		function(newImg){
			templatingCanvas(newImg, storage, i);
			 // antiAlias(newImg, storage, i);
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
// function antiAlias(newImg,storage, i){
// 	var canvas = document.getElementById("canvas" + i);
//    	var ctx	= canvas.getContext("2d");
//    	console.log(canvas.toDataURL());
//    	var NewImg = canvas.toDataURL();
//    	NewImg = new Image();
//     console.log("blurry bitch");

// 	var oc = document.createElement('canvas'),
//     octx = oc.getContext('2d');

//     oc.width = inputWidth.value * 0.5;
//     oc.height = inputHeight.value * 0.5;
//     octx.drawImage(newImg,0,0, oc.width,oc.height);

//     /// step 2
//     octx.drawImage(oc,0,0,oc.width * 0.5,oc.height * 0.5);

//     canvas.width=inputWidth.value;
//     canvas.height=inputHeight.value;
//     console.log(canvas.width);
//     console.log(canvas.height);



//     ctx.drawImage(oc,0,0,oc.width * 0.5, oc.height * 0.5,
//                      0,0,canvas.width,canvas.height);
// 	  var oc  = document.createElement('canvas'),
//    octx = oc.getContext('2d');

	// oc.width  = newImg.width * 1.5;
	// oc.height = newImg.height * 1.5;

	// octx.drawImage(newImg, 0, 0, oc.width, oc.height);

	// octx.drawImage(oc, 0, 0, oc.width * 1.5, oc.height * 1.5);

	// // canvas.width = inputWidth.value;
	// // canvas.height = inputHeight.value;

	// ctx.drawImage(oc, 0, 0, oc.width * 1.5, oc.height * 1.5,
 //                  0, 0, canvas.width,   canvas.height);


//}


// problem with resizing image is that the image gets pixalated when using canvas
// this is happening because canvas uses image smoothing or Anti aliasing which makes the edges pixalated