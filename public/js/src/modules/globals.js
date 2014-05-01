/*
 *	Adding global variables
 *	Author: Jesse
*/
// creating globals to be called in the desired functions
var inputWidth = document.getElementById('widthVal');
var inputHeight = document.getElementById('heightVal');
var oriDimensions = [];
var storage = [];
var dataStorage = [];
var alias = false;
// handlers to activate desired functions
document.getElementById("file-input").onchange = function(e){
	$('.imagecollection').css({"left":"15%"});
	handleFileSelect(e);
	collectionClear();
    uploadCollection(e);
};
document.getElementById("resize").onclick = function(){
	animateCss();
	dataStorage.length =0;
	originalCollection(storage);
	window.scrollTo(0,0);
};
document.getElementById("edit").onclick = function(){
	animateCss();
	var cropFunction = true;
	originalCollection(storage, cropFunction);
};
document.getElementById('download').onclick = function(){
	toZip(dataStorage);
};
document.getElementById("clear").onclick = function() {
	collectionClear();
	document.getElementById("file-input").value="";
};
document.getElementById("antialias").onclick = function(){
	alias = true;
	if(alias = true){
		originalCollection(storage, alias);
		console.log(alias);
		console.log('alias is on');
	}
}
document.getElementById('to-top').onclick = function() {
	window.scrollTo(0,0);
};