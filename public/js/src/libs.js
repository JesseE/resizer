/*
 * JavaScript Load Image 1.9.0
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true */
/*global define, window, document, URL, webkitURL, Blob, File, FileReader */

(function ($) {
    'use strict';

    // Loads an image for a given File object.
    // Invokes the callback with an img or optional canvas
    // element (if supported by the browser) as parameter:
    var loadImage = function (file, callback, options) {
            var img = document.createElement('img'),
                url,
                oUrl;
            img.onerror = callback;
            img.onload = function () {
                if (oUrl && !(options && options.noRevoke)) {
                    loadImage.revokeObjectURL(oUrl);
                }
                if (callback) {
                    callback(loadImage.scale(img, options));
                }
            };
            if (loadImage.isInstanceOf('Blob', file) ||
                    // Files are also Blob instances, but some browsers
                    // (Firefox 3.6) support the File API but not Blobs:
                    loadImage.isInstanceOf('File', file)) {
                url = oUrl = loadImage.createObjectURL(file);
                // Store the file type for resize processing:
                img._type = file.type;
            } else if (typeof file === 'string') {
                url = file;
                if (options && options.crossOrigin) {
                    img.crossOrigin = options.crossOrigin;
                }
            } else {
                return false;
            }
            if (url) {
                img.src = url;
                return img;
            }
            return loadImage.readFile(file, function (e) {
                var target = e.target;
                if (target && target.result) {
                    img.src = target.result;
                } else {
                    if (callback) {
                        callback(e);
                    }
                }
            });
        },
        // The check for URL.revokeObjectURL fixes an issue with Opera 12,
        // which provides URL.createObjectURL but doesn't properly implement it:
        urlAPI = (window.createObjectURL && window) ||
            (window.URL && URL.revokeObjectURL && URL) ||
            (window.webkitURL && webkitURL);

    loadImage.isInstanceOf = function (type, obj) {
        // Cross-frame instanceof check
        return Object.prototype.toString.call(obj) === '[object ' + type + ']';
    };

    // Transform image coordinates, allows to override e.g.
    // the canvas orientation based on the orientation option,
    // gets canvas, options passed as arguments:
    loadImage.transformCoordinates = function () {
        return;
    };

    // Returns transformed options, allows to override e.g.
    // coordinate and dimension options based on the orientation:
    loadImage.getTransformedOptions = function (options) {
        return options;
    };

    // Canvas render method, allows to override the
    // rendering e.g. to work around issues on iOS:
    loadImage.renderImageToCanvas = function (
        canvas,
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight
    ) {
        canvas.getContext('2d').drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            destX,
            destY,
            destWidth,
            destHeight
        );
        return canvas;
    };

    // This method is used to determine if the target image
    // should be a canvas element:
    loadImage.hasCanvasOption = function (options) {
        return options.canvas || options.crop;
    };

    // Scales and/or crops the given image (img or canvas HTML element)
    // using the given options.
    // Returns a canvas object if the browser supports canvas
    // and the hasCanvasOption method returns true or a canvas
    // object is passed as image, else the scaled image:
    loadImage.scale = function (img, options) {
        options = options || {};
        var canvas = document.createElement('canvas'),
            useCanvas = img.getContext ||
                (loadImage.hasCanvasOption(options) && canvas.getContext),
            width = img.naturalWidth || img.width,
            height = img.naturalHeight || img.height,
            destWidth = width,
            destHeight = height,
            maxWidth,
            maxHeight,
            minWidth,
            minHeight,
            sourceWidth,
            sourceHeight,
            sourceX,
            sourceY,
            tmp,
            scaleUp = function () {
                var scale = Math.max(
                    (minWidth || destWidth) / destWidth,
                    (minHeight || destHeight) / destHeight
                );
                if (scale > 1) {
                    destWidth = Math.ceil(destWidth * scale);
                    destHeight = Math.ceil(destHeight * scale);
                }
            },
            scaleDown = function () {
                var scale = Math.min(
                    (maxWidth || destWidth) / destWidth,
                    (maxHeight || destHeight) / destHeight
                );
                if (scale < 1) {
                    destWidth = Math.ceil(destWidth * scale);
                    destHeight = Math.ceil(destHeight * scale);
                }
            };
        if (useCanvas) {
            options = loadImage.getTransformedOptions(options);
            sourceX = options.left || 0;
            sourceY = options.top || 0;
            if (options.sourceWidth) {
                sourceWidth = options.sourceWidth;
                if (options.right !== undefined && options.left === undefined) {
                    sourceX = width - sourceWidth - options.right;
                }
            } else {
                sourceWidth = width - sourceX - (options.right || 0);
            }
            if (options.sourceHeight) {
                sourceHeight = options.sourceHeight;
                if (options.bottom !== undefined && options.top === undefined) {
                    sourceY = height - sourceHeight - options.bottom;
                }
            } else {
                sourceHeight = height - sourceY - (options.bottom || 0);
            }
            destWidth = sourceWidth;
            destHeight = sourceHeight;
        }
        maxWidth = options.maxWidth;
        maxHeight = options.maxHeight;
        minWidth = options.minWidth;
        minHeight = options.minHeight;
        if (useCanvas && maxWidth && maxHeight && options.crop) {
            destWidth = maxWidth;
            destHeight = maxHeight;
            tmp = sourceWidth / sourceHeight - maxWidth / maxHeight;
            if (tmp < 0) {
                sourceHeight = maxHeight * sourceWidth / maxWidth;
                if (options.top === undefined && options.bottom === undefined) {
                    sourceY = (height - sourceHeight) / 2;
                }
            } else if (tmp > 0) {
                sourceWidth = maxWidth * sourceHeight / maxHeight;
                if (options.left === undefined && options.right === undefined) {
                    sourceX = (width - sourceWidth) / 2;
                }
            }
        } else {
            if (options.contain || options.cover) {
                minWidth = maxWidth = maxWidth || minWidth;
                minHeight = maxHeight = maxHeight || minHeight;
            }
            if (options.cover) {
                scaleDown();
                scaleUp();
            } else {
                scaleUp();
                scaleDown();
            }
        }
        if (useCanvas) {
            canvas.width = destWidth;
            canvas.height = destHeight;
            loadImage.transformCoordinates(
                canvas,
                options
            );
            return loadImage.renderImageToCanvas(
                canvas,
                img,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                destWidth,
                destHeight
            );
        }
        img.width = destWidth;
        img.height = destHeight;
        return img;
    };

    loadImage.createObjectURL = function (file) {
        return urlAPI ? urlAPI.createObjectURL(file) : false;
    };

    loadImage.revokeObjectURL = function (url) {
        return urlAPI ? urlAPI.revokeObjectURL(url) : false;
    };

    // Loads a given File object via FileReader interface,
    // invokes the callback with the event object (load or error).
    // The result can be read via event.target.result:
    loadImage.readFile = function (file, callback, method) {
        if (window.FileReader) {
            var fileReader = new FileReader();
            fileReader.onload = fileReader.onerror = callback;
            method = method || 'readAsDataURL';
            if (fileReader[method]) {
                fileReader[method](file);
                return fileReader;
            }
        }
        return false;
    };

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return loadImage;
        });
    } else {
        $.loadImage = loadImage;
    }
}(this));

/*
 * JavaScript Load Image iOS scaling fixes 1.0.3
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * iOS image scaling fixes based on
 * https://github.com/stomita/ios-imagefile-megapixel
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, bitwise: true */
/*global define, window, document */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['load-image'], factory);
    } else {
        // Browser globals:
        factory(window.loadImage);
    }
}(function (loadImage) {
    'use strict';

    // Only apply fixes on the iOS platform:
    if (!window.navigator || !window.navigator.platform ||
             !(/iP(hone|od|ad)/).test(window.navigator.platform)) {
        return;
    }

    var originalRenderMethod = loadImage.renderImageToCanvas;

    // Detects subsampling in JPEG images:
    loadImage.detectSubsampling = function (img) {
        var canvas,
            context;
        if (img.width * img.height > 1024 * 1024) { // only consider mexapixel images
            canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            context = canvas.getContext('2d');
            context.drawImage(img, -img.width + 1, 0);
            // subsampled image becomes half smaller in rendering size.
            // check alpha channel value to confirm image is covering edge pixel or not.
            // if alpha value is 0 image is not covering, hence subsampled.
            return context.getImageData(0, 0, 1, 1).data[3] === 0;
        }
        return false;
    };

    // Detects vertical squash in JPEG images:
    loadImage.detectVerticalSquash = function (img, subsampled) {
        var naturalHeight = img.naturalHeight || img.height,
            canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            data,
            sy,
            ey,
            py,
            alpha;
        if (subsampled) {
            naturalHeight /= 2;
        }
        canvas.width = 1;
        canvas.height = naturalHeight;
        context.drawImage(img, 0, 0);
        data = context.getImageData(0, 0, 1, naturalHeight).data;
        // search image edge pixel position in case it is squashed vertically:
        sy = 0;
        ey = naturalHeight;
        py = naturalHeight;
        while (py > sy) {
            alpha = data[(py - 1) * 4 + 3];
            if (alpha === 0) {
                ey = py;
            } else {
                sy = py;
            }
            py = (ey + sy) >> 1;
        }
        return (py / naturalHeight) || 1;
    };

    // Renders image to canvas while working around iOS image scaling bugs:
    // https://github.com/blueimp/JavaScript-Load-Image/issues/13
    loadImage.renderImageToCanvas = function (
        canvas,
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight
    ) {
        if (img._type === 'image/jpeg') {
            var context = canvas.getContext('2d'),
                tmpCanvas = document.createElement('canvas'),
                tileSize = 1024,
                tmpContext = tmpCanvas.getContext('2d'),
                subsampled,
                vertSquashRatio,
                tileX,
                tileY;
            tmpCanvas.width = tileSize;
            tmpCanvas.height = tileSize;
            context.save();
            subsampled = loadImage.detectSubsampling(img);
            if (subsampled) {
                sourceX /= 2;
                sourceY /= 2;
                sourceWidth /= 2;
                sourceHeight /= 2;
            }
            vertSquashRatio = loadImage.detectVerticalSquash(img, subsampled);
            if (subsampled || vertSquashRatio !== 1) {
                sourceY *= vertSquashRatio;
                destWidth = Math.ceil(tileSize * destWidth / sourceWidth);
                destHeight = Math.ceil(
                    tileSize * destHeight / sourceHeight / vertSquashRatio
                );
                destY = 0;
                tileY = 0;
                while (tileY < sourceHeight) {
                    destX = 0;
                    tileX = 0;
                    while (tileX < sourceWidth) {
                        tmpContext.clearRect(0, 0, tileSize, tileSize);
                        tmpContext.drawImage(
                            img,
                            sourceX,
                            sourceY,
                            sourceWidth,
                            sourceHeight,
                            -tileX,
                            -tileY,
                            sourceWidth,
                            sourceHeight
                        );
                        context.drawImage(
                            tmpCanvas,
                            0,
                            0,
                            tileSize,
                            tileSize,
                            destX,
                            destY,
                            destWidth,
                            destHeight
                        );
                        tileX += tileSize;
                        destX += destWidth;
                    }
                    tileY += tileSize;
                    destY += destHeight;
                }
                context.restore();
                return canvas;
            }
        }
        return originalRenderMethod(
            canvas,
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            destX,
            destY,
            destWidth,
            destHeight
        );
    };

}));

/*
 * JavaScript Load Image Orientation 1.0.0
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*global define, window */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['load-image'], factory);
    } else {
        // Browser globals:
        factory(window.loadImage);
    }
}(function (loadImage) {
    'use strict';

    var originalHasCanvasOptionMethod = loadImage.hasCanvasOption;

    // This method is used to determine if the target image
    // should be a canvas element:
    loadImage.hasCanvasOption = function (options) {
        return originalHasCanvasOptionMethod(options) || options.orientation;
    };

    // Transform image orientation based on
    // the given EXIF orientation option:
    loadImage.transformCoordinates = function (canvas, options) {
        var ctx = canvas.getContext('2d'),
            width = canvas.width,
            height = canvas.height,
            orientation = options.orientation;
        if (!orientation) {
            return;
        }
        if (orientation > 4) {
            canvas.width = height;
            canvas.height = width;
        }
        switch (orientation) {
        case 2:
            // horizontal flip
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            break;
        case 3:
            // 180° rotate left
            ctx.translate(width, height);
            ctx.rotate(Math.PI);
            break;
        case 4:
            // vertical flip
            ctx.translate(0, height);
            ctx.scale(1, -1);
            break;
        case 5:
            // vertical flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.scale(1, -1);
            break;
        case 6:
            // 90° rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(0, -height);
            break;
        case 7:
            // horizontal flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(width, -height);
            ctx.scale(-1, 1);
            break;
        case 8:
            // 90° rotate left
            ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-width, 0);
            break;
        }
    };

    // Transforms coordinate and dimension options
    // based on the given orientation option:
    loadImage.getTransformedOptions = function (options) {
        if (!options.orientation || options.orientation === 1) {
            return options;
        }
        var newOptions = {},
            i;
        for (i in options) {
            if (options.hasOwnProperty(i)) {
                newOptions[i] = options[i];
            }
        }
        switch (options.orientation) {
        case 2:
            // horizontal flip
            newOptions.left = options.right;
            newOptions.right = options.left;
            break;
        case 3:
            // 180° rotate left
            newOptions.left = options.right;
            newOptions.top = options.bottom;
            newOptions.right = options.left;
            newOptions.bottom = options.top;
            break;
        case 4:
            // vertical flip
            newOptions.top = options.bottom;
            newOptions.bottom = options.top;
            break;
        case 5:
            // vertical flip + 90 rotate right
            newOptions.left = options.top;
            newOptions.top = options.left;
            newOptions.right = options.bottom;
            newOptions.bottom = options.right;
            break;
        case 6:
            // 90° rotate right
            newOptions.left = options.top;
            newOptions.top = options.right;
            newOptions.right = options.bottom;
            newOptions.bottom = options.left;
            break;
        case 7:
            // horizontal flip + 90 rotate right
            newOptions.left = options.bottom;
            newOptions.top = options.right;
            newOptions.right = options.top;
            newOptions.bottom = options.left;
            break;
        case 8:
            // 90° rotate left
            newOptions.left = options.bottom;
            newOptions.top = options.left;
            newOptions.right = options.top;
            newOptions.bottom = options.right;
            break;
        }
        if (options.orientation > 4) {
            newOptions.maxWidth = options.maxHeight;
            newOptions.maxHeight = options.maxWidth;
            newOptions.minWidth = options.minHeight;
            newOptions.minHeight = options.minWidth;
            newOptions.sourceWidth = options.sourceHeight;
            newOptions.sourceHeight = options.sourceWidth;
        }
        return newOptions;
    };

}));

