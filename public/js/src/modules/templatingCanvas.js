/*
 *	Templating and animation
 *	Author: Jesse
 *
 */
function templatingCanvas(newImg, storage, i, antiAlias) {
	//initiate antialiasing if set to true
	if (antiAlias == true) {
	 	setAntiAlias(newImg, storage, i);
	 	console.log(dataStorage);
	}

 	var canvas = document.getElementById("canvas" + i);
 	var item = document.createElement('div');
 	var child = document.getElementById("item"+ i);
 	var mother = document.getElementById("items");

 	item.setAttribute("id", "item"+i);

 	//add canvas to parent
 	importCanvas(newImg, storage, i, item, mother, child);
	getDimensions(newImg, storage, i);
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

	setDimensions(newImg, i, div, item, canvas);
}
function setDimensions(newImg, i, div, item, canvas){
	//add the dimensions div el
	div.setAttribute("class", "dimensions");

	div.innerHTML = ['<p>actual width: <span class="highlight">',newImg.width,
						'px</span>',' and actual height: <span class="highlight">',newImg.height,'px</span> </p>'].join('');

	//insert the width and height values
	item.setAttribute("class", "item");
	item.style.width = canvas.width;
	item.style.height = canvas.height;

	//insert in the div
	item.appendChild(div);
}
function animateCss(){
	$('#imagecollection').css({"left":"5%"});
}
function animateCssLeft(){
	$('.imagecollection').css({"left":"15%"});
}
function backToTop() {
	window.scrollTo(0,0);
}