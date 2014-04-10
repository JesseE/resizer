//clear collection
function collectionClear(){
	$("canvas").remove();
	storage.length = 0;
	dataStorage.length = 0;
	$("span img").remove();
}
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
function handleFileSelect(e) {
    var files = e.target.files; // FileList object
    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, len = e.target.files.length; i < len; i++) {
      // Only process image files.
      var f = files[i];
      if (!f.type.match('image.*')) {
        continue;
      }
      var reader = new FileReader();
      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          // Render thumbnail.
          var span = document.createElement('span');
          span.innerHTML = ['<img class="thumb" src="', e.target.result,
                            '" title="', escape(theFile.name), '"/>'].join('');
          document.getElementById('list').insertBefore(span, null);
        };
      })(f);
      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
    }

 }