/*
 * JavaScript Load Image Meta 1.0.2
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Image meta data handling implementation
 * based on the help and contribution of
 * Achim Stöhr.
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint continue:true */
/*global define, window, DataView, Blob, Uint8Array, console */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['load-image'], factory);
    } else {
        // Browser globals:
        factory(window.loadImage);
    }
}(function (loadImage) {
    'use strict';

    var hasblobSlice = window.Blob && (Blob.prototype.slice ||
            Blob.prototype.webkitSlice || Blob.prototype.mozSlice);

    loadImage.blobSlice = hasblobSlice && function () {
        var slice = this.slice || this.webkitSlice || this.mozSlice;
        return slice.apply(this, arguments);
    };

    loadImage.metaDataParsers = {
        jpeg: {
            0xffe1: [] // APP1 marker
        }
    };

    // Parses image meta data and calls the callback with an object argument
    // with the following properties:
    // * imageHead: The complete image head as ArrayBuffer (Uint8Array for IE10)
    // The options arguments accepts an object and supports the following properties:
    // * maxMetaDataSize: Defines the maximum number of bytes to parse.
    // * disableImageHead: Disables creating the imageHead property.
    loadImage.parseMetaData = function (file, callback, options) {
        options = options || {};
        var that = this,
            // 256 KiB should contain all EXIF/ICC/IPTC segments:
            maxMetaDataSize = options.maxMetaDataSize || 262144,
            data = {},
            noMetaData = !(window.DataView  && file && file.size >= 12 &&
                file.type === 'image/jpeg' && loadImage.blobSlice);
        if (noMetaData || !loadImage.readFile(
                loadImage.blobSlice.call(file, 0, maxMetaDataSize),
                function (e) {
                    if (e.target.error) {
                        // FileReader error
                        console.log(e.target.error);
                        callback(data);
                        return;
                    }
                    // Note on endianness:
                    // Since the marker and length bytes in JPEG files are always
                    // stored in big endian order, we can leave the endian parameter
                    // of the DataView methods undefined, defaulting to big endian.
                    var buffer = e.target.result,
                        dataView = new DataView(buffer),
                        offset = 2,
                        maxOffset = dataView.byteLength - 4,
                        headLength = offset,
                        markerBytes,
                        markerLength,
                        parsers,
                        i;
                    // Check for the JPEG marker (0xffd8):
                    if (dataView.getUint16(0) === 0xffd8) {
                        while (offset < maxOffset) {
                            markerBytes = dataView.getUint16(offset);
                            // Search for APPn (0xffeN) and COM (0xfffe) markers,
                            // which contain application-specific meta-data like
                            // Exif, ICC and IPTC data and text comments:
                            if ((markerBytes >= 0xffe0 && markerBytes <= 0xffef) ||
                                    markerBytes === 0xfffe) {
                                // The marker bytes (2) are always followed by
                                // the length bytes (2), indicating the length of the
                                // marker segment, which includes the length bytes,
                                // but not the marker bytes, so we add 2:
                                markerLength = dataView.getUint16(offset + 2) + 2;
                                if (offset + markerLength > dataView.byteLength) {
                                    console.log('Invalid meta data: Invalid segment size.');
                                    break;
                                }
                                parsers = loadImage.metaDataParsers.jpeg[markerBytes];
                                if (parsers) {
                                    for (i = 0; i < parsers.length; i += 1) {
                                        parsers[i].call(
                                            that,
                                            dataView,
                                            offset,
                                            markerLength,
                                            data,
                                            options
                                        );
                                    }
                                }
                                offset += markerLength;
                                headLength = offset;
                            } else {
                                // Not an APPn or COM marker, probably safe to
                                // assume that this is the end of the meta data
                                break;
                            }
                        }
                        // Meta length must be longer than JPEG marker (2)
                        // plus APPn marker (2), followed by length bytes (2):
                        if (!options.disableImageHead && headLength > 6) {
                            if (buffer.slice) {
                                data.imageHead = buffer.slice(0, headLength);
                            } else {
                                // Workaround for IE10, which does not yet
                                // support ArrayBuffer.slice:
                                data.imageHead = new Uint8Array(buffer)
                                    .subarray(0, headLength);
                            }
                        }
                    } else {
                        console.log('Invalid JPEG file: Missing JPEG marker.');
                    }
                    callback(data);
                },
                'readAsArrayBuffer'
            )) {
            callback(data);
        }
    };

}));

/*
 * JavaScript Load Image Exif Parser 1.0.0
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint unparam: true */
/*global define, window, console */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['load-image', 'load-image-meta'], factory);
    } else {
        // Browser globals:
        factory(window.loadImage);
    }
}(function (loadImage) {
    'use strict';

    loadImage.ExifMap = function () {
        return this;
    };

    loadImage.ExifMap.prototype.map = {
        'Orientation': 0x0112
    };

    loadImage.ExifMap.prototype.get = function (id) {
        return this[id] || this[this.map[id]];
    };

    loadImage.getExifThumbnail = function (dataView, offset, length) {
        var hexData,
            i,
            b;
        if (!length || offset + length > dataView.byteLength) {
            console.log('Invalid Exif data: Invalid thumbnail data.');
            return;
        }
        hexData = [];
        for (i = 0; i < length; i += 1) {
            b = dataView.getUint8(offset + i);
            hexData.push((b < 16 ? '0' : '') + b.toString(16));
        }
        return 'data:image/jpeg,%' + hexData.join('%');
    };

    loadImage.exifTagTypes = {
        // byte, 8-bit unsigned int:
        1: {
            getValue: function (dataView, dataOffset) {
                return dataView.getUint8(dataOffset);
            },
            size: 1
        },
        // ascii, 8-bit byte:
        2: {
            getValue: function (dataView, dataOffset) {
                return String.fromCharCode(dataView.getUint8(dataOffset));
            },
            size: 1,
            ascii: true
        },
        // short, 16 bit int:
        3: {
            getValue: function (dataView, dataOffset, littleEndian) {
                return dataView.getUint16(dataOffset, littleEndian);
            },
            size: 2
        },
        // long, 32 bit int:
        4: {
            getValue: function (dataView, dataOffset, littleEndian) {
                return dataView.getUint32(dataOffset, littleEndian);
            },
            size: 4
        },
        // rational = two long values, first is numerator, second is denominator:
        5: {
            getValue: function (dataView, dataOffset, littleEndian) {
                return dataView.getUint32(dataOffset, littleEndian) /
                    dataView.getUint32(dataOffset + 4, littleEndian);
            },
            size: 8
        },
        // slong, 32 bit signed int:
        9: {
            getValue: function (dataView, dataOffset, littleEndian) {
                return dataView.getInt32(dataOffset, littleEndian);
            },
            size: 4
        },
        // srational, two slongs, first is numerator, second is denominator:
        10: {
            getValue: function (dataView, dataOffset, littleEndian) {
                return dataView.getInt32(dataOffset, littleEndian) /
                    dataView.getInt32(dataOffset + 4, littleEndian);
            },
            size: 8
        }
    };
    // undefined, 8-bit byte, value depending on field:
    loadImage.exifTagTypes[7] = loadImage.exifTagTypes[1];

    loadImage.getExifValue = function (dataView, tiffOffset, offset, type, length, littleEndian) {
        var tagType = loadImage.exifTagTypes[type],
            tagSize,
            dataOffset,
            values,
            i,
            str,
            c;
        if (!tagType) {
            console.log('Invalid Exif data: Invalid tag type.');
            return;
        }
        tagSize = tagType.size * length;
        // Determine if the value is contained in the dataOffset bytes,
        // or if the value at the dataOffset is a pointer to the actual data:
        dataOffset = tagSize > 4 ?
                tiffOffset + dataView.getUint32(offset + 8, littleEndian) : (offset + 8);
        if (dataOffset + tagSize > dataView.byteLength) {
            console.log('Invalid Exif data: Invalid data offset.');
            return;
        }
        if (length === 1) {
            return tagType.getValue(dataView, dataOffset, littleEndian);
        }
        values = [];
        for (i = 0; i < length; i += 1) {
            values[i] = tagType.getValue(dataView, dataOffset + i * tagType.size, littleEndian);
        }
        if (tagType.ascii) {
            str = '';
            // Concatenate the chars:
            for (i = 0; i < values.length; i += 1) {
                c = values[i];
                // Ignore the terminating NULL byte(s):
                if (c === '\u0000') {
                    break;
                }
                str += c;
            }
            return str;
        }
        return values;
    };

    loadImage.parseExifTag = function (dataView, tiffOffset, offset, littleEndian, data) {
        var tag = dataView.getUint16(offset, littleEndian);
        data.exif[tag] = loadImage.getExifValue(
            dataView,
            tiffOffset,
            offset,
            dataView.getUint16(offset + 2, littleEndian), // tag type
            dataView.getUint32(offset + 4, littleEndian), // tag length
            littleEndian
        );
    };

    loadImage.parseExifTags = function (dataView, tiffOffset, dirOffset, littleEndian, data) {
        var tagsNumber,
            dirEndOffset,
            i;
        if (dirOffset + 6 > dataView.byteLength) {
            console.log('Invalid Exif data: Invalid directory offset.');
            return;
        }
        tagsNumber = dataView.getUint16(dirOffset, littleEndian);
        dirEndOffset = dirOffset + 2 + 12 * tagsNumber;
        if (dirEndOffset + 4 > dataView.byteLength) {
            console.log('Invalid Exif data: Invalid directory size.');
            return;
        }
        for (i = 0; i < tagsNumber; i += 1) {
            this.parseExifTag(
                dataView,
                tiffOffset,
                dirOffset + 2 + 12 * i, // tag offset
                littleEndian,
                data
            );
        }
        // Return the offset to the next directory:
        return dataView.getUint32(dirEndOffset, littleEndian);
    };

    loadImage.parseExifData = function (dataView, offset, length, data, options) {
        if (options.disableExif) {
            return;
        }
        var tiffOffset = offset + 10,
            littleEndian,
            dirOffset,
            thumbnailData;
        // Check for the ASCII code for "Exif" (0x45786966):
        if (dataView.getUint32(offset + 4) !== 0x45786966) {
            // No Exif data, might be XMP data instead
            return;
        }
        if (tiffOffset + 8 > dataView.byteLength) {
            console.log('Invalid Exif data: Invalid segment size.');
            return;
        }
        // Check for the two null bytes:
        if (dataView.getUint16(offset + 8) !== 0x0000) {
            console.log('Invalid Exif data: Missing byte alignment offset.');
            return;
        }
        // Check the byte alignment:
        switch (dataView.getUint16(tiffOffset)) {
        case 0x4949:
            littleEndian = true;
            break;
        case 0x4D4D:
            littleEndian = false;
            break;
        default:
            console.log('Invalid Exif data: Invalid byte alignment marker.');
            return;
        }
        // Check for the TIFF tag marker (0x002A):
        if (dataView.getUint16(tiffOffset + 2, littleEndian) !== 0x002A) {
            console.log('Invalid Exif data: Missing TIFF marker.');
            return;
        }
        // Retrieve the directory offset bytes, usually 0x00000008 or 8 decimal:
        dirOffset = dataView.getUint32(tiffOffset + 4, littleEndian);
        // Create the exif object to store the tags:
        data.exif = new loadImage.ExifMap();
        // Parse the tags of the main image directory and retrieve the
        // offset to the next directory, usually the thumbnail directory:
        dirOffset = loadImage.parseExifTags(
            dataView,
            tiffOffset,
            tiffOffset + dirOffset,
            littleEndian,
            data
        );
        if (dirOffset && !options.disableExifThumbnail) {
            thumbnailData = {exif: {}};
            dirOffset = loadImage.parseExifTags(
                dataView,
                tiffOffset,
                tiffOffset + dirOffset,
                littleEndian,
                thumbnailData
            );
            // Check for JPEG Thumbnail offset:
            if (thumbnailData.exif[0x0201]) {
                data.exif.Thumbnail = loadImage.getExifThumbnail(
                    dataView,
                    tiffOffset + thumbnailData.exif[0x0201],
                    thumbnailData.exif[0x0202] // Thumbnail data length
                );
            }
        }
        // Check for Exif Sub IFD Pointer:
        if (data.exif[0x8769] && !options.disableExifSub) {
            loadImage.parseExifTags(
                dataView,
                tiffOffset,
                tiffOffset + data.exif[0x8769], // directory offset
                littleEndian,
                data
            );
        }
        // Check for GPS Info IFD Pointer:
        if (data.exif[0x8825] && !options.disableExifGps) {
            loadImage.parseExifTags(
                dataView,
                tiffOffset,
                tiffOffset + data.exif[0x8825], // directory offset
                littleEndian,
                data
            );
        }
    };

    // Registers the Exif parser for the APP1 JPEG meta data segment:
    loadImage.metaDataParsers.jpeg[0xffe1].push(loadImage.parseExifData);

    // Adds the following properties to the parseMetaData callback data:
    // * exif: The exif tags, parsed by the parseExifData method

    // Adds the following options to the parseMetaData method:
    // * disableExif: Disables Exif parsing.
    // * disableExifThumbnail: Disables parsing of the Exif Thumbnail.
    // * disableExifSub: Disables parsing of the Exif Sub IFD.
    // * disableExifGps: Disables parsing of the Exif GPS Info IFD.

}));

