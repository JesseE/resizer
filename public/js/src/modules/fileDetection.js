/*
 *	Adding filedetection functionality
 *	Author: Jesse
*/
//return the canvas images collection to detect wich file type is needed
function detectFileType(newImg, i){
    // canvas anti ailiasing not yet supported

    // var Canvas = document.getElementById('canvas'+ i)
	// var cTx = newImg.getContext("2d");
	// var CTX = document.getElementsByTagName('canvas');
	// cTx.webkitImageSmoothingEnabled = true;
	// cTx.mozImageSmoothingEnabled = true;
	// cTx.imageSmoothingEnabled = true;
	// console.log(cTx);
	console.log(storage[i].type);
	switch(storage[i].type) {
		case "image/jpeg":
			var DataURLJPG = newImg.toDataURL("image/jpeg");
			dataStorage.push(DataURLJPG);
		break;
		case "image/png":
			var DataURLPNG = newImg.toDataURL();
			dataStorage.push(DataURLPNG);
		break;
        //to data url doesnt support gif files
        //maybe search for an alternative
	}
}