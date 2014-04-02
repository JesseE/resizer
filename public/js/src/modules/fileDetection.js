/*
 *	Adding filedetection functionality
 *	Author: Jesse
*/
    //return the canvas images collection to detect wich file type is needed
    function detectFileType(newImg, i){
    	//var Canvas = document.getElementById('canvas'+ i);
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
    	}
	}