/*
 * JavaScript Load Image Exif Map 1.0.2
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Exif tags mapping based on
 * https://github.com/jseidelin/exif-js
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*global define, window */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['load-image', 'load-image-exif'], factory);
    } else {
        // Browser globals:
        factory(window.loadImage);
    }
}(function (loadImage) {
    'use strict';

    loadImage.ExifMap.prototype.tags = {
        // =================
        // TIFF tags (IFD0):
        // =================
        0x0100: 'ImageWidth',
        0x0101: 'ImageHeight',
        0x8769: 'ExifIFDPointer',
        0x8825: 'GPSInfoIFDPointer',
        0xA005: 'InteroperabilityIFDPointer',
        0x0102: 'BitsPerSample',
        0x0103: 'Compression',
        0x0106: 'PhotometricInterpretation',
        0x0112: 'Orientation',
        0x0115: 'SamplesPerPixel',
        0x011C: 'PlanarConfiguration',
        0x0212: 'YCbCrSubSampling',
        0x0213: 'YCbCrPositioning',
        0x011A: 'XResolution',
        0x011B: 'YResolution',
        0x0128: 'ResolutionUnit',
        0x0111: 'StripOffsets',
        0x0116: 'RowsPerStrip',
        0x0117: 'StripByteCounts',
        0x0201: 'JPEGInterchangeFormat',
        0x0202: 'JPEGInterchangeFormatLength',
        0x012D: 'TransferFunction',
        0x013E: 'WhitePoint',
        0x013F: 'PrimaryChromaticities',
        0x0211: 'YCbCrCoefficients',
        0x0214: 'ReferenceBlackWhite',
        0x0132: 'DateTime',
        0x010E: 'ImageDescription',
        0x010F: 'Make',
        0x0110: 'Model',
        0x0131: 'Software',
        0x013B: 'Artist',
        0x8298: 'Copyright',
        // ==================
        // Exif Sub IFD tags:
        // ==================
        0x9000: 'ExifVersion',                  // EXIF version
        0xA000: 'FlashpixVersion',              // Flashpix format version
        0xA001: 'ColorSpace',                   // Color space information tag
        0xA002: 'PixelXDimension',              // Valid width of meaningful image
        0xA003: 'PixelYDimension',              // Valid height of meaningful image
        0xA500: 'Gamma',
        0x9101: 'ComponentsConfiguration',      // Information about channels
        0x9102: 'CompressedBitsPerPixel',       // Compressed bits per pixel
        0x927C: 'MakerNote',                    // Any desired information written by the manufacturer
        0x9286: 'UserComment',                  // Comments by user
        0xA004: 'RelatedSoundFile',             // Name of related sound file
        0x9003: 'DateTimeOriginal',             // Date and time when the original image was generated
        0x9004: 'DateTimeDigitized',            // Date and time when the image was stored digitally
        0x9290: 'SubSecTime',                   // Fractions of seconds for DateTime
        0x9291: 'SubSecTimeOriginal',           // Fractions of seconds for DateTimeOriginal
        0x9292: 'SubSecTimeDigitized',          // Fractions of seconds for DateTimeDigitized
        0x829A: 'ExposureTime',                 // Exposure time (in seconds)
        0x829D: 'FNumber',
        0x8822: 'ExposureProgram',              // Exposure program
        0x8824: 'SpectralSensitivity',          // Spectral sensitivity
        0x8827: 'PhotographicSensitivity',      // EXIF 2.3, ISOSpeedRatings in EXIF 2.2
        0x8828: 'OECF',                         // Optoelectric conversion factor
        0x8830: 'SensitivityType',
        0x8831: 'StandardOutputSensitivity',
        0x8832: 'RecommendedExposureIndex',
        0x8833: 'ISOSpeed',
        0x8834: 'ISOSpeedLatitudeyyy',
        0x8835: 'ISOSpeedLatitudezzz',
        0x9201: 'ShutterSpeedValue',            // Shutter speed
        0x9202: 'ApertureValue',                // Lens aperture
        0x9203: 'BrightnessValue',              // Value of brightness
        0x9204: 'ExposureBias',                 // Exposure bias
        0x9205: 'MaxApertureValue',             // Smallest F number of lens
        0x9206: 'SubjectDistance',              // Distance to subject in meters
        0x9207: 'MeteringMode',                 // Metering mode
        0x9208: 'LightSource',                  // Kind of light source
        0x9209: 'Flash',                        // Flash status
        0x9214: 'SubjectArea',                  // Location and area of main subject
        0x920A: 'FocalLength',                  // Focal length of the lens in mm
        0xA20B: 'FlashEnergy',                  // Strobe energy in BCPS
        0xA20C: 'SpatialFrequencyResponse',
        0xA20E: 'FocalPlaneXResolution',        // Number of pixels in width direction per FPRUnit
        0xA20F: 'FocalPlaneYResolution',        // Number of pixels in height direction per FPRUnit
        0xA210: 'FocalPlaneResolutionUnit',     // Unit for measuring the focal plane resolution
        0xA214: 'SubjectLocation',              // Location of subject in image
        0xA215: 'ExposureIndex',                // Exposure index selected on camera
        0xA217: 'SensingMethod',                // Image sensor type
        0xA300: 'FileSource',                   // Image source (3 == DSC)
        0xA301: 'SceneType',                    // Scene type (1 == directly photographed)
        0xA302: 'CFAPattern',                   // Color filter array geometric pattern
        0xA401: 'CustomRendered',               // Special processing
        0xA402: 'ExposureMode',                 // Exposure mode
        0xA403: 'WhiteBalance',                 // 1 = auto white balance, 2 = manual
        0xA404: 'DigitalZoomRatio',             // Digital zoom ratio
        0xA405: 'FocalLengthIn35mmFilm',
        0xA406: 'SceneCaptureType',             // Type of scene
        0xA407: 'GainControl',                  // Degree of overall image gain adjustment
        0xA408: 'Contrast',                     // Direction of contrast processing applied by camera
        0xA409: 'Saturation',                   // Direction of saturation processing applied by camera
        0xA40A: 'Sharpness',                    // Direction of sharpness processing applied by camera
        0xA40B: 'DeviceSettingDescription',
        0xA40C: 'SubjectDistanceRange',         // Distance to subject
        0xA420: 'ImageUniqueID',                // Identifier assigned uniquely to each image
        0xA430: 'CameraOwnerName',
        0xA431: 'BodySerialNumber',
        0xA432: 'LensSpecification',
        0xA433: 'LensMake',
        0xA434: 'LensModel',
        0xA435: 'LensSerialNumber',
        // ==============
        // GPS Info tags:
        // ==============
        0x0000: 'GPSVersionID',
        0x0001: 'GPSLatitudeRef',
        0x0002: 'GPSLatitude',
        0x0003: 'GPSLongitudeRef',
        0x0004: 'GPSLongitude',
        0x0005: 'GPSAltitudeRef',
        0x0006: 'GPSAltitude',
        0x0007: 'GPSTimeStamp',
        0x0008: 'GPSSatellites',
        0x0009: 'GPSStatus',
        0x000A: 'GPSMeasureMode',
        0x000B: 'GPSDOP',
        0x000C: 'GPSSpeedRef',
        0x000D: 'GPSSpeed',
        0x000E: 'GPSTrackRef',
        0x000F: 'GPSTrack',
        0x0010: 'GPSImgDirectionRef',
        0x0011: 'GPSImgDirection',
        0x0012: 'GPSMapDatum',
        0x0013: 'GPSDestLatitudeRef',
        0x0014: 'GPSDestLatitude',
        0x0015: 'GPSDestLongitudeRef',
        0x0016: 'GPSDestLongitude',
        0x0017: 'GPSDestBearingRef',
        0x0018: 'GPSDestBearing',
        0x0019: 'GPSDestDistanceRef',
        0x001A: 'GPSDestDistance',
        0x001B: 'GPSProcessingMethod',
        0x001C: 'GPSAreaInformation',
        0x001D: 'GPSDateStamp',
        0x001E: 'GPSDifferential',
        0x001F: 'GPSHPositioningError'
    };

    loadImage.ExifMap.prototype.stringValues = {
        ExposureProgram: {
            0: 'Undefined',
            1: 'Manual',
            2: 'Normal program',
            3: 'Aperture priority',
            4: 'Shutter priority',
            5: 'Creative program',
            6: 'Action program',
            7: 'Portrait mode',
            8: 'Landscape mode'
        },
        MeteringMode: {
            0: 'Unknown',
            1: 'Average',
            2: 'CenterWeightedAverage',
            3: 'Spot',
            4: 'MultiSpot',
            5: 'Pattern',
            6: 'Partial',
            255: 'Other'
        },
        LightSource: {
            0: 'Unknown',
            1: 'Daylight',
            2: 'Fluorescent',
            3: 'Tungsten (incandescent light)',
            4: 'Flash',
            9: 'Fine weather',
            10: 'Cloudy weather',
            11: 'Shade',
            12: 'Daylight fluorescent (D 5700 - 7100K)',
            13: 'Day white fluorescent (N 4600 - 5400K)',
            14: 'Cool white fluorescent (W 3900 - 4500K)',
            15: 'White fluorescent (WW 3200 - 3700K)',
            17: 'Standard light A',
            18: 'Standard light B',
            19: 'Standard light C',
            20: 'D55',
            21: 'D65',
            22: 'D75',
            23: 'D50',
            24: 'ISO studio tungsten',
            255: 'Other'
        },
        Flash: {
            0x0000: 'Flash did not fire',
            0x0001: 'Flash fired',
            0x0005: 'Strobe return light not detected',
            0x0007: 'Strobe return light detected',
            0x0009: 'Flash fired, compulsory flash mode',
            0x000D: 'Flash fired, compulsory flash mode, return light not detected',
            0x000F: 'Flash fired, compulsory flash mode, return light detected',
            0x0010: 'Flash did not fire, compulsory flash mode',
            0x0018: 'Flash did not fire, auto mode',
            0x0019: 'Flash fired, auto mode',
            0x001D: 'Flash fired, auto mode, return light not detected',
            0x001F: 'Flash fired, auto mode, return light detected',
            0x0020: 'No flash function',
            0x0041: 'Flash fired, red-eye reduction mode',
            0x0045: 'Flash fired, red-eye reduction mode, return light not detected',
            0x0047: 'Flash fired, red-eye reduction mode, return light detected',
            0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',
            0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
            0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
            0x0059: 'Flash fired, auto mode, red-eye reduction mode',
            0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
            0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode'
        },
        SensingMethod: {
            1: 'Undefined',
            2: 'One-chip color area sensor',
            3: 'Two-chip color area sensor',
            4: 'Three-chip color area sensor',
            5: 'Color sequential area sensor',
            7: 'Trilinear sensor',
            8: 'Color sequential linear sensor'
        },
        SceneCaptureType: {
            0: 'Standard',
            1: 'Landscape',
            2: 'Portrait',
            3: 'Night scene'
        },
        SceneType: {
            1: 'Directly photographed'
        },
        CustomRendered: {
            0: 'Normal process',
            1: 'Custom process'
        },
        WhiteBalance: {
            0: 'Auto white balance',
            1: 'Manual white balance'
        },
        GainControl: {
            0: 'None',
            1: 'Low gain up',
            2: 'High gain up',
            3: 'Low gain down',
            4: 'High gain down'
        },
        Contrast: {
            0: 'Normal',
            1: 'Soft',
            2: 'Hard'
        },
        Saturation: {
            0: 'Normal',
            1: 'Low saturation',
            2: 'High saturation'
        },
        Sharpness: {
            0: 'Normal',
            1: 'Soft',
            2: 'Hard'
        },
        SubjectDistanceRange: {
            0: 'Unknown',
            1: 'Macro',
            2: 'Close view',
            3: 'Distant view'
        },
        FileSource: {
            3: 'DSC'
        },
        ComponentsConfiguration: {
            0: '',
            1: 'Y',
            2: 'Cb',
            3: 'Cr',
            4: 'R',
            5: 'G',
            6: 'B'
        },
        Orientation: {
            1: 'top-left',
            2: 'top-right',
            3: 'bottom-right',
            4: 'bottom-left',
            5: 'left-top',
            6: 'right-top',
            7: 'right-bottom',
            8: 'left-bottom'
        }
    };

    loadImage.ExifMap.prototype.getText = function (id) {
        var value = this.get(id);
        switch (id) {
        case 'LightSource':
        case 'Flash':
        case 'MeteringMode':
        case 'ExposureProgram':
        case 'SensingMethod':
        case 'SceneCaptureType':
        case 'SceneType':
        case 'CustomRendered':
        case 'WhiteBalance':
        case 'GainControl':
        case 'Contrast':
        case 'Saturation':
        case 'Sharpness':
        case 'SubjectDistanceRange':
        case 'FileSource':
        case 'Orientation':
            return this.stringValues[id][value];
        case 'ExifVersion':
        case 'FlashpixVersion':
            return String.fromCharCode(value[0], value[1], value[2], value[3]);
        case 'ComponentsConfiguration':
            return this.stringValues[id][value[0]] +
                this.stringValues[id][value[1]] +
                this.stringValues[id][value[2]] +
                this.stringValues[id][value[3]];
        case 'GPSVersionID':
            return value[0] + '.' + value[1]  + '.' + value[2]  + '.' + value[3];
        }
        return String(value);
    };

    (function (exifMapPrototype) {
        var tags = exifMapPrototype.tags,
            map = exifMapPrototype.map,
            prop;

        // Map the tag names to tags:
        for (prop in tags) {
            if (tags.hasOwnProperty(prop)) {
                map[tags[prop]] = prop;
            }
        }
    }(loadImage.ExifMap.prototype));

    loadImage.ExifMap.prototype.getAll = function () {
        var map = {},
            prop,
            id;
        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                id = this.tags[prop];
                if (id) {
                    map[id] = this.getText(id);
                }
            }
        }
        return map;
    };

}));

/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 0.6.12
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specificed layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 */
function FastClick(layer) {
	'use strict';
	var oldOnClick, self = this;


	/**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
	this.trackingClick = false;


	/**
	 * Timestamp for when when click tracking started.
	 *
	 * @type number
	 */
	this.trackingClickStart = 0;


	/**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
	this.targetElement = null;


	/**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartX = 0;


	/**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartY = 0;


	/**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
	this.lastTouchIdentifier = 0;


	/**
	 * Touchmove boundary, beyond which a click will be cancelled.
	 *
	 * @type number
	 */
	this.touchBoundary = 10;


	/**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
	this.layer = layer;

	if (!layer || !layer.nodeType) {
		throw new TypeError('Layer must be a document node');
	}

	/** @type function() */
	this.onClick = function() { return FastClick.prototype.onClick.apply(self, arguments); };

	/** @type function() */
	this.onMouse = function() { return FastClick.prototype.onMouse.apply(self, arguments); };

	/** @type function() */
	this.onTouchStart = function() { return FastClick.prototype.onTouchStart.apply(self, arguments); };

	/** @type function() */
	this.onTouchMove = function() { return FastClick.prototype.onTouchMove.apply(self, arguments); };

	/** @type function() */
	this.onTouchEnd = function() { return FastClick.prototype.onTouchEnd.apply(self, arguments); };

	/** @type function() */
	this.onTouchCancel = function() { return FastClick.prototype.onTouchCancel.apply(self, arguments); };

	if (FastClick.notNeeded(layer)) {
		return;
	}

	// Set up event handlers as required
	if (this.deviceIsAndroid) {
		layer.addEventListener('mouseover', this.onMouse, true);
		layer.addEventListener('mousedown', this.onMouse, true);
		layer.addEventListener('mouseup', this.onMouse, true);
	}

	layer.addEventListener('click', this.onClick, true);
	layer.addEventListener('touchstart', this.onTouchStart, false);
	layer.addEventListener('touchmove', this.onTouchMove, false);
	layer.addEventListener('touchend', this.onTouchEnd, false);
	layer.addEventListener('touchcancel', this.onTouchCancel, false);

	// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
	// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
	// layer when they are cancelled.
	if (!Event.prototype.stopImmediatePropagation) {
		layer.removeEventListener = function(type, callback, capture) {
			var rmv = Node.prototype.removeEventListener;
			if (type === 'click') {
				rmv.call(layer, type, callback.hijacked || callback, capture);
			} else {
				rmv.call(layer, type, callback, capture);
			}
		};

		layer.addEventListener = function(type, callback, capture) {
			var adv = Node.prototype.addEventListener;
			if (type === 'click') {
				adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
					if (!event.propagationStopped) {
						callback(event);
					}
				}), capture);
			} else {
				adv.call(layer, type, callback, capture);
			}
		};
	}

	// If a handler is already declared in the element's onclick attribute, it will be fired before
	// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
	// adding it as listener.
	if (typeof layer.onclick === 'function') {

		// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
		// - the old one won't work if passed to addEventListener directly.
		oldOnClick = layer.onclick;
		layer.addEventListener('click', function(event) {
			oldOnClick(event);
		}, false);
		layer.onclick = null;
	}
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {

	// Don't send a synthetic click to disabled inputs (issue #62)
	case 'button':
	case 'select':
	case 'textarea':
		if (target.disabled) {
			return true;
		}

		break;
	case 'input':

		// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
		if ((this.deviceIsIOS && target.type === 'file') || target.disabled) {
			return true;
		}

		break;
	case 'label':
	case 'video':
		return true;
	}

	return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'textarea':
		return true;
	case 'select':
		return !this.deviceIsAndroid;
	case 'input':
		switch (target.type) {
		case 'button':
		case 'checkbox':
		case 'file':
		case 'image':
		case 'radio':
		case 'submit':
			return false;
		}

		// No point in attempting to focus disabled inputs
		return !target.disabled && !target.readOnly;
	default:
		return (/\bneedsfocus\b/).test(target.className);
	}
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
	'use strict';
	var clickEvent, touch;

	// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
	if (document.activeElement && document.activeElement !== targetElement) {
		document.activeElement.blur();
	}

	touch = event.changedTouches[0];

	// Synthesise a click event, with an extra attribute so it can be tracked
	clickEvent = document.createEvent('MouseEvents');
	clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
	clickEvent.forwardedTouchEvent = true;
	targetElement.dispatchEvent(clickEvent);
};

