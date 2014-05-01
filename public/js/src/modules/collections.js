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
function originalCollection(storage, cropFunction, alias) {
	if(cropFunction === true){
		for(var i = 0, len = storage.length; i < len; i++){
			cropImage(storage, i);
		}
	} else {
		for(var i = 0, len = storage.length; i < len; i++){
			manipulateImages(storage, i, alias);

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
	    return function(e) {
	    	oriDimensions.push(e.target.result);

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
function templatingCanvas(newImg, storage, i, alias) {
	// antiAlias(newImg, storage, i);
	if(alias = true) {
	 	antiAlias(newImg, storage, i);
	 	console.log("alias is true");
	}
 	var canvas = document.getElementById("canvas" + i);
 	var item = document.createElement('div');
 	var child = document.getElementById("item"+ i);
 	var mother = document.getElementById("items");

 	item.setAttribute("id", "item"+i);

 	//add canvas to parent
 	importCanvas(newImg, storage, i, item, mother, child);
	getDimensions(newImg, storage, i);

 	// update exiting canvas
 	if(canvas){
 		updateCanvas(newImg, canvas, child, mother);
 	}

}
function updateCanvas(newImg, canvas, child, mother) {
	//replace old canvas with the new canvas
	if(mother.hasChildNodes()){
		while(mother.firstChild){
			child.replaceChild(newImg, canvas);
				if($(child).hasClass("dimensions")){
					$(child).hasClass("dimensions").lastChild.remove();
				}
			$(mother.lastChild).remove();
		}
	}
}
//import canvas to the scene and start to detect which file types are used
function importCanvas(newImg, storage, i, item, mother, child){
	mother.insertBefore(item, null).appendChild(newImg).setAttribute('id', 'canvas'+i);
	detectFileType(newImg, i, storage[i].type);
}
function getDimensions(newImg, storage, i) {
	//get the canvas el widht + height
	var canvas = document.getElementById("canvas" + i);
	var div = document.createElement('div');
	var item = document.getElementById("item" + i);


	//add the dimensions div el
	div.setAttribute("class", "dimensions");
	div.innerHTML = ['<p>actual width: <span class="highlight">',newImg.width,
						'px</span>',' and actual height: <span class="highlight">',newImg.height,'px</span> </p>'].join('');

	//insert the widht and height values
	item.setAttribute("class", "item");
	item.style.width = canvas.width;
	item.style.height = canvas.height;

	//insert in the div
	item.appendChild(div);
}
