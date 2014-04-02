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
        uploadCollection(e);
    };
    document.getElementById("resize").onclick = function(){
    	originalCollection(storage);
    };
    document.getElementById('download').onclick = function(){
    	toZip(dataStorage);
    };