FastClick.prototype.determineEventType = function(targetElement) {
	'use strict';

	//Issue #159: Android Chrome Select Box does not open with a synthetic click event
	if (this.deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
		return 'mousedown';
	}

	return 'click';
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
	'use strict';
	var length;

	// Issue #160: on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
	if (this.deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time') {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
	'use strict';
	var scrollParent, parentElement;

	scrollParent = targetElement.fastClickScrollParent;

	// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
	// target element was moved to another parent.
	if (!scrollParent || !scrollParent.contains(targetElement)) {
		parentElement = targetElement;
		do {
			if (parentElement.scrollHeight > parentElement.offsetHeight) {
				scrollParent = parentElement;
				targetElement.fastClickScrollParent = parentElement;
				break;
			}

			parentElement = parentElement.parentElement;
		} while (parentElement);
	}

	// Always update the scroll top tracker if possible.
	if (scrollParent) {
		scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
	}
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	'use strict';

	// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
	if (eventTarget.nodeType === Node.TEXT_NODE) {
		return eventTarget.parentNode;
	}

	return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
	'use strict';
	var targetElement, touch, selection;

	// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
	if (event.targetTouches.length > 1) {
		return true;
	}

	targetElement = this.getTargetElementFromEventTarget(event.target);
	touch = event.targetTouches[0];

	if (this.deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();
		if (selection.rangeCount && !selection.isCollapsed) {
			return true;
		}

		if (!this.deviceIsIOS4) {

			// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
			// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
			// with the same identifier as the touch event that previously triggered the click that triggered the alert.
			// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
			// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
			if (touch.identifier === this.lastTouchIdentifier) {
				event.preventDefault();
				return false;
			}

			this.lastTouchIdentifier = touch.identifier;

			// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
			// 1) the user does a fling scroll on the scrollable layer
			// 2) the user stops the fling scroll with another tap
			// then the event.target of the last 'touchend' event will be the element that was under the user's finger
			// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
			// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
			this.updateScrollParent(targetElement);
		}
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < 200) {
		event.preventDefault();
	}

	return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
	'use strict';
	var touch = event.changedTouches[0], boundary = this.touchBoundary;

	if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
		return true;
	}

	return false;
};


