/*
 *	Adding filehandling functionality
 *	Author: Jesse
*/
	//selecting files to be uploaded
	function handleFileSelect(evt) {

	    var Files = evt.target.files;
	    var f, value;

	    for (var i = 0; i <= Files.length; i++) {
	    	f = Files[i];
	    	value = i;

	        var reader = new FileReader();

	        reader.readAsDataURL(f);

	        handleFileLoad(reader, value);

		}

	}
	//load image
	function handleFileLoad(reader, value) {

		reader.onload = function(e) {

	        var img = new Image();

	        var div = document.createElement('div');
	        div.innerHTML = ['<img id="images',+value,'" src="', e.target.result,
	        				'"width="',img.width,'"height="',img.height,'"/>'].join('');

	        document.getElementById('list').insertBefore(div, null);

	        var canvasCreate = document.createElement('canvas');
	        canvasCreate.id = 'canvas'+value;

	        var bucket = document.getElementById('bucket');
	        bucket.insertBefore(canvasCreate, null);

    	}

	}