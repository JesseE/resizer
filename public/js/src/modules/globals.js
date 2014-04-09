/*
 *	Adding global variables
 *	Author: Jesse
*/
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
// creating globals to be called in the desired functions
var inputWidth = document.getElementById('widthVal');
var inputHeight = document.getElementById('heightVal');
var storage = [];
var dataStorage = [];
// handlers to activate desired functions
document.getElementById("file-input").onchange = function(e){
	$('storage').remove();
	storage.length = 0;
	dataStorage.length = 0;
    uploadCollection(e);
};
document.getElementById("resize").onclick = function(){
	originalCollection(storage);
};
document.getElementById('download').onclick = function(){
	toZip(dataStorage);
};