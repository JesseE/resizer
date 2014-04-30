/*
 *	Adding save in zip function
 *	Author: Jesse
*/
//return a zipped version of all the transformed images
function toZip() {
	var zip = new JSZip();
	for ( var i = 0, len = dataStorage.length; i < len; i++ ){
		var strings = dataStorage[i].substr(dataStorage[i].indexOf(',')+1);
		var name = storage[i].name;

		zip.file(name, strings, {base64: true});
	}

	var url = window.URL.createObjectURL(zip.generate({type: "blob"}));
	location.href = url;

	return;
}