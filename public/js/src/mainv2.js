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

//     'use strict';

//             var bucket = document.getElementById('bucket');
//             var canvas = document.getElementsByTagName('canvas');

//             var widthValue = document.getElementById('widthVal');
//             var heightValue = document.getElementById('heightVal');

//             var files = document.getElementsByTagName('img');

//             // var resizeButton = document.getElementById("resize");
//             // var cropButton = document.getElementById("crop");

//             var downloadButton = document.getElementById("download");
//             var upload = document.getElementById("files");

//     var result = $('#result'),
//         //exifNode = $('#exif'),
//         thumbNode = $('#thumbnail'),
//         actionsNode = $('#actions'),
//         currentFile,
//         replaceResults = function (img) {
//             var content;
//             if (!(img.src || img instanceof HTMLCanvasElement)) {
//                 content = $('<span>Loading image file failed</span>');
//             } else {
//             	//detect if image png or jpeg
//             	if( currentFile.type.match("image/png")){
//                 content = $('<a target="_blank">').append(img)
//                     .attr('download', currentFile.name)
//                     .attr('href', img.src || img.toDataURL("image/png"));
//             	} else if(currentFile.type.match("image/jpeg")){
//             	content = $('<a target="_blank">').append(img)
//                     .attr('download', currentFile.name)
//                     .attr('href', img.src || img.toDataURL("image/jpeg"));
//             	} else if(currentFile.type.match("image/gif")) {
//                 content = $('<a target="_blank">').append(img)
//                     .attr('download', currentFile.name)
//                     .attr('href',img.src || img.toDataURL("image/gif"));
//                 }
//             }
//             /*result.children().replaceWith(content);
//             if (img.getContext) {
//                 actionsNode.show();
//             }*/
//         },
//         // displayImage = function (file, options) {
//         //     currentFile = file;
//         //     if (!loadImage(
//         //             file,
//         //             replaceResults,
//         //             options
//         //         )) {
//         //         result.children().replaceWith(
//         //             $('<span>Your browser does not support the URL or FileReader API.</span>')
//         //         );
//         //     }
//         // },
//         dropChangeHandler = function (e) {

//             e.preventDefault();

//             e = e.originalEvent;
//             var target = e.dataTransfer || e.target;

//             var Files = target.files;

//             handleFileSelect(Files);
//             // for (var i = 0; i <= Files.length; i++) {
//             //     f = Files[i];
//             //     value = i;

//             //     loadImage = (
//             //         {
//             //             canvas:true
//             //         }
//             //     );
//             //     console.log(loadImage);

//             //     var reader = new FileReader();

//             //     reader.readAsDataURL(f);

//             //     handleFileLoad(reader, value);

//             // }
//                 /*
//                 var target = e.dataTransfer || e.target,
//                     files = target && target.files[i] && target.files[i],
//                     options = {
//                         maxWidth: result.width(),
//                         canvas: true
//                     };

//             }
//             if (!file) {
//                 return;*/

//             /*
//             // exifNode.hide();
//             thumbNode.hide();
//             loadImage.parseMetaData(file, function (data) {
//                 // if (data.exif) {
//                 //     options.orientation = data.exif.get('Orientation');
//                 //     displayExifData(data.exif);
//                 // }
//                 displayImage(file, options);
//             });*/

//         },
//         coordinates;


//     // Hide URL/FileReader API requirement message in capable browsers:
//      if (window.createObjectURL || window.URL || window.webkitURL || window.FileReader) {
//         result.children().hide();
//      }


//     $(document)
//         .on('dragover', function (e) {
//             e.preventDefault();
//             e = e.originalEvent;
//             e.dataTransfer.dropEffect = 'copy';
//         })
//         .on('drop', dropChangeHandler);

//     $('#file-input').on('change', dropChangeHandler);

//     $('#edit').on('click', function (event) {


//         var scaledImage = loadImage.scale(
//             img, // img or canvas element
//             {maxWidth: 600}
//         );

//         // event.preventDefault();
//         // var imgNode = result.find('img, canvas'),
//         //     img = imgNode[0];

//         // console.log(imgNode);

//         // imgNode.Jcrop({
//         //     setSelect: [40, 40, img.width - 40, img.height - 40],
//         //     onSelect: function (coords) {
//         //         coordinates = coords;
//         //     },
//         //     onRelease: function () {
//         //         coordinates = null;
//         //     }
//         // }).parent().on('click', function (event) {
//         //     event.preventDefault();
//         // });
//     });

//     $('#crop').on('click', function (event) {
//         // event.preventDefault();
//         // var img = result.find('img, canvas')[0];
//         // if (img && coordinates) {
//         //     replaceResults(loadImage.scale(img, {
//         //         left: coordinates.x,
//         //         top: coordinates.y,
//         //         sourceWidth: coordinates.w,
//         //         sourceHeight: coordinates.h,
//         //         maxWidth: result.width()
//         //     }));
//         //     coordinates = null;
//         // }
//     });
// });
