function animateCss(){
	$('#imagecollection').css({"left":"5%"});
}
//garbage collection
function collectionClear(){
	$("canvas").remove();
	storage.length = 0;
	dataStorage.length = 0;
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
//preview of selected files
function handleFileSelect(e) {
    var files = e.target.files;
    	for (var i = 0, len = e.target.files.length; i < len; i++) {

      var f = files[i];
      var reader = new FileReader;

    	reader.onload = (function(theFile) {

	        var img = new Image;
	        img.onload = function() {
	            console.log(img.width);
	        };
	        return function(e) {
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
// add specific classes
function templatingCanvas(newImg, storage, i) {
 	var canvas = document.getElementById("canvas" + i);
 	var item = document.createElement('div');
 	var father = document.getElementById("item"+ i);
 	var mother = document.getElementById("items");
 	//if canvas already exits


 	item.setAttribute("id", "item"+i);

 	importCanvas(newImg, storage, i, item, mother, father);

 	if(canvas){
 		updateCanvas(newImg, canvas, father, mother);
 	}
}
function updateCanvas(newImg, canvas, father, mother) {
	//replace old canvas with the new canvas
	console.log(canvas);
	console.log(newImg);
	// if mother ('#items') has children
	// then remove the childeren

	if(mother.hasChildNodes()){
		console.log(mother);
		//it doesnt replace the canvas when using multiple canvases at once
			// mother.removeChild(mother.firstChild);

			// father.removeChild(father.firstChild);

		while(mother.firstChild){
			mother.removeChild(mother.firstChild);
		}
		//father.replaceChild(canvas, newImg);
		// father.appendChild(newImg);
		//father.replaceChild(newImg, canvas);
	}
	// if(mother.hasChildNodes()){
	// 	father.removeChild(father.lastChild);
	// 	mother.removeChild(mother.lastChild);
	// }

}
//import canvas to the scene and start to detect which file types are used
function importCanvas(newImg, storage, i, item, mother, father){
	mother.insertBefore(item, null).appendChild(newImg).setAttribute('id', 'canvas'+i);
	detectFileType(newImg, i, storage[i].type);
}
