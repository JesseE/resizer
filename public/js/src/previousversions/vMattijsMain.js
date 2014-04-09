// Main app namespace
var app = {
	init: function() {
		// Initialize all modules.
	}
};
/**
 * Responsive breakpoint registry
 */
app.responsive = {
	BREAKPOINT_SMALL: 680,
	BREAKPOINT_MEDIUM: 960,
	BREAKPOINT_LARGE: 1200,

	/**
	 * Read state of various breakpoints
	 */
	getCurrentBreakpoint: function() {
		var tries = ['small', 'medium', 'large'];
		var i = 0;
		var bp = 'small';

		do {
			bp = tries[i];
		} while (app.responsive.matchesBreakpoint(tries[++i]));
		return bp;
	},
	/**
	 * Read state of various breakpoints
	 */
	matchesBreakpoint: function(breakpoint) {
		switch (breakpoint) {
			case 'small':
				return document.documentElement.clientWidth >= this.BREAKPOINT_SMALL;
			case 'medium':
				return document.documentElement.clientWidth >= this.BREAKPOINT_MEDIUM;
			case 'large':
				return document.documentElement.clientWidth >= this.BREAKPOINT_LARGE;
		}
	}
};

/**
 * Add class to the body when scrolling.
 * This class disabled pointer-events in the CSS. Greatly enhanced performance.
 */
function disableHoverStylesOnScroll() {
	var body = document.body, timer;
	if (!body.classList || !window.addEventListener) {
		return;
	}
	window.addEventListener('scroll', function() {
		clearTimeout(timer);
		if(!body.classList.contains('disable-hover')) {
			body.classList.add('disable-hover');
		}

		timer = setTimeout(function() {
			body.classList.remove('disable-hover');
		}, 300);
	}, false);
}

$(function() {
	app.init();

	FastClick.attach(document.body);

	disableHoverStylesOnScroll();

	var cookie_msg = Garp.FlashMessage.parseCookie();
	if (cookie_msg) {
		var fm = new Garp.FlashMessage(cookie_msg);
		fm.show();
	}

	console.log('hoi');

		//CORS security error
		//globals

			var bucket = document.getElementById('bucket');
			var canvas = document.getElementsByTagName('canvas');

			var widthButton = document.getElementById('widthVal');
			var heightButton = document.getElementById('heightVal');

			var files = document.getElementsByTagName('img');

			var resizeButton = document.getElementById("resize");
			var cropButton = document.getElementById("crop");
			var downloadButton = document.getElementById("download");
			var upload = document.getElementById("files");

		function handleFileSelect(evt) {

		    var Files = evt.target.files;

		    var imageName = [];
		    var f, value;
		    console.log(Files.length);

		    for (var i = 0; i <= Files.length; i++) {
		    	f = Files[i];
		    	value = i;

			        var reader = new FileReader();

			        handleLoad(reader, e, value);

			        reader.readAsDataURL(f);

			    var Name = Files[i].name;

			    imageName.push(Name);
			}

		}

		function handleLoad(reader, e, value) {
			reader.onload = function() {
		        var img = new Image();
			    img.src = reader.result;

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

		document.getElementById('files').addEventListener('change', handleFileSelect, false);


		 //click functions

		resizeButton.onclick = function() {

			var width = widthButton.value;
			var height = heightButton.value;

			var aSaveMultiData = [];

			var zip = new JSZip();

			for (var i = 0, f; f = files[i]; i++) {

				var a = new obscura('#images'+i, '#canvas'+ i);

				a.resize([width, height],keepProportions=false,crop=false);

				var Canvas = document.getElementById('canvas'+i);

				var SaveData = Canvas.toDataURL("image/png");

				aSaveMultiData.push(SaveData);

				var savable = new Image();

				savable.src = aSaveMultiData[i];

				var name = 'canvas'+i;

				zip.file(name+".png", savable.src.substr(savable.src.indexOf(',')+1), {base64: true});

			}

			downloadButton.onclick = function() {
				var url = window.URL.createObjectURL(zip.generate({type: "blob"}));

				location.href = url;
			};

		};


		cropButton.onclick = function() {

			var width = widthButton.value;
			var height = heightButton.value;

			var bSaveMultiData = [];

			var zip = new JSZip();

			for (var i = files.length - 1; i >= 0; i--) {

				var a = new obscura('#images'+i, '#canvas'+ i);

				a.crop(0,0,width, height);

				var Canvas = document.getElementById('canvas'+i);

				var bSaveData = Canvas.toDataURL("image/png");

				bSaveMultiData.push(bSaveData);

				var savable = new Image();

				savable.src = bSaveMultiData[i];

				var name = 'canvas'+i;

				zip.file(name+".png", savable.src.substr(savable.src.indexOf(',')+1), {base64: true});

			}
			downloadButton.onclick = function() {
				var url = window.URL.createObjectURL(zip.generate({type: "blob"}));

				location.href = url;
			};

		};


});
