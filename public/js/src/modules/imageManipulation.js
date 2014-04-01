/*
 *	Adding resizablity and copping functions
 *	Author: Jesse
*/

	//resize function
	function resizeAction(){

		var aSaveMultiData = [];

		for (var i = 0, f; f = files[i]; i++) {

			//get all the images with image ids and place new image in canvas
			//var a = new obscura('#images'+i, '#canvas'+ i);
			//a.resize([widthButton.value, heightButton.value], keepProportions=true, crop=true);

			var Canvas = document.getElementById('canvas'+i);
			var aSaveData = Canvas.toDataURL("image/png");

			aSaveMultiData.push(aSaveData);
		}

		savable(aSaveMultiData);

	}
	//crop function
	function cropAction() {

		var bSaveMultiData = [];

		for (var i = 0, f; f = files[i]; i++) {

			//get all the images with image ids and place new image in canvas
			//var b = new obscura('#images'+i, '#canvas'+ i);
			//b.crop(0,0,widthButton.value, heightButton.value);

			var Canvas = document.getElementById('canvas'+i);
			var bSaveData = Canvas.toDataURL("image/png");

			bSaveMultiData.push(bSaveData);
		}

		savable(bSaveMultiData);
	}