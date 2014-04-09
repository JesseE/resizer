//collecting all the uploaded images
function uploadCollection(e){
	 for(var i = 0, len = e.target.files.length; i < len; i++){
        var files = e.target.files[i];
        storage.push(files);
    }
}
//when resize function needs to be called collect al the images first
function originalCollection(storage) {
	for(var i = 0, len = storage.length; i < len; i++){
		manipulateImages(storage, i);
	}
}