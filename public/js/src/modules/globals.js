/*
 *	Adding global variables
 *	Author: Jesse
*/
// creating globals to be called in the desired functions
var inputWidth = document.getElementById('widthVal');
var inputHeight = document.getElementById('heightVal');
var storage = [];
var dataStorage = [];
// handlers to activate desired functions
document.getElementById("file-input").onchange = function(e){
	$('#imagecollection').css({"left":"15%"});
	handleFileSelect(e);
	collectionClear();
    uploadCollection(e);
};
document.getElementById("clear").onclick = function() {
	collectionClear();
};
document.getElementById("resize").onclick = function(e){
	$('#imagecollection').css({"left":"5%"});
	originalCollection(storage);
	window.scrollTo(0,0);
};
document.getElementById('download').onclick = function(){
	toZip(dataStorage);
};
document.getElementById('to-top').onclick = function() {
	window.scrollTo(0,0);
};