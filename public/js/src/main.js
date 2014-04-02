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
	    			collectionImages(newImg, i, bucket[i].type);
	    		},
	    		{
	    			maxWidth: inputWidth.value,
	    			maxHeight: inputHeight.value,
	    			canvas: true
	    		}
	    	);
    }
    function collectionImages(newImg, i){
    	var Canvas = document.getElementById('canvas'+ i);
    	if(bucket[i].type=="image/jpeg"){
    		var DataURLJPG = Canvas.toDataURL("image/jpeg");
    		Databucket.push(DataURLJPG);
    	} else if(bucket[i].type=="image/png"){
    		var DataURLPNG = Canvas.toDataURL("image/png");
    		Databucket.push(DataURLPNG);
    	} else if(bucket[i].type=="image/gif"){
    		var DataURLGIF = Canvas.toDataURL("image/gif");
    		Databucket.push(DataURLGIF);
    	}
	}
	function detectFileType(){
		for(var i = 0, len = bucket.length; i < len; i++) {
		}
	}
	function toZip () {
		var zip = new JSZip();
		//console.log(Databucket);
		for(var i = 0, len = Databucket.length; i < len; i++) {
			var strings = Databucket[i].substr(Databucket[i].indexOf(',')+1);
			var name = bucket[i].name;
			zip.file(name, strings, {base64: true});
		}
		var url = window.URL.createObjectURL(zip.generate({type: "blob"}));
		location.href = url;
		return;
	}
});