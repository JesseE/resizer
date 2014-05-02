/*
 *	filehandling and reset values
 *	Author: Jesse
 *
 */
function clearCollection(){
	$("canvas").remove();
	//clear storage array's in order to remove filled array's
	dataStorage.length = 0;
	storage.length = 0;
	$("#images img").remove();
	$("#loader").css("width","0%");
	inputWidth.value = "";
	inputHeight.value = "";
	$("#items div").remove();
	$(".dimensions").remove();
}
//collecting all the uploaded images
function uploadCollection(e){
	for(var i = 0, len = e.target.files.length; i < len; i++){
        storage.push(e.target.files[i]);
    }
}
//when resize function needs to be called collect al the images first
function originalCollection(storage, antiAlias, cropFunction) {
	//clear mother of children in order to add new ones
	var mother = document.getElementById("items");
	mother.innerHTML = "";

	if(cropFunction == true) {
		for(var i = 0, len = storage.length; i < len; i++){
			cropImage(storage, i, antiAlias);
		}
	} else {
		for(var i = 0, len = storage.length; i < len; i++){
			manipulateImages(storage, i, antiAlias);
		}
	}
}
//preview of selected files
function handleFileSelect(e) {
	//collect uploaded files
    var files = e.target.files;

    // loop through each one and add preview
    // this loop works asynchronus
    // this loop wil finish first and for each item in the loop create an onload function which has an anonymous invoking function whitin that uses  the paramater
    // theFile in order to acces the name of the file in the filereader.
    // for each item uploaded it returns the templating function and pushes each location of the file to the Dimensions array

    for (var i = 0, len = e.target.files.length; i < len; i++) {
	    //bucket of files
	    var f = files[i];
	    //use the filereader api to get info about file
	    var reader = new FileReader;
	    //on file load
		reader.onload = (function(theFile) {
		    return function(e) {
		    	//push the original dimensios of uploaded image to array
		    	oriDimensions.push(e.target.result);
		    	//template preview for each uploaded image
				var div = document.createElement('div');
				div.setAttribute("id", "images");
				div.innerHTML = ['<img src="', e.target.result,
			                    '" title="', escape(theFile.name), '"/>'].join('');
				document.getElementById('imagecollection__list').appendChild(div, null);
	        };
	    })(f);
	    reader.readAsDataURL(f);
	}
}
