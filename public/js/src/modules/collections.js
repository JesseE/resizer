function animateCss(){
	$('#imagecollection').css({"left":"5%"});
}
//methodes to clear collection
function collectionClear(){
	$("canvas").remove();
	storage.length = 0;
	dataStorage.length = 0;
	$("#images img").remove();
	$("#loader").css("width","0%");
	inputWidth.value = "";
	inputHeight.value = "";
}
//collecting all the uploaded images
function uploadCollection(e){
	for(var i = 0, len = e.target.files.length; i < len; i++){
        storage.push(e.target.files[i]);
    }
}
//when resize function needs to be called collect al the images first
function originalCollection(storage, cropFunction) {
	if(cropFunction === true){
		for(var i = 0, len = storage.length; i < len; i++){
			cropImage(storage, i);
		}
	} else {
		for(var i = 0, len = storage.length; i < len; i++){
			manipulateImages(storage, i);
		}
	}
}
function handleFileSelect(e) {
    var files = e.target.files;
    for (var i = 0, len = e.target.files.length; i < len; i++) {
      var f = files[i];
      var reader = new FileReader();
      reader.onload = (function(theFile) {
        return function(e) {
          var div = document.createElement('div');
          div.setAttribute("id", "images");
          div.innerHTML = ['<img src="', e.target.result,
                            '" title="', escape(theFile.name), '"/>'].join('');
          document.getElementById('imagecollection__list').insertBefore(div, null);
        };
      })(f);
      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
    }
 }
 function templatingCanvas(newImg, storage, i) {
	document.getElementById('outputfiles__storage').appendChild(newImg).setAttribute('id', 'canvas'+i);
	detectFileType(newImg, i, storage[i].type);
	// console.log("cropped");
}
