/*
 *	Adding save in zip function
 *	Author: Jesse
*/

	//savable zip function
	function savable(aSaveMultiData, bSaveMultiData, i) {

		var zip = new JSZip();

		if(aSaveMultiData){
			for(var i = 0, f; f = aSaveMultiData[i]; i++){

				var aSavable = new Image();
				aSavable.src = aSaveMultiData[i];
				var aName = 'canvas'+i;
				zip.file(aName+".png", aSavable.src.substr(aSavable.src.indexOf(',')+1), {base64: true});
				}
		}else if(bSaveMultiData) {
			for(var i = 0, f; f = bSaveMultiData[i]; i++){

				var bSavable = new Image();
				bSavable.src = bSaveMultiData[i];
				var bName = 'canvas'+i;
				zip.file(bName+".png", bSavable.src.substr(bSavable.src.indexOf(',')+1), {base64: true});

			}
		}

		getDownloadZip(zip);

	}
	//download zip prompt
	function getDownloadZip(zip) {

		var url = window.URL.createObjectURL(zip.generate({type: "blob"}));
		location.href = url;

	}