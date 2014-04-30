/*
 *	Adding filedetection functionality
 *	Author: Jesse
*/
//return the canvas images collection to detect wich file type is needed
function detectFileType(newImg, i){
	loader(i);
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
//simple loader counts the amount of placed images from storage
function loader(i){
	storage.reverse();
	var index = ++i;
	// console.log((index/storage.length)*100);
	$('#loader').css("width" ,""+(index/storage.length)*100 +"%");
}