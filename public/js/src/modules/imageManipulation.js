/*
 *	Adding resizablity and cropping functions
 *	Author: Jesse
*/
 //resize the images with the javascript external lib loadImage();
    function manipulateImages(storage, i) {
    	// console.log(storage[i]);
    		loadImage(
	    		storage[i],
	    		function(newImg){
	    			document.getElementById('storage').appendChild(newImg).setAttribute('id', 'canvas'+i);
	    			detectFileType(newImg, i, storage[i].type);
	    		},
	    		{
	    			maxWidth: inputWidth.value,
	    			maxHeight: inputHeight.value,
	    			canvas:true
	    		}
	    	);
    }