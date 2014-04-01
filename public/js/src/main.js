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

	var inputWidth = document.getElementById('widthVal');
    var inputHeight = document.getElementById('heightVal');
	var bucket = [];
	var Databucket = [];

    document.getElementById("file-input").onchange = function(e){
        for(var i = 0, len = e.target.files.length; i < len; i++){
            var files = e.target.files[i];
            bucket.push(files);
        }
    };

    document.getElementById("resize").onclick = function(){
    	bucketCollection(bucket);
    };

    document.getElementById('download').onclick = function(){
    	toZip(Databucket);
    };

    function bucketCollection(bucket, i) {
    	for(var i = 0, len = bucket.length; i < len; i++){
    		resizeImages(bucket, i);
    	}
    }
    function resizeImages(bucket, i) {
    	//console.log(bucket[i]);
	    		loadImage(
		    		bucket[i],
		    		function(newImg){
		    			document.getElementById('bucket').appendChild(newImg).setAttribute('id', 'canvas'+i);
		    			collectionImages(newImg, i);
		    		},
		    		{
		    			maxWidth: inputWidth.value,
		    			maxHeight: inputHeight.value,
		    			canvas: true
		    		}
		    	);
    }
    function collectionImages(newImg, i){

    	// get the canvas elements
    	var Canvas = document.getElementById('canvas'+ i);

		//canvas image to data string
		var Dataurl = Canvas.toDataURL("images/png");

		//collection data urls
		Databucket.push(Dataurl);
		//get all Data urls and push them into the bucket
	}
	function toZip () {
		var zip = new JSZip();
		//console.log(Databucket);
		for(var i = 0, len = Databucket.length; i < len; i++) {
			var strings = Databucket[i].substr(Databucket[i].indexOf(',')+1);
			var name = 'canvas'+i;
			zip.file(name + '.png', strings, {base64: true});
		}
		var url = window.URL.createObjectURL(zip.generate({type: "blob"}));
		location.href = url;
		return;
	}
});

//all images are blob urls
//zip de blob urls

//download de zip

	//todo
		//upload image
			//append to list id
		//resize image
			//error
			//append to bucket id
		//download new image



    //test

    //how long will it take to scale 104 images to 200 x 200
        // 200mb 1min 53 sec
        // 100mb

     //how long will it take to scale 104 images to 400 x 400

    //how long will it take to scale 104 images to 600 x 600

     //how long will it take to scale 104 images to 800 x 800

      //how long will it take to scale 104 images to 1000 x 1000

