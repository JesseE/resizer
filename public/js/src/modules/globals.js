/*
 *	global variables
 *	Author: Jesse
*/
// creating globals to be called in the desired functions
var inputWidth = document.getElementById('widthVal');
var inputHeight = document.getElementById('heightVal');
var oriDimensions = [];
var storage = [];
var dataStorage = [];
var antiAlias = false;
var cropFunction = false;

document.getElementById("file-input").onchange = function(e){
	clearCollection();
	animateCssLeft();
	handleFileSelect(e);
    uploadCollection(e);
};
document.getElementById("resize").onclick = function(){
	resizeFunction = true;
	animateCss();
	dataStorage.length = 0;
	originalCollection(storage, antiAlias);
	backToTop();
};
document.getElementById("crop").onclick = function(){
	cropFunction = true;
	antiAlias = true;
	animateCss();
	originalCollection(storage, cropFunction, antiAlias);
};
document.getElementById('download').onclick = function(){
	toZip(dataStorage);
};
document.getElementById("clear").onclick = function() {
	clearCollection();
	document.getElementById("file-input").value="";
};
document.getElementById("antialias").onclick = function(){
	// still a bug here
	antiAlias = true;
	animateCss();
	originalCollection(storage, antiAlias);
	backToTop();
};
document.getElementById('to-top').onclick = function() {
	backToTop();
};
// document.getElementById('items').onclick = function() {
// 	console.log(this);
// };