/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
	'use strict';
	if (!this.trackingClick) {
		return true;
	}

	// If the touch has moved, cancel the click tracking
	if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}

	return true;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
	'use strict';

	// Fast path for newer browsers supporting the HTML5 control attribute
	if (labelElement.control !== undefined) {
		return labelElement.control;
	}

	// All browsers under test that support touch events also support the HTML5 htmlFor attribute
	if (labelElement.htmlFor) {
		return document.getElementById(labelElement.htmlFor);
	}

	// If no for attribute exists, attempt to retrieve the first labellable descendant element
	// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
	return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
	'use strict';
	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < 200) {
		this.cancelNextClick = true;
		return true;
	}

	// Reset to prevent wrong click cancel on input (issue #156).
	this.cancelNextClick = false;

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	// On some iOS devices, the targetElement supplied with the event is invalid if the layer
	// is performing a transition or scroll, and has to be re-detected manually. Note that
	// for this to function correctly, it must be called *after* the event target is checked!
	// See issue #57; also filed as rdar://13048589 .
	if (this.deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];

		// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
		targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
	}

	targetTagName = targetElement.tagName.toLowerCase();
	if (targetTagName === 'label') {
		forElement = this.findControl(targetElement);
		if (forElement) {
			this.focus(targetElement);
			if (this.deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}
	} else if (this.needsFocus(targetElement)) {

		// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
		// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
		if ((event.timeStamp - trackingClickStart) > 100 || (this.deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		this.focus(targetElement);
		this.sendClick(targetElement, event);

		// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
		if (!this.deviceIsIOS4 || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (this.deviceIsIOS && !this.deviceIsIOS4) {

		// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
		// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
		scrollParent = targetElement.fastClickScrollParent;
		if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
			return true;
		}
	}

	// Prevent the actual click from going though - unless the target node is marked as requiring
	// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		this.sendClick(targetElement, event);
	}

	return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
	'use strict';
	this.trackingClick = false;
	this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
	'use strict';

	// If a target element was never set (because a touch event was never fired) allow the event
	if (!this.targetElement) {
		return true;
	}

	if (event.forwardedTouchEvent) {
		return true;
	}

	// Programmatically generated events targeting a specific element should be permitted
	if (!event.cancelable) {
		return true;
	}

	// Derive and check the target element to see whether the mouse event needs to be permitted;
	// unless explicitly enabled, prevent non-touch click events from triggering actions,
	// to prevent ghost/doubleclicks.
	if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

		// Prevent any user-added listeners declared on FastClick element from being fired.
		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {

			// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			event.propagationStopped = true;
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	// If the mouse event is permitted, return true for the action to go through.
	return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
	'use strict';
	var permitted;

	// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
	if (this.trackingClick) {
		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
	if (event.target.type === 'submit' && event.detail === 0) {
		return true;
	}

	permitted = this.onMouse(event);

	// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
	if (!permitted) {
		this.targetElement = null;
	}

	// If clicks are permitted, return true for the action to go through.
	return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
	'use strict';
	var layer = this.layer;

	if (this.deviceIsAndroid) {
		layer.removeEventListener('mouseover', this.onMouse, true);
		layer.removeEventListener('mousedown', this.onMouse, true);
		layer.removeEventListener('mouseup', this.onMouse, true);
	}

	layer.removeEventListener('click', this.onClick, true);
	layer.removeEventListener('touchstart', this.onTouchStart, false);
	layer.removeEventListener('touchmove', this.onTouchMove, false);
	layer.removeEventListener('touchend', this.onTouchEnd, false);
	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
	'use strict';
	var metaViewport;
	var chromeVersion;

	// Devices that don't support touch don't need FastClick
	if (typeof window.ontouchstart === 'undefined') {
		return true;
	}

	// Chrome version - zero for other browsers
	chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

	if (chromeVersion) {

		if (FastClick.prototype.deviceIsAndroid) {
			metaViewport = document.querySelector('meta[name=viewport]');
			
			if (metaViewport) {
				// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// Chrome 32 and above with width=device-width or less don't need FastClick
				if (chromeVersion > 31 && window.innerWidth <= window.screen.width) {
					return true;
				}
			}

		// Chrome desktop doesn't need FastClick (issue #15)
		} else {
			return true;
		}
	}

	// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
	if (layer.style.msTouchAction === 'none') {
		return true;
	}

	return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.attach = function(layer) {
	'use strict';
	return new FastClick(layer);
};


if (typeof define !== 'undefined' && define.amd) {

	// AMD. Register as an anonymous module.
	define(function() {
		'use strict';
		return FastClick;
	});
} else if (typeof module !== 'undefined' && module.exports) {
	module.exports = FastClick.attach;
	module.exports.FastClick = FastClick;
} else {
	window.FastClick = FastClick;
}

var JSZip=function(data,options){this.files={};this.root="";if(data){this.load(data,options)}};JSZip.signature={LOCAL_FILE_HEADER:"PK",CENTRAL_FILE_HEADER:"PK",CENTRAL_DIRECTORY_END:"PK",ZIP64_CENTRAL_DIRECTORY_LOCATOR:"PK",ZIP64_CENTRAL_DIRECTORY_END:"PK",DATA_DESCRIPTOR:"PK\b"};JSZip.defaults={base64:false,binary:false,dir:false,date:null};JSZip.prototype=function(){var ZipObject=function(name,data,options){this.name=name;this.data=data;this.options=options};ZipObject.prototype={asText:function(){var result=this.data;if(this.options.base64){result=JSZipBase64.decode(result)}if(this.options.binary){result=JSZip.prototype.utf8decode(result)}return result},asBinary:function(){var result=this.data;if(this.options.base64){result=JSZipBase64.decode(result)}if(!this.options.binary){result=JSZip.prototype.utf8encode(result)}return result},asUint8Array:function(){return JSZip.utils.string2Uint8Array(this.asBinary())},asArrayBuffer:function(){return JSZip.utils.string2Uint8Array(this.asBinary()).buffer}};var decToHex=function(dec,bytes){var hex="",i;for(i=0;i<bytes;i++){hex+=String.fromCharCode(dec&255);dec=dec>>>8}return hex};var extend=function(){var result={},i,attr;for(i=0;i<arguments.length;i++){for(attr in arguments[i]){if(arguments[i].hasOwnProperty(attr)&&typeof result[attr]==="undefined"){result[attr]=arguments[i][attr]}}}return result};var prepareFileAttrs=function(o){o=o||{};if(o.base64===true&&o.binary==null){o.binary=true}o=extend(o,JSZip.defaults);o.date=o.date||new Date;return o};var fileAdd=function(name,data,o){var parent=parentFolder(name);if(parent){folderAdd.call(this,parent)}o=prepareFileAttrs(o);if(JSZip.support.uint8array&&data instanceof Uint8Array){o.base64=false;o.binary=true;data=JSZip.utils.uint8Array2String(data)}else if(JSZip.support.arraybuffer&&data instanceof ArrayBuffer){o.base64=false;o.binary=true;var bufferView=new Uint8Array(data);data=JSZip.utils.uint8Array2String(bufferView)}else if(o.binary&&!o.base64){if(o.optimizedBinaryString!==true){data=JSZip.utils.string2binary(data)}delete o.optimizedBinaryString}return this.files[name]=new ZipObject(name,data,o)};var parentFolder=function(path){if(path.slice(-1)=="/"){path=path.substring(0,path.length-1)}var lastSlash=path.lastIndexOf("/");return lastSlash>0?path.substring(0,lastSlash):""};var folderAdd=function(name){if(name.slice(-1)!="/"){name+="/"}if(!this.files[name]){var parent=parentFolder(name);if(parent){folderAdd.call(this,parent)}fileAdd.call(this,name,"",{dir:true})}return this.files[name]};var prepareLocalHeaderData=function(file,utfEncodedFileName,compressionType){var useUTF8=utfEncodedFileName!==file.name,data=file.asBinary(),o=file.options,dosTime,dosDate;dosTime=o.date.getHours();dosTime=dosTime<<6;dosTime=dosTime|o.date.getMinutes();dosTime=dosTime<<5;dosTime=dosTime|o.date.getSeconds()/2;dosDate=o.date.getFullYear()-1980;dosDate=dosDate<<4;dosDate=dosDate|o.date.getMonth()+1;dosDate=dosDate<<5;dosDate=dosDate|o.date.getDate();var compression=JSZip.compressions[compressionType];var compressedData=compression.compress(data);var header="";header+="\n\0";header+=useUTF8?"\0\b":"\0\0";header+=compression.magic;header+=decToHex(dosTime,2);header+=decToHex(dosDate,2);header+=decToHex(this.crc32(data),4);header+=decToHex(compressedData.length,4);header+=decToHex(data.length,4);header+=decToHex(utfEncodedFileName.length,2);header+="\0\0";return{header:header,compressedData:compressedData}};return{load:function(stream,options){throw new Error("Load method is not defined. Is the file jszip-load.js included ?")},filter:function(search){var result=[],filename,relativePath,file,fileClone;for(filename in this.files){if(!this.files.hasOwnProperty(filename)){continue}file=this.files[filename];fileClone=new ZipObject(file.name,file.data,extend(file.options));relativePath=filename.slice(this.root.length,filename.length);if(filename.slice(0,this.root.length)===this.root&&search(relativePath,fileClone)){result.push(fileClone)}}return result},file:function(name,data,o){if(arguments.length===1){if(name instanceof RegExp){var regexp=name;return this.filter(function(relativePath,file){return!file.options.dir&&regexp.test(relativePath)})}else{return this.filter(function(relativePath,file){return!file.options.dir&&relativePath===name})[0]||null}}else{name=this.root+name;fileAdd.call(this,name,data,o)}return this},folder:function(arg){if(!arg){return this}if(arg instanceof RegExp){return this.filter(function(relativePath,file){return file.options.dir&&arg.test(relativePath)})}var name=this.root+arg;var newFolder=folderAdd.call(this,name);var ret=this.clone();ret.root=newFolder.name;return ret},remove:function(name){name=this.root+name;var file=this.files[name];if(!file){if(name.slice(-1)!="/"){name+="/"}file=this.files[name]}if(file){if(!file.options.dir){delete this.files[name]}else{var kids=this.filter(function(relativePath,file){return file.name.slice(0,name.length)===name});for(var i=0;i<kids.length;i++){delete this.files[kids[i].name]}}}return this},generate:function(options){options=extend(options||{},{base64:true,compression:"STORE",type:"base64"});var compression=options.compression.toUpperCase();var directory=[],files=[],fileOffset=0;if(!JSZip.compressions[compression]){throw compression+" is not a valid compression method !"}for(var name in this.files){if(!this.files.hasOwnProperty(name)){continue}var file=this.files[name];var utfEncodedFileName=this.utf8encode(file.name);var fileRecord="",dirRecord="",data=prepareLocalHeaderData.call(this,file,utfEncodedFileName,compression);fileRecord=JSZip.signature.LOCAL_FILE_HEADER+data.header+utfEncodedFileName+data.compressedData;dirRecord=JSZip.signature.CENTRAL_FILE_HEADER+"\0"+data.header+"\0\0"+"\0\0"+"\0\0"+(this.files[name].options.dir===true?"\0\0\0":"\0\0\0\0")+decToHex(fileOffset,4)+utfEncodedFileName;fileOffset+=fileRecord.length;files.push(fileRecord);directory.push(dirRecord)}var fileData=files.join("");var dirData=directory.join("");var dirEnd="";dirEnd=JSZip.signature.CENTRAL_DIRECTORY_END+"\0\0"+"\0\0"+decToHex(files.length,2)+decToHex(files.length,2)+decToHex(dirData.length,4)+decToHex(fileData.length,4)+"\0\0";var zip=fileData+dirData+dirEnd;switch(options.type.toLowerCase()){case"uint8array":return JSZip.utils.string2Uint8Array(zip);case"arraybuffer":return JSZip.utils.string2Uint8Array(zip).buffer;case"blob":return JSZip.utils.string2Blob(zip);case"base64":return options.base64?JSZipBase64.encode(zip):zip;default:return zip}},crc32:function(str,crc){if(str===""||typeof str==="undefined"){return 0}var table=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];if(typeof crc=="undefined"){crc=0}var x=0;var y=0;crc=crc^-1;for(var i=0,iTop=str.length;i<iTop;i++){y=(crc^str.charCodeAt(i))&255;x=table[y];crc=crc>>>8^x}return crc^-1},clone:function(){var newObj=new JSZip;for(var i in this){if(typeof this[i]!=="function"){newObj[i]=this[i]}}return newObj},utf8encode:function(string){string=string.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c)}else if(c>127&&c<2048){utftext+=String.fromCharCode(c>>6|192);utftext+=String.fromCharCode(c&63|128)}else{utftext+=String.fromCharCode(c>>12|224);utftext+=String.fromCharCode(c>>6&63|128);utftext+=String.fromCharCode(c&63|128)}}return utftext},utf8decode:function(utftext){var string="";var i=0;var c=0,c1=0,c2=0,c3=0;while(i<utftext.length){c=utftext.charCodeAt(i);if(c<128){string+=String.fromCharCode(c);i++}else if(c>191&&c<224){c2=utftext.charCodeAt(i+1);string+=String.fromCharCode((c&31)<<6|c2&63);i+=2}else{c2=utftext.charCodeAt(i+1);c3=utftext.charCodeAt(i+2);string+=String.fromCharCode((c&15)<<12|(c2&63)<<6|c3&63);i+=3}}return string}}}();JSZip.compressions={STORE:{magic:"\0\0",compress:function(content){return content},uncompress:function(content){return content}}};JSZip.support={arraybuffer:function(){return typeof ArrayBuffer!=="undefined"&&typeof Uint8Array!=="undefined"}(),uint8array:function(){return typeof Uint8Array!=="undefined"}(),blob:function(){if(typeof ArrayBuffer==="undefined"){return false}var buffer=new ArrayBuffer(0);try{return new Blob([buffer],{type:"application/zip"}).size===0}catch(e){}try{var builder=new(window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder);builder.append(buffer);return builder.getBlob("application/zip").size===0}catch(e){}return false}()};JSZip.utils={string2binary:function(str){var result="";for(var i=0;i<str.length;i++){result+=String.fromCharCode(str.charCodeAt(i)&255)}return result},string2Uint8Array:function(str){if(!JSZip.support.uint8array){throw new Error("Uint8Array is not supported by this browser")}var buffer=new ArrayBuffer(str.length);var bufferView=new Uint8Array(buffer);for(var i=0;i<str.length;i++){bufferView[i]=str.charCodeAt(i)}return bufferView},uint8Array2String:function(array){if(!JSZip.support.uint8array){throw new Error("Uint8Array is not supported by this browser")}var result="";for(var i=0;i<array.length;i++){result+=String.fromCharCode(array[i])}return result},string2Blob:function(str){if(!JSZip.support.blob){throw new Error("Blob is not supported by this browser")}var buffer=JSZip.utils.string2Uint8Array(str).buffer;try{return new Blob([buffer],{type:"application/zip"})}catch(e){}try{var builder=new(window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder);builder.append(buffer);return builder.getBlob("application/zip")}catch(e){}throw new Error("Bug : can't construct the Blob.")}};var JSZipBase64=function(){var _keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";return{encode:function(input,utf8){var output="";var chr1,chr2,chr3,enc1,enc2,enc3,enc4;var i=0;while(i<input.length){chr1=input.charCodeAt(i++);chr2=input.charCodeAt(i++);chr3=input.charCodeAt(i++);enc1=chr1>>2;enc2=(chr1&3)<<4|chr2>>4;enc3=(chr2&15)<<2|chr3>>6;enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64}else if(isNaN(chr3)){enc4=64}output=output+_keyStr.charAt(enc1)+_keyStr.charAt(enc2)+_keyStr.charAt(enc3)+_keyStr.charAt(enc4)}return output},decode:function(input,utf8){var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<input.length){enc1=_keyStr.indexOf(input.charAt(i++));enc2=_keyStr.indexOf(input.charAt(i++));enc3=_keyStr.indexOf(input.charAt(i++));enc4=_keyStr.indexOf(input.charAt(i++));chr1=enc1<<2|enc2>>4;chr2=(enc2&15)<<4|enc3>>2;chr3=(enc3&3)<<6|enc4;output=output+String.fromCharCode(chr1);if(enc3!=64){output=output+String.fromCharCode(chr2)}if(enc4!=64){output=output+String.fromCharCode(chr3)}}return output}}}();if(!JSZip){throw"JSZip not defined"}(function(){var zip_WSIZE=32768;var zip_STORED_BLOCK=0;var zip_STATIC_TREES=1;var zip_DYN_TREES=2;var zip_DEFAULT_LEVEL=6;var zip_FULL_SEARCH=true;var zip_INBUFSIZ=32768;var zip_INBUF_EXTRA=64;var zip_OUTBUFSIZ=1024*8;var zip_window_size=2*zip_WSIZE;var zip_MIN_MATCH=3;var zip_MAX_MATCH=258;var zip_BITS=16;var zip_LIT_BUFSIZE=8192;var zip_HASH_BITS=13;if(zip_LIT_BUFSIZE>zip_INBUFSIZ)alert("error: zip_INBUFSIZ is too small");if(zip_WSIZE<<1>1<<zip_BITS)alert("error: zip_WSIZE is too large");if(zip_HASH_BITS>zip_BITS-1)alert("error: zip_HASH_BITS is too large");if(zip_HASH_BITS<8||zip_MAX_MATCH!=258)alert("error: Code too clever");var zip_DIST_BUFSIZE=zip_LIT_BUFSIZE;var zip_HASH_SIZE=1<<zip_HASH_BITS;var zip_HASH_MASK=zip_HASH_SIZE-1;var zip_WMASK=zip_WSIZE-1;var zip_NIL=0;var zip_TOO_FAR=4096;var zip_MIN_LOOKAHEAD=zip_MAX_MATCH+zip_MIN_MATCH+1;var zip_MAX_DIST=zip_WSIZE-zip_MIN_LOOKAHEAD;var zip_SMALLEST=1;var zip_MAX_BITS=15;var zip_MAX_BL_BITS=7;var zip_LENGTH_CODES=29;var zip_LITERALS=256;var zip_END_BLOCK=256;var zip_L_CODES=zip_LITERALS+1+zip_LENGTH_CODES;var zip_D_CODES=30;var zip_BL_CODES=19;var zip_REP_3_6=16;var zip_REPZ_3_10=17;var zip_REPZ_11_138=18;var zip_HEAP_SIZE=2*zip_L_CODES+1;var zip_H_SHIFT=parseInt((zip_HASH_BITS+zip_MIN_MATCH-1)/zip_MIN_MATCH);var zip_free_queue;var zip_qhead,zip_qtail;var zip_initflag;var zip_outbuf=null;var zip_outcnt,zip_outoff;var zip_complete;var zip_window;var zip_d_buf;var zip_l_buf;var zip_prev;var zip_bi_buf;var zip_bi_valid;var zip_block_start;var zip_ins_h;var zip_hash_head;var zip_prev_match;var zip_match_available;var zip_match_length;var zip_prev_length;var zip_strstart;var zip_match_start;var zip_eofile;var zip_lookahead;var zip_max_chain_length;var zip_max_lazy_match;var zip_compr_level;var zip_good_match;var zip_nice_match;var zip_dyn_ltree;var zip_dyn_dtree;var zip_static_ltree;var zip_static_dtree;var zip_bl_tree;var zip_l_desc;var zip_d_desc;var zip_bl_desc;var zip_bl_count;var zip_heap;var zip_heap_len;var zip_heap_max;var zip_depth;var zip_length_code;var zip_dist_code;var zip_base_length;var zip_base_dist;var zip_flag_buf;var zip_last_lit;var zip_last_dist;var zip_last_flags;var zip_flags;var zip_flag_bit;var zip_opt_len;var zip_static_len;var zip_deflate_data;var zip_deflate_pos;var zip_DeflateCT=function(){this.fc=0;this.dl=0};var zip_DeflateTreeDesc=function(){this.dyn_tree=null;this.static_tree=null;this.extra_bits=null;this.extra_base=0;this.elems=0;this.max_length=0;this.max_code=0};var zip_DeflateConfiguration=function(a,b,c,d){this.good_length=a;this.max_lazy=b;this.nice_length=c;this.max_chain=d};var zip_DeflateBuffer=function(){this.next=null;this.len=0;this.ptr=new Array(zip_OUTBUFSIZ);this.off=0};var zip_extra_lbits=new Array(0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0);var zip_extra_dbits=new Array(0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13);var zip_extra_blbits=new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7);var zip_bl_order=new Array(16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15);var zip_configuration_table=new Array(new zip_DeflateConfiguration(0,0,0,0),new zip_DeflateConfiguration(4,4,8,4),new zip_DeflateConfiguration(4,5,16,8),new zip_DeflateConfiguration(4,6,32,32),new zip_DeflateConfiguration(4,4,16,16),new zip_DeflateConfiguration(8,16,32,32),new zip_DeflateConfiguration(8,16,128,128),new zip_DeflateConfiguration(8,32,128,256),new zip_DeflateConfiguration(32,128,258,1024),new zip_DeflateConfiguration(32,258,258,4096));var zip_deflate_start=function(level){var i;if(!level)level=zip_DEFAULT_LEVEL;else if(level<1)level=1;else if(level>9)level=9;zip_compr_level=level;zip_initflag=false;zip_eofile=false;if(zip_outbuf!=null)return;zip_free_queue=zip_qhead=zip_qtail=null;zip_outbuf=new Array(zip_OUTBUFSIZ);zip_window=new Array(zip_window_size);zip_d_buf=new Array(zip_DIST_BUFSIZE);zip_l_buf=new Array(zip_INBUFSIZ+zip_INBUF_EXTRA);zip_prev=new Array(1<<zip_BITS);zip_dyn_ltree=new Array(zip_HEAP_SIZE);for(i=0;i<zip_HEAP_SIZE;i++)zip_dyn_ltree[i]=new zip_DeflateCT;zip_dyn_dtree=new Array(2*zip_D_CODES+1);for(i=0;i<2*zip_D_CODES+1;i++)zip_dyn_dtree[i]=new zip_DeflateCT;zip_static_ltree=new Array(zip_L_CODES+2);for(i=0;i<zip_L_CODES+2;i++)zip_static_ltree[i]=new zip_DeflateCT;zip_static_dtree=new Array(zip_D_CODES);for(i=0;i<zip_D_CODES;i++)zip_static_dtree[i]=new zip_DeflateCT;zip_bl_tree=new Array(2*zip_BL_CODES+1);for(i=0;i<2*zip_BL_CODES+1;i++)zip_bl_tree[i]=new zip_DeflateCT;zip_l_desc=new zip_DeflateTreeDesc;zip_d_desc=new zip_DeflateTreeDesc;zip_bl_desc=new zip_DeflateTreeDesc;zip_bl_count=new Array(zip_MAX_BITS+1);zip_heap=new Array(2*zip_L_CODES+1);zip_depth=new Array(2*zip_L_CODES+1);zip_length_code=new Array(zip_MAX_MATCH-zip_MIN_MATCH+1);zip_dist_code=new Array(512);zip_base_length=new Array(zip_LENGTH_CODES);zip_base_dist=new Array(zip_D_CODES);zip_flag_buf=new Array(parseInt(zip_LIT_BUFSIZE/8))};var zip_deflate_end=function(){zip_free_queue=zip_qhead=zip_qtail=null;zip_outbuf=null;zip_window=null;zip_d_buf=null;zip_l_buf=null;zip_prev=null;zip_dyn_ltree=null;zip_dyn_dtree=null;zip_static_ltree=null;zip_static_dtree=null;zip_bl_tree=null;zip_l_desc=null;zip_d_desc=null;zip_bl_desc=null;zip_bl_count=null;zip_heap=null;zip_depth=null;zip_length_code=null;zip_dist_code=null;zip_base_length=null;zip_base_dist=null;zip_flag_buf=null};var zip_reuse_queue=function(p){p.next=zip_free_queue;zip_free_queue=p};var zip_new_queue=function(){var p;if(zip_free_queue!=null){p=zip_free_queue;zip_free_queue=zip_free_queue.next}else p=new zip_DeflateBuffer;p.next=null;p.len=p.off=0;return p};var zip_head1=function(i){return zip_prev[zip_WSIZE+i]};var zip_head2=function(i,val){return zip_prev[zip_WSIZE+i]=val};var zip_put_byte=function(c){zip_outbuf[zip_outoff+zip_outcnt++]=c;if(zip_outoff+zip_outcnt==zip_OUTBUFSIZ)zip_qoutbuf()};var zip_put_short=function(w){w&=65535;if(zip_outoff+zip_outcnt<zip_OUTBUFSIZ-2){zip_outbuf[zip_outoff+zip_outcnt++]=w&255;zip_outbuf[zip_outoff+zip_outcnt++]=w>>>8}else{zip_put_byte(w&255);zip_put_byte(w>>>8)}};var zip_INSERT_STRING=function(){zip_ins_h=(zip_ins_h<<zip_H_SHIFT^zip_window[zip_strstart+zip_MIN_MATCH-1]&255)&zip_HASH_MASK;zip_hash_head=zip_head1(zip_ins_h);zip_prev[zip_strstart&zip_WMASK]=zip_hash_head;zip_head2(zip_ins_h,zip_strstart)};var zip_SEND_CODE=function(c,tree){zip_send_bits(tree[c].fc,tree[c].dl)};var zip_D_CODE=function(dist){return(dist<256?zip_dist_code[dist]:zip_dist_code[256+(dist>>7)])&255};var zip_SMALLER=function(tree,n,m){return tree[n].fc<tree[m].fc||tree[n].fc==tree[m].fc&&zip_depth[n]<=zip_depth[m]};var zip_read_buff=function(buff,offset,n){var i;for(i=0;i<n&&zip_deflate_pos<zip_deflate_data.length;i++)buff[offset+i]=zip_deflate_data.charCodeAt(zip_deflate_pos++)&255;return i};var zip_lm_init=function(){var j;for(j=0;j<zip_HASH_SIZE;j++)zip_prev[zip_WSIZE+j]=0;zip_max_lazy_match=zip_configuration_table[zip_compr_level].max_lazy;zip_good_match=zip_configuration_table[zip_compr_level].good_length;if(!zip_FULL_SEARCH)zip_nice_match=zip_configuration_table[zip_compr_level].nice_length;zip_max_chain_length=zip_configuration_table[zip_compr_level].max_chain;zip_strstart=0;zip_block_start=0;zip_lookahead=zip_read_buff(zip_window,0,2*zip_WSIZE);if(zip_lookahead<=0){zip_eofile=true;zip_lookahead=0;return}zip_eofile=false;while(zip_lookahead<zip_MIN_LOOKAHEAD&&!zip_eofile)zip_fill_window();zip_ins_h=0;for(j=0;j<zip_MIN_MATCH-1;j++){zip_ins_h=(zip_ins_h<<zip_H_SHIFT^zip_window[j]&255)&zip_HASH_MASK}};var zip_longest_match=function(cur_match){var chain_length=zip_max_chain_length;var scanp=zip_strstart;var matchp;var len;var best_len=zip_prev_length;var limit=zip_strstart>zip_MAX_DIST?zip_strstart-zip_MAX_DIST:zip_NIL;var strendp=zip_strstart+zip_MAX_MATCH;var scan_end1=zip_window[scanp+best_len-1];var scan_end=zip_window[scanp+best_len];if(zip_prev_length>=zip_good_match)chain_length>>=2;do{matchp=cur_match;if(zip_window[matchp+best_len]!=scan_end||zip_window[matchp+best_len-1]!=scan_end1||zip_window[matchp]!=zip_window[scanp]||zip_window[++matchp]!=zip_window[scanp+1]){continue}scanp+=2;matchp++;do{}while(zip_window[++scanp]==zip_window[++matchp]&&zip_window[++scanp]==zip_window[++matchp]&&zip_window[++scanp]==zip_window[++matchp]&&zip_window[++scanp]==zip_window[++matchp]&&zip_window[++scanp]==zip_window[++matchp]&&zip_window[++scanp]==zip_window[++matchp]&&zip_window[++scanp]==zip_window[++matchp]&&zip_window[++scanp]==zip_window[++matchp]&&scanp<strendp);len=zip_MAX_MATCH-(strendp-scanp);scanp=strendp-zip_MAX_MATCH;if(len>best_len){zip_match_start=cur_match;best_len=len;if(zip_FULL_SEARCH){if(len>=zip_MAX_MATCH)break}else{if(len>=zip_nice_match)break}scan_end1=zip_window[scanp+best_len-1];scan_end=zip_window[scanp+best_len]}}while((cur_match=zip_prev[cur_match&zip_WMASK])>limit&&--chain_length!=0);return best_len};var zip_fill_window=function(){var n,m;var more=zip_window_size-zip_lookahead-zip_strstart;if(more==-1){more--}else if(zip_strstart>=zip_WSIZE+zip_MAX_DIST){for(n=0;n<zip_WSIZE;n++)zip_window[n]=zip_window[n+zip_WSIZE];zip_match_start-=zip_WSIZE;zip_strstart-=zip_WSIZE;zip_block_start-=zip_WSIZE;for(n=0;n<zip_HASH_SIZE;n++){m=zip_head1(n);zip_head2(n,m>=zip_WSIZE?m-zip_WSIZE:zip_NIL)}for(n=0;n<zip_WSIZE;n++){m=zip_prev[n];zip_prev[n]=m>=zip_WSIZE?m-zip_WSIZE:zip_NIL}more+=zip_WSIZE}if(!zip_eofile){n=zip_read_buff(zip_window,zip_strstart+zip_lookahead,more);if(n<=0)zip_eofile=true;else zip_lookahead+=n}};var zip_deflate_fast=function(){while(zip_lookahead!=0&&zip_qhead==null){var flush;zip_INSERT_STRING();if(zip_hash_head!=zip_NIL&&zip_strstart-zip_hash_head<=zip_MAX_DIST){zip_match_length=zip_longest_match(zip_hash_head);if(zip_match_length>zip_lookahead)zip_match_length=zip_lookahead}if(zip_match_length>=zip_MIN_MATCH){flush=zip_ct_tally(zip_strstart-zip_match_start,zip_match_length-zip_MIN_MATCH);zip_lookahead-=zip_match_length;if(zip_match_length<=zip_max_lazy_match){zip_match_length--;do{zip_strstart++;zip_INSERT_STRING()}while(--zip_match_length!=0);zip_strstart++}else{zip_strstart+=zip_match_length;zip_match_length=0;zip_ins_h=zip_window[zip_strstart]&255;zip_ins_h=(zip_ins_h<<zip_H_SHIFT^zip_window[zip_strstart+1]&255)&zip_HASH_MASK}}else{flush=zip_ct_tally(0,zip_window[zip_strstart]&255);zip_lookahead--;zip_strstart++}if(flush){zip_flush_block(0);zip_block_start=zip_strstart}while(zip_lookahead<zip_MIN_LOOKAHEAD&&!zip_eofile)zip_fill_window()}};var zip_deflate_better=function(){while(zip_lookahead!=0&&zip_qhead==null){zip_INSERT_STRING();zip_prev_length=zip_match_length;zip_prev_match=zip_match_start;zip_match_length=zip_MIN_MATCH-1;if(zip_hash_head!=zip_NIL&&zip_prev_length<zip_max_lazy_match&&zip_strstart-zip_hash_head<=zip_MAX_DIST){zip_match_length=zip_longest_match(zip_hash_head);if(zip_match_length>zip_lookahead)zip_match_length=zip_lookahead;if(zip_match_length==zip_MIN_MATCH&&zip_strstart-zip_match_start>zip_TOO_FAR){zip_match_length--}}if(zip_prev_length>=zip_MIN_MATCH&&zip_match_length<=zip_prev_length){var flush;flush=zip_ct_tally(zip_strstart-1-zip_prev_match,zip_prev_length-zip_MIN_MATCH);zip_lookahead-=zip_prev_length-1;zip_prev_length-=2;do{zip_strstart++;zip_INSERT_STRING()}while(--zip_prev_length!=0);zip_match_available=0;zip_match_length=zip_MIN_MATCH-1;zip_strstart++;if(flush){zip_flush_block(0);zip_block_start=zip_strstart}}else if(zip_match_available!=0){if(zip_ct_tally(0,zip_window[zip_strstart-1]&255)){zip_flush_block(0);zip_block_start=zip_strstart}zip_strstart++;zip_lookahead--}else{zip_match_available=1;zip_strstart++;zip_lookahead--}while(zip_lookahead<zip_MIN_LOOKAHEAD&&!zip_eofile)zip_fill_window()}};var zip_init_deflate=function(){if(zip_eofile)return;zip_bi_buf=0;zip_bi_valid=0;zip_ct_init();zip_lm_init();zip_qhead=null;zip_outcnt=0;zip_outoff=0;if(zip_compr_level<=3){zip_prev_length=zip_MIN_MATCH-1;zip_match_length=0}else{zip_match_length=zip_MIN_MATCH-1;zip_match_available=0}zip_complete=false};var zip_deflate_internal=function(buff,off,buff_size){var n;if(!zip_initflag){zip_init_deflate();zip_initflag=true;if(zip_lookahead==0){zip_complete=true;return 0}}if((n=zip_qcopy(buff,off,buff_size))==buff_size)return buff_size;if(zip_complete)return n;if(zip_compr_level<=3)zip_deflate_fast();else zip_deflate_better();if(zip_lookahead==0){if(zip_match_available!=0)zip_ct_tally(0,zip_window[zip_strstart-1]&255);zip_flush_block(1);zip_complete=true}return n+zip_qcopy(buff,n+off,buff_size-n)};var zip_qcopy=function(buff,off,buff_size){var n,i,j;n=0;while(zip_qhead!=null&&n<buff_size){i=buff_size-n;if(i>zip_qhead.len)i=zip_qhead.len;for(j=0;j<i;j++)buff[off+n+j]=zip_qhead.ptr[zip_qhead.off+j];zip_qhead.off+=i;zip_qhead.len-=i;n+=i;if(zip_qhead.len==0){var p;p=zip_qhead;zip_qhead=zip_qhead.next;zip_reuse_queue(p)}}if(n==buff_size)return n;if(zip_outoff<zip_outcnt){i=buff_size-n;if(i>zip_outcnt-zip_outoff)i=zip_outcnt-zip_outoff;for(j=0;j<i;j++)buff[off+n+j]=zip_outbuf[zip_outoff+j];zip_outoff+=i;n+=i;if(zip_outcnt==zip_outoff)zip_outcnt=zip_outoff=0}return n};var zip_ct_init=function(){var n;var bits;var length;var code;var dist;if(zip_static_dtree[0].dl!=0)return;zip_l_desc.dyn_tree=zip_dyn_ltree;zip_l_desc.static_tree=zip_static_ltree;zip_l_desc.extra_bits=zip_extra_lbits;zip_l_desc.extra_base=zip_LITERALS+1;zip_l_desc.elems=zip_L_CODES;zip_l_desc.max_length=zip_MAX_BITS;zip_l_desc.max_code=0;zip_d_desc.dyn_tree=zip_dyn_dtree;zip_d_desc.static_tree=zip_static_dtree;zip_d_desc.extra_bits=zip_extra_dbits;zip_d_desc.extra_base=0;zip_d_desc.elems=zip_D_CODES;zip_d_desc.max_length=zip_MAX_BITS;zip_d_desc.max_code=0;zip_bl_desc.dyn_tree=zip_bl_tree;zip_bl_desc.static_tree=null;zip_bl_desc.extra_bits=zip_extra_blbits;zip_bl_desc.extra_base=0;zip_bl_desc.elems=zip_BL_CODES;zip_bl_desc.max_length=zip_MAX_BL_BITS;zip_bl_desc.max_code=0;length=0;for(code=0;code<zip_LENGTH_CODES-1;code++){zip_base_length[code]=length;for(n=0;n<1<<zip_extra_lbits[code];n++)zip_length_code[length++]=code}zip_length_code[length-1]=code;dist=0;for(code=0;code<16;code++){zip_base_dist[code]=dist;for(n=0;n<1<<zip_extra_dbits[code];n++){zip_dist_code[dist++]=code}}dist>>=7;for(;code<zip_D_CODES;code++){zip_base_dist[code]=dist<<7;for(n=0;n<1<<zip_extra_dbits[code]-7;n++)zip_dist_code[256+dist++]=code}for(bits=0;bits<=zip_MAX_BITS;bits++)zip_bl_count[bits]=0;n=0;while(n<=143){zip_static_ltree[n++].dl=8;zip_bl_count[8]++}while(n<=255){zip_static_ltree[n++].dl=9;zip_bl_count[9]++}while(n<=279){zip_static_ltree[n++].dl=7;zip_bl_count[7]++}while(n<=287){zip_static_ltree[n++].dl=8;zip_bl_count[8]++}zip_gen_codes(zip_static_ltree,zip_L_CODES+1);for(n=0;n<zip_D_CODES;n++){zip_static_dtree[n].dl=5;zip_static_dtree[n].fc=zip_bi_reverse(n,5)}zip_init_block()};var zip_init_block=function(){var n;for(n=0;n<zip_L_CODES;n++)zip_dyn_ltree[n].fc=0;for(n=0;n<zip_D_CODES;n++)zip_dyn_dtree[n].fc=0;for(n=0;n<zip_BL_CODES;n++)zip_bl_tree[n].fc=0;zip_dyn_ltree[zip_END_BLOCK].fc=1;zip_opt_len=zip_static_len=0;zip_last_lit=zip_last_dist=zip_last_flags=0;zip_flags=0;zip_flag_bit=1};var zip_pqdownheap=function(tree,k){var v=zip_heap[k];var j=k<<1;while(j<=zip_heap_len){if(j<zip_heap_len&&zip_SMALLER(tree,zip_heap[j+1],zip_heap[j]))j++;if(zip_SMALLER(tree,v,zip_heap[j]))break;zip_heap[k]=zip_heap[j];k=j;j<<=1}zip_heap[k]=v};var zip_gen_bitlen=function(desc){var tree=desc.dyn_tree;var extra=desc.extra_bits;var base=desc.extra_base;var max_code=desc.max_code;var max_length=desc.max_length;var stree=desc.static_tree;var h;var n,m;var bits;var xbits;var f;var overflow=0;for(bits=0;bits<=zip_MAX_BITS;bits++)zip_bl_count[bits]=0;tree[zip_heap[zip_heap_max]].dl=0;for(h=zip_heap_max+1;h<zip_HEAP_SIZE;h++){n=zip_heap[h];bits=tree[tree[n].dl].dl+1;if(bits>max_length){bits=max_length;overflow++}tree[n].dl=bits;if(n>max_code)continue;zip_bl_count[bits]++;xbits=0;if(n>=base)xbits=extra[n-base];f=tree[n].fc;zip_opt_len+=f*(bits+xbits);if(stree!=null)zip_static_len+=f*(stree[n].dl+xbits)}if(overflow==0)return;do{bits=max_length-1;while(zip_bl_count[bits]==0)bits--;zip_bl_count[bits]--;zip_bl_count[bits+1]+=2;zip_bl_count[max_length]--;overflow-=2}while(overflow>0);for(bits=max_length;bits!=0;bits--){n=zip_bl_count[bits];while(n!=0){m=zip_heap[--h];if(m>max_code)continue;if(tree[m].dl!=bits){zip_opt_len+=(bits-tree[m].dl)*tree[m].fc;tree[m].fc=bits}n--}}};var zip_gen_codes=function(tree,max_code){var next_code=new Array(zip_MAX_BITS+1);var code=0;var bits;var n;for(bits=1;bits<=zip_MAX_BITS;bits++){code=code+zip_bl_count[bits-1]<<1;next_code[bits]=code}for(n=0;n<=max_code;n++){var len=tree[n].dl;if(len==0)continue;tree[n].fc=zip_bi_reverse(next_code[len]++,len)}};var zip_build_tree=function(desc){var tree=desc.dyn_tree;var stree=desc.static_tree;var elems=desc.elems;var n,m;var max_code=-1;var node=elems;zip_heap_len=0;zip_heap_max=zip_HEAP_SIZE;for(n=0;n<elems;n++){if(tree[n].fc!=0){zip_heap[++zip_heap_len]=max_code=n;zip_depth[n]=0}else tree[n].dl=0}while(zip_heap_len<2){var xnew=zip_heap[++zip_heap_len]=max_code<2?++max_code:0;tree[xnew].fc=1;zip_depth[xnew]=0;zip_opt_len--;if(stree!=null)zip_static_len-=stree[xnew].dl}desc.max_code=max_code;for(n=zip_heap_len>>1;n>=1;n--)zip_pqdownheap(tree,n);do{n=zip_heap[zip_SMALLEST];zip_heap[zip_SMALLEST]=zip_heap[zip_heap_len--];zip_pqdownheap(tree,zip_SMALLEST);m=zip_heap[zip_SMALLEST];zip_heap[--zip_heap_max]=n;zip_heap[--zip_heap_max]=m;tree[node].fc=tree[n].fc+tree[m].fc;if(zip_depth[n]>zip_depth[m]+1)zip_depth[node]=zip_depth[n];else zip_depth[node]=zip_depth[m]+1;tree[n].dl=tree[m].dl=node;zip_heap[zip_SMALLEST]=node++;zip_pqdownheap(tree,zip_SMALLEST)}while(zip_heap_len>=2);zip_heap[--zip_heap_max]=zip_heap[zip_SMALLEST];zip_gen_bitlen(desc);zip_gen_codes(tree,max_code)};var zip_scan_tree=function(tree,max_code){var n;var prevlen=-1;var curlen;var nextlen=tree[0].dl;var count=0;var max_count=7;var min_count=4;if(nextlen==0){max_count=138;min_count=3}tree[max_code+1].dl=65535;for(n=0;n<=max_code;n++){curlen=nextlen;nextlen=tree[n+1].dl;if(++count<max_count&&curlen==nextlen)continue;else if(count<min_count)zip_bl_tree[curlen].fc+=count;else if(curlen!=0){if(curlen!=prevlen)zip_bl_tree[curlen].fc++;zip_bl_tree[zip_REP_3_6].fc++}else if(count<=10)zip_bl_tree[zip_REPZ_3_10].fc++;else zip_bl_tree[zip_REPZ_11_138].fc++;count=0;prevlen=curlen;if(nextlen==0){max_count=138;min_count=3}else if(curlen==nextlen){max_count=6;min_count=3}else{max_count=7;min_count=4}}};var zip_send_tree=function(tree,max_code){var n;var prevlen=-1;var curlen;var nextlen=tree[0].dl;var count=0;var max_count=7;var min_count=4;if(nextlen==0){max_count=138;min_count=3}for(n=0;n<=max_code;n++){curlen=nextlen;
nextlen=tree[n+1].dl;if(++count<max_count&&curlen==nextlen){continue}else if(count<min_count){do{zip_SEND_CODE(curlen,zip_bl_tree)}while(--count!=0)}else if(curlen!=0){if(curlen!=prevlen){zip_SEND_CODE(curlen,zip_bl_tree);count--}zip_SEND_CODE(zip_REP_3_6,zip_bl_tree);zip_send_bits(count-3,2)}else if(count<=10){zip_SEND_CODE(zip_REPZ_3_10,zip_bl_tree);zip_send_bits(count-3,3)}else{zip_SEND_CODE(zip_REPZ_11_138,zip_bl_tree);zip_send_bits(count-11,7)}count=0;prevlen=curlen;if(nextlen==0){max_count=138;min_count=3}else if(curlen==nextlen){max_count=6;min_count=3}else{max_count=7;min_count=4}}};var zip_build_bl_tree=function(){var max_blindex;zip_scan_tree(zip_dyn_ltree,zip_l_desc.max_code);zip_scan_tree(zip_dyn_dtree,zip_d_desc.max_code);zip_build_tree(zip_bl_desc);for(max_blindex=zip_BL_CODES-1;max_blindex>=3;max_blindex--){if(zip_bl_tree[zip_bl_order[max_blindex]].dl!=0)break}zip_opt_len+=3*(max_blindex+1)+5+5+4;return max_blindex};var zip_send_all_trees=function(lcodes,dcodes,blcodes){var rank;zip_send_bits(lcodes-257,5);zip_send_bits(dcodes-1,5);zip_send_bits(blcodes-4,4);for(rank=0;rank<blcodes;rank++){zip_send_bits(zip_bl_tree[zip_bl_order[rank]].dl,3)}zip_send_tree(zip_dyn_ltree,lcodes-1);zip_send_tree(zip_dyn_dtree,dcodes-1)};var zip_flush_block=function(eof){var opt_lenb,static_lenb;var max_blindex;var stored_len;stored_len=zip_strstart-zip_block_start;zip_flag_buf[zip_last_flags]=zip_flags;zip_build_tree(zip_l_desc);zip_build_tree(zip_d_desc);max_blindex=zip_build_bl_tree();opt_lenb=zip_opt_len+3+7>>3;static_lenb=zip_static_len+3+7>>3;if(static_lenb<=opt_lenb)opt_lenb=static_lenb;if(stored_len+4<=opt_lenb&&zip_block_start>=0){var i;zip_send_bits((zip_STORED_BLOCK<<1)+eof,3);zip_bi_windup();zip_put_short(stored_len);zip_put_short(~stored_len);for(i=0;i<stored_len;i++)zip_put_byte(zip_window[zip_block_start+i])}else if(static_lenb==opt_lenb){zip_send_bits((zip_STATIC_TREES<<1)+eof,3);zip_compress_block(zip_static_ltree,zip_static_dtree)}else{zip_send_bits((zip_DYN_TREES<<1)+eof,3);zip_send_all_trees(zip_l_desc.max_code+1,zip_d_desc.max_code+1,max_blindex+1);zip_compress_block(zip_dyn_ltree,zip_dyn_dtree)}zip_init_block();if(eof!=0)zip_bi_windup()};var zip_ct_tally=function(dist,lc){zip_l_buf[zip_last_lit++]=lc;if(dist==0){zip_dyn_ltree[lc].fc++}else{dist--;zip_dyn_ltree[zip_length_code[lc]+zip_LITERALS+1].fc++;zip_dyn_dtree[zip_D_CODE(dist)].fc++;zip_d_buf[zip_last_dist++]=dist;zip_flags|=zip_flag_bit}zip_flag_bit<<=1;if((zip_last_lit&7)==0){zip_flag_buf[zip_last_flags++]=zip_flags;zip_flags=0;zip_flag_bit=1}if(zip_compr_level>2&&(zip_last_lit&4095)==0){var out_length=zip_last_lit*8;var in_length=zip_strstart-zip_block_start;var dcode;for(dcode=0;dcode<zip_D_CODES;dcode++){out_length+=zip_dyn_dtree[dcode].fc*(5+zip_extra_dbits[dcode])}out_length>>=3;if(zip_last_dist<parseInt(zip_last_lit/2)&&out_length<parseInt(in_length/2))return true}return zip_last_lit==zip_LIT_BUFSIZE-1||zip_last_dist==zip_DIST_BUFSIZE};var zip_compress_block=function(ltree,dtree){var dist;var lc;var lx=0;var dx=0;var fx=0;var flag=0;var code;var extra;if(zip_last_lit!=0)do{if((lx&7)==0)flag=zip_flag_buf[fx++];lc=zip_l_buf[lx++]&255;if((flag&1)==0){zip_SEND_CODE(lc,ltree)}else{code=zip_length_code[lc];zip_SEND_CODE(code+zip_LITERALS+1,ltree);extra=zip_extra_lbits[code];if(extra!=0){lc-=zip_base_length[code];zip_send_bits(lc,extra)}dist=zip_d_buf[dx++];code=zip_D_CODE(dist);zip_SEND_CODE(code,dtree);extra=zip_extra_dbits[code];if(extra!=0){dist-=zip_base_dist[code];zip_send_bits(dist,extra)}}flag>>=1}while(lx<zip_last_lit);zip_SEND_CODE(zip_END_BLOCK,ltree)};var zip_Buf_size=16;var zip_send_bits=function(value,length){if(zip_bi_valid>zip_Buf_size-length){zip_bi_buf|=value<<zip_bi_valid;zip_put_short(zip_bi_buf);zip_bi_buf=value>>zip_Buf_size-zip_bi_valid;zip_bi_valid+=length-zip_Buf_size}else{zip_bi_buf|=value<<zip_bi_valid;zip_bi_valid+=length}};var zip_bi_reverse=function(code,len){var res=0;do{res|=code&1;code>>=1;res<<=1}while(--len>0);return res>>1};var zip_bi_windup=function(){if(zip_bi_valid>8){zip_put_short(zip_bi_buf)}else if(zip_bi_valid>0){zip_put_byte(zip_bi_buf)}zip_bi_buf=0;zip_bi_valid=0};var zip_qoutbuf=function(){if(zip_outcnt!=0){var q,i;q=zip_new_queue();if(zip_qhead==null)zip_qhead=zip_qtail=q;else zip_qtail=zip_qtail.next=q;q.len=zip_outcnt-zip_outoff;for(i=0;i<q.len;i++)q.ptr[i]=zip_outbuf[zip_outoff+i];zip_outcnt=zip_outoff=0}};var zip_deflate=function(str,level){var i,j;zip_deflate_data=str;zip_deflate_pos=0;if(typeof level=="undefined")level=zip_DEFAULT_LEVEL;zip_deflate_start(level);var buff=new Array(1024);var aout=[];while((i=zip_deflate_internal(buff,0,buff.length))>0){var cbuf=new Array(i);for(j=0;j<i;j++){cbuf[j]=String.fromCharCode(buff[j])}aout[aout.length]=cbuf.join("")}zip_deflate_data=null;return aout.join("")};if(!JSZip.compressions["DEFLATE"]){JSZip.compressions["DEFLATE"]={magic:"\b\0",compress:zip_deflate}}else{JSZip.compressions["DEFLATE"].compress=zip_deflate}})();if(!JSZip){throw"JSZip not defined"}(function(){var zip_fixed_bd;var zip_WSIZE=32768;var zip_STORED_BLOCK=0;var zip_STATIC_TREES=1;var zip_DYN_TREES=2;var zip_lbits=9;var zip_dbits=6;var zip_INBUFSIZ=32768;var zip_INBUF_EXTRA=64;var zip_slide;var zip_wp;var zip_fixed_tl=null;var zip_fixed_td;var zip_fixed_bl,fixed_bd;var zip_bit_buf;var zip_bit_len;var zip_method;var zip_eof;var zip_copy_leng;var zip_copy_dist;var zip_tl,zip_td;var zip_bl,zip_bd;var zip_inflate_data;var zip_inflate_pos;var zip_MASK_BITS=new Array(0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535);var zip_cplens=new Array(3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0);var zip_cplext=new Array(0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99);var zip_cpdist=new Array(1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577);var zip_cpdext=new Array(0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13);var zip_border=new Array(16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15);function zip_HuftList(){this.next=null;this.list=null}function zip_HuftNode(){this.e=0;this.b=0;this.n=0;this.t=null}function zip_HuftBuild(b,n,s,d,e,mm){this.BMAX=16;this.N_MAX=288;this.status=0;this.root=null;this.m=0;{var a;var c=new Array(this.BMAX+1);var el;var f;var g;var h;var i;var j;var k;var lx=new Array(this.BMAX+1);var p;var pidx;var q;var r=new zip_HuftNode;var u=new Array(this.BMAX);var v=new Array(this.N_MAX);var w;var x=new Array(this.BMAX+1);var xp;var y;var z;var o;var tail;tail=this.root=null;for(i=0;i<c.length;i++)c[i]=0;for(i=0;i<lx.length;i++)lx[i]=0;for(i=0;i<u.length;i++)u[i]=null;for(i=0;i<v.length;i++)v[i]=0;for(i=0;i<x.length;i++)x[i]=0;el=n>256?b[256]:this.BMAX;p=b;pidx=0;i=n;do{c[p[pidx]]++;pidx++}while(--i>0);if(c[0]==n){this.root=null;this.m=0;this.status=0;return}for(j=1;j<=this.BMAX;j++)if(c[j]!=0)break;k=j;if(mm<j)mm=j;for(i=this.BMAX;i!=0;i--)if(c[i]!=0)break;g=i;if(mm>i)mm=i;for(y=1<<j;j<i;j++,y<<=1)if((y-=c[j])<0){this.status=2;this.m=mm;return}if((y-=c[i])<0){this.status=2;this.m=mm;return}c[i]+=y;x[1]=j=0;p=c;pidx=1;xp=2;while(--i>0)x[xp++]=j+=p[pidx++];p=b;pidx=0;i=0;do{if((j=p[pidx++])!=0)v[x[j]++]=i}while(++i<n);n=x[g];x[0]=i=0;p=v;pidx=0;h=-1;w=lx[0]=0;q=null;z=0;for(;k<=g;k++){a=c[k];while(a-->0){while(k>w+lx[1+h]){w+=lx[1+h];h++;z=(z=g-w)>mm?mm:z;if((f=1<<(j=k-w))>a+1){f-=a+1;xp=k;while(++j<z){if((f<<=1)<=c[++xp])break;f-=c[xp]}}if(w+j>el&&w<el)j=el-w;z=1<<j;lx[1+h]=j;q=new Array(z);for(o=0;o<z;o++){q[o]=new zip_HuftNode}if(tail==null)tail=this.root=new zip_HuftList;else tail=tail.next=new zip_HuftList;tail.next=null;tail.list=q;u[h]=q;if(h>0){x[h]=i;r.b=lx[h];r.e=16+j;r.t=q;j=(i&(1<<w)-1)>>w-lx[h];u[h-1][j].e=r.e;u[h-1][j].b=r.b;u[h-1][j].n=r.n;u[h-1][j].t=r.t}}r.b=k-w;if(pidx>=n)r.e=99;else if(p[pidx]<s){r.e=p[pidx]<256?16:15;r.n=p[pidx++]}else{r.e=e[p[pidx]-s];r.n=d[p[pidx++]-s]}f=1<<k-w;for(j=i>>w;j<z;j+=f){q[j].e=r.e;q[j].b=r.b;q[j].n=r.n;q[j].t=r.t}for(j=1<<k-1;(i&j)!=0;j>>=1)i^=j;i^=j;while((i&(1<<w)-1)!=x[h]){w-=lx[h];h--}}}this.m=lx[1];this.status=y!=0&&g!=1?1:0}}function zip_GET_BYTE(){if(zip_inflate_data.length==zip_inflate_pos)return-1;return zip_inflate_data.charCodeAt(zip_inflate_pos++)&255}function zip_NEEDBITS(n){while(zip_bit_len<n){zip_bit_buf|=zip_GET_BYTE()<<zip_bit_len;zip_bit_len+=8}}function zip_GETBITS(n){return zip_bit_buf&zip_MASK_BITS[n]}function zip_DUMPBITS(n){zip_bit_buf>>=n;zip_bit_len-=n}function zip_inflate_codes(buff,off,size){var e;var t;var n;if(size==0)return 0;n=0;for(;;){zip_NEEDBITS(zip_bl);t=zip_tl.list[zip_GETBITS(zip_bl)];e=t.e;while(e>16){if(e==99)return-1;zip_DUMPBITS(t.b);e-=16;zip_NEEDBITS(e);t=t.t[zip_GETBITS(e)];e=t.e}zip_DUMPBITS(t.b);if(e==16){zip_wp&=zip_WSIZE-1;buff[off+n++]=zip_slide[zip_wp++]=t.n;if(n==size)return size;continue}if(e==15)break;zip_NEEDBITS(e);zip_copy_leng=t.n+zip_GETBITS(e);zip_DUMPBITS(e);zip_NEEDBITS(zip_bd);t=zip_td.list[zip_GETBITS(zip_bd)];e=t.e;while(e>16){if(e==99)return-1;zip_DUMPBITS(t.b);e-=16;zip_NEEDBITS(e);t=t.t[zip_GETBITS(e)];e=t.e}zip_DUMPBITS(t.b);zip_NEEDBITS(e);zip_copy_dist=zip_wp-t.n-zip_GETBITS(e);zip_DUMPBITS(e);while(zip_copy_leng>0&&n<size){zip_copy_leng--;zip_copy_dist&=zip_WSIZE-1;zip_wp&=zip_WSIZE-1;buff[off+n++]=zip_slide[zip_wp++]=zip_slide[zip_copy_dist++]}if(n==size)return size}zip_method=-1;return n}function zip_inflate_stored(buff,off,size){var n;n=zip_bit_len&7;zip_DUMPBITS(n);zip_NEEDBITS(16);n=zip_GETBITS(16);zip_DUMPBITS(16);zip_NEEDBITS(16);if(n!=(~zip_bit_buf&65535))return-1;zip_DUMPBITS(16);zip_copy_leng=n;n=0;while(zip_copy_leng>0&&n<size){zip_copy_leng--;zip_wp&=zip_WSIZE-1;zip_NEEDBITS(8);buff[off+n++]=zip_slide[zip_wp++]=zip_GETBITS(8);zip_DUMPBITS(8)}if(zip_copy_leng==0)zip_method=-1;return n}function zip_inflate_fixed(buff,off,size){if(zip_fixed_tl==null){var i;var l=new Array(288);var h;for(i=0;i<144;i++)l[i]=8;for(;i<256;i++)l[i]=9;for(;i<280;i++)l[i]=7;for(;i<288;i++)l[i]=8;zip_fixed_bl=7;h=new zip_HuftBuild(l,288,257,zip_cplens,zip_cplext,zip_fixed_bl);if(h.status!=0){alert("HufBuild error: "+h.status);return-1}zip_fixed_tl=h.root;zip_fixed_bl=h.m;for(i=0;i<30;i++)l[i]=5;zip_fixed_bd=5;h=new zip_HuftBuild(l,30,0,zip_cpdist,zip_cpdext,zip_fixed_bd);if(h.status>1){zip_fixed_tl=null;alert("HufBuild error: "+h.status);return-1}zip_fixed_td=h.root;zip_fixed_bd=h.m}zip_tl=zip_fixed_tl;zip_td=zip_fixed_td;zip_bl=zip_fixed_bl;zip_bd=zip_fixed_bd;return zip_inflate_codes(buff,off,size)}function zip_inflate_dynamic(buff,off,size){var i;var j;var l;var n;var t;var nb;var nl;var nd;var ll=new Array(286+30);var h;for(i=0;i<ll.length;i++)ll[i]=0;zip_NEEDBITS(5);nl=257+zip_GETBITS(5);zip_DUMPBITS(5);zip_NEEDBITS(5);nd=1+zip_GETBITS(5);zip_DUMPBITS(5);zip_NEEDBITS(4);nb=4+zip_GETBITS(4);zip_DUMPBITS(4);if(nl>286||nd>30)return-1;for(j=0;j<nb;j++){zip_NEEDBITS(3);ll[zip_border[j]]=zip_GETBITS(3);zip_DUMPBITS(3)}for(;j<19;j++)ll[zip_border[j]]=0;zip_bl=7;h=new zip_HuftBuild(ll,19,19,null,null,zip_bl);if(h.status!=0)return-1;zip_tl=h.root;zip_bl=h.m;n=nl+nd;i=l=0;while(i<n){zip_NEEDBITS(zip_bl);t=zip_tl.list[zip_GETBITS(zip_bl)];j=t.b;zip_DUMPBITS(j);j=t.n;if(j<16)ll[i++]=l=j;else if(j==16){zip_NEEDBITS(2);j=3+zip_GETBITS(2);zip_DUMPBITS(2);if(i+j>n)return-1;while(j-->0)ll[i++]=l}else if(j==17){zip_NEEDBITS(3);j=3+zip_GETBITS(3);zip_DUMPBITS(3);if(i+j>n)return-1;while(j-->0)ll[i++]=0;l=0}else{zip_NEEDBITS(7);j=11+zip_GETBITS(7);zip_DUMPBITS(7);if(i+j>n)return-1;while(j-->0)ll[i++]=0;l=0}}zip_bl=zip_lbits;h=new zip_HuftBuild(ll,nl,257,zip_cplens,zip_cplext,zip_bl);if(zip_bl==0)h.status=1;if(h.status!=0){if(h.status==1);return-1}zip_tl=h.root;zip_bl=h.m;for(i=0;i<nd;i++)ll[i]=ll[i+nl];zip_bd=zip_dbits;h=new zip_HuftBuild(ll,nd,0,zip_cpdist,zip_cpdext,zip_bd);zip_td=h.root;zip_bd=h.m;if(zip_bd==0&&nl>257){return-1}if(h.status==1){}if(h.status!=0)return-1;return zip_inflate_codes(buff,off,size)}function zip_inflate_start(){var i;if(zip_slide==null)zip_slide=new Array(2*zip_WSIZE);zip_wp=0;zip_bit_buf=0;zip_bit_len=0;zip_method=-1;zip_eof=false;zip_copy_leng=zip_copy_dist=0;zip_tl=null}function zip_inflate_internal(buff,off,size){var n,i;n=0;while(n<size){if(zip_eof&&zip_method==-1)return n;if(zip_copy_leng>0){if(zip_method!=zip_STORED_BLOCK){while(zip_copy_leng>0&&n<size){zip_copy_leng--;zip_copy_dist&=zip_WSIZE-1;zip_wp&=zip_WSIZE-1;buff[off+n++]=zip_slide[zip_wp++]=zip_slide[zip_copy_dist++]}}else{while(zip_copy_leng>0&&n<size){zip_copy_leng--;zip_wp&=zip_WSIZE-1;zip_NEEDBITS(8);buff[off+n++]=zip_slide[zip_wp++]=zip_GETBITS(8);zip_DUMPBITS(8)}if(zip_copy_leng==0)zip_method=-1}if(n==size)return n}if(zip_method==-1){if(zip_eof)break;zip_NEEDBITS(1);if(zip_GETBITS(1)!=0)zip_eof=true;zip_DUMPBITS(1);zip_NEEDBITS(2);zip_method=zip_GETBITS(2);zip_DUMPBITS(2);zip_tl=null;zip_copy_leng=0}switch(zip_method){case 0:i=zip_inflate_stored(buff,off+n,size-n);break;case 1:if(zip_tl!=null)i=zip_inflate_codes(buff,off+n,size-n);else i=zip_inflate_fixed(buff,off+n,size-n);break;case 2:if(zip_tl!=null)i=zip_inflate_codes(buff,off+n,size-n);else i=zip_inflate_dynamic(buff,off+n,size-n);break;default:i=-1;break}if(i==-1){if(zip_eof)return 0;return-1}n+=i}return n}function zip_inflate(str){var out,buff;var i,j;zip_inflate_start();zip_inflate_data=str;zip_inflate_pos=0;buff=new Array(1024);out="";while((i=zip_inflate_internal(buff,0,buff.length))>0){for(j=0;j<i;j++)out+=String.fromCharCode(buff[j])}zip_inflate_data=null;return out}if(!JSZip.compressions["DEFLATE"]){JSZip.compressions["DEFLATE"]={magic:"\b\0",uncompress:zip_inflate}}else{JSZip.compressions["DEFLATE"].uncompress=zip_inflate}})();(function(){var MAX_VALUE_16BITS=65535;var MAX_VALUE_32BITS=-1;var pretty=function(str){var res="",code,i;for(i=0;i<(str||"").length;i++){code=str.charCodeAt(i);res+="\\x"+(code<16?"0":"")+code.toString(16).toUpperCase()}return res};var findCompression=function(compressionMethod){for(var method in JSZip.compressions){if(!JSZip.compressions.hasOwnProperty(method)){continue}if(JSZip.compressions[method].magic===compressionMethod){return JSZip.compressions[method]}}return null};function StreamReader(stream){this.stream="";if(JSZip.support.uint8array&&stream instanceof Uint8Array){this.stream=JSZip.utils.uint8Array2String(stream)}else if(JSZip.support.arraybuffer&&stream instanceof ArrayBuffer){var bufferView=new Uint8Array(stream);this.stream=JSZip.utils.uint8Array2String(bufferView)}else{this.stream=JSZip.utils.string2binary(stream)}this.index=0}StreamReader.prototype={checkOffset:function(offset){this.checkIndex(this.index+offset)},checkIndex:function(newIndex){if(this.stream.length<newIndex||newIndex<0){throw new Error("End of stream reached (stream length = "+this.stream.length+", asked index = "+newIndex+"). Corrupted zip ?")}},setIndex:function(newIndex){this.checkIndex(newIndex);this.index=newIndex},skip:function(n){this.setIndex(this.index+n)},byteAt:function(i){return this.stream.charCodeAt(i)},readInt:function(size){var result=0,i;this.checkOffset(size);for(i=this.index+size-1;i>=this.index;i--){result=(result<<8)+this.byteAt(i)}this.index+=size;return result},readString:function(size){this.checkOffset(size);var result=this.stream.slice(this.index,this.index+size);this.index+=size;return result},readDate:function(){var dostime=this.readInt(4);return new Date((dostime>>25&127)+1980,(dostime>>21&15)-1,dostime>>16&31,dostime>>11&31,dostime>>5&63,(dostime&31)<<1)}};function ZipEntry(options,loadOptions){this.options=options;this.loadOptions=loadOptions}ZipEntry.prototype={isEncrypted:function(){return(this.bitFlag&1)===1},useUTF8:function(){return(this.bitFlag&2048)===2048},readLocalPart:function(reader){var compression,localExtraFieldsLength;reader.skip(22);this.fileNameLength=reader.readInt(2);localExtraFieldsLength=reader.readInt(2);this.fileName=reader.readString(this.fileNameLength);reader.skip(localExtraFieldsLength);if(this.compressedSize==-1||this.uncompressedSize==-1){throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory "+"(compressedSize == -1 || uncompressedSize == -1)")}this.compressedFileData=reader.readString(this.compressedSize);compression=findCompression(this.compressionMethod);if(compression===null){throw new Error("Corrupted zip : compression "+pretty(this.compressionMethod)+" unknown (inner file : "+this.fileName+")")}this.uncompressedFileData=compression.uncompress(this.compressedFileData);if(this.uncompressedFileData.length!==this.uncompressedSize){throw new Error("Bug : uncompressed data size mismatch")}if(this.loadOptions.checkCRC32&&JSZip.prototype.crc32(this.uncompressedFileData)!==this.crc32){throw new Error("Corrupted zip : CRC32 mismatch")}},readCentralPart:function(reader){this.versionMadeBy=reader.readString(2);this.versionNeeded=reader.readInt(2);this.bitFlag=reader.readInt(2);this.compressionMethod=reader.readString(2);this.date=reader.readDate();this.crc32=reader.readInt(4);this.compressedSize=reader.readInt(4);this.uncompressedSize=reader.readInt(4);this.fileNameLength=reader.readInt(2);this.extraFieldsLength=reader.readInt(2);this.fileCommentLength=reader.readInt(2);this.diskNumberStart=reader.readInt(2);this.internalFileAttributes=reader.readInt(2);this.externalFileAttributes=reader.readInt(4);this.localHeaderOffset=reader.readInt(4);if(this.isEncrypted()){throw new Error("Encrypted zip are not supported")}this.fileName=reader.readString(this.fileNameLength);this.readExtraFields(reader);this.parseZIP64ExtraField(reader);this.fileComment=reader.readString(this.fileCommentLength);this.dir=this.externalFileAttributes&16?true:false},parseZIP64ExtraField:function(reader){if(!this.extraFields[1]){return}var extraReader=new StreamReader(this.extraFields[1].value);if(this.uncompressedSize===MAX_VALUE_32BITS){this.uncompressedSize=extraReader.readInt(8)}if(this.compressedSize===MAX_VALUE_32BITS){this.compressedSize=extraReader.readInt(8)}if(this.localHeaderOffset===MAX_VALUE_32BITS){this.localHeaderOffset=extraReader.readInt(8)}if(this.diskNumberStart===MAX_VALUE_32BITS){this.diskNumberStart=extraReader.readInt(4)}},readExtraFields:function(reader){var start=reader.index,extraFieldId,extraFieldLength,extraFieldValue;this.extraFields=this.extraFields||{};while(reader.index<start+this.extraFieldsLength){extraFieldId=reader.readInt(2);extraFieldLength=reader.readInt(2);extraFieldValue=reader.readString(extraFieldLength);this.extraFields[extraFieldId]={id:extraFieldId,length:extraFieldLength,value:extraFieldValue}}},handleUTF8:function(){if(this.useUTF8()){this.fileName=JSZip.prototype.utf8decode(this.fileName);this.fileComment=JSZip.prototype.utf8decode(this.fileComment)}}};function ZipEntries(data,loadOptions){this.files=[];this.loadOptions=loadOptions;if(data){this.load(data)}}ZipEntries.prototype={checkSignature:function(expectedSignature){var signature=this.reader.readString(4);if(signature!==expectedSignature){throw new Error("Corrupted zip or bug : unexpected signature "+"("+pretty(signature)+", expected "+pretty(expectedSignature)+")")}},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2);this.diskWithCentralDirStart=this.reader.readInt(2);this.centralDirRecordsOnThisDisk=this.reader.readInt(2);this.centralDirRecords=this.reader.readInt(2);this.centralDirSize=this.reader.readInt(4);this.centralDirOffset=this.reader.readInt(4);this.zipCommentLength=this.reader.readInt(2);this.zipComment=this.reader.readString(this.zipCommentLength)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8);this.versionMadeBy=this.reader.readString(2);this.versionNeeded=this.reader.readInt(2);this.diskNumber=this.reader.readInt(4);this.diskWithCentralDirStart=this.reader.readInt(4);this.centralDirRecordsOnThisDisk=this.reader.readInt(8);this.centralDirRecords=this.reader.readInt(8);this.centralDirSize=this.reader.readInt(8);this.centralDirOffset=this.reader.readInt(8);this.zip64ExtensibleData={};var extraDataSize=this.zip64EndOfCentralSize-44,index=0,extraFieldId,extraFieldLength,extraFieldValue;while(index<extraDataSize){extraFieldId=this.reader.readInt(2);extraFieldLength=this.reader.readInt(4);extraFieldValue=this.reader.readString(extraFieldLength);this.zip64ExtensibleData[extraFieldId]={id:extraFieldId,length:extraFieldLength,value:extraFieldValue}}},readBlockZip64EndOfCentralLocator:function(){this.diskWithZip64CentralDirStart=this.reader.readInt(4);this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8);this.disksCount=this.reader.readInt(4);if(this.disksCount>1){throw new Error("Multi-volumes zip are not supported")}},readLocalFiles:function(){var i,file;for(i=0;i<this.files.length;i++){file=this.files[i];this.reader.setIndex(file.localHeaderOffset);this.checkSignature(JSZip.signature.LOCAL_FILE_HEADER);file.readLocalPart(this.reader);file.handleUTF8()}},readCentralDir:function(){var file;this.reader.setIndex(this.centralDirOffset);while(this.reader.readString(4)===JSZip.signature.CENTRAL_FILE_HEADER){file=new ZipEntry({zip64:this.zip64},this.loadOptions);file.readCentralPart(this.reader);this.files.push(file)}},readEndOfCentral:function(){var offset=this.reader.stream.lastIndexOf(JSZip.signature.CENTRAL_DIRECTORY_END);if(offset===-1){throw new Error("Corrupted zip : can't find end of central directory")}this.reader.setIndex(offset);this.checkSignature(JSZip.signature.CENTRAL_DIRECTORY_END);this.readBlockEndOfCentral();if(this.diskNumber===MAX_VALUE_16BITS||this.diskWithCentralDirStart===MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===MAX_VALUE_16BITS||this.centralDirRecords===MAX_VALUE_16BITS||this.centralDirSize===MAX_VALUE_32BITS||this.centralDirOffset===MAX_VALUE_32BITS){this.zip64=true;offset=this.reader.stream.lastIndexOf(JSZip.signature.ZIP64_CENTRAL_DIRECTORY_LOCATOR);if(offset===-1){throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator")}this.reader.setIndex(offset);this.checkSignature(JSZip.signature.ZIP64_CENTRAL_DIRECTORY_LOCATOR);this.readBlockZip64EndOfCentralLocator();this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);this.checkSignature(JSZip.signature.ZIP64_CENTRAL_DIRECTORY_END);this.readBlockZip64EndOfCentral()}},load:function(data){this.reader=new StreamReader(data);this.readEndOfCentral();this.readCentralDir();this.readLocalFiles()}};JSZip.prototype.load=function(data,options){var files,zipEntries,i,input;options=options||{};if(options.base64){data=JSZipBase64.decode(data)}zipEntries=new ZipEntries(data,options);files=zipEntries.files;for(i=0;i<files.length;i++){input=files[i];this.file(input.fileName,input.uncompressedFileData,{binary:true,optimizedBinaryString:true,date:input.date,dir:input.dir})}return this}})();