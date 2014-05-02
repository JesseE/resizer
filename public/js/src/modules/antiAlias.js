/*
 *  Anti aliasing images
 *  Author: Jesse
 *
 */

var ratio;

function setAntiAlias(newImg, storage, i){

    //canvas context
    var ctx = newImg.getContext("2d");
    //source of the canvas
    var newImgSource = newImg.toDataURL();

    var oc = document.createElement('canvas');
    var octx = oc.getContext('2d');

    // in order to retrieve newly create canvas with and height turn in to an image tag and give it source
    newImg = new Image();
    newImg.src = newImgSource;

    //get the original uploaded image dimensions
    var originalImage = new Image();
    originalImage.src = oriDimensions[i];

    setRatio(newImg, originalImage);

    setNewCanvas(originalImage, ratio, newImg, ctx, oc, octx);

    drawImageContainer(originalImage, ratio, newImg, ctx, oc, octx);
}
function setRatio(newImg, originalImage) {
    ratio = Math.sqrt(newImg.height / originalImage.height);
    // the ratio is retrieved by doing the following:  √(300/1600)
    // 1000px / 100px  = ratio 0.1
    // x * x  = 0.1
    // x^2 = 0.1
    // x = √0.1
    // newH / origH = R
    // 3√r = Rd
    // x * x * x = 0.1
    // x^3 = 0.1
    // x = 3√0.1
    // if more steps are taken to redraw the canvas in the canvas so does the square root change to 3√(300/1600) , 4√(300/1600)
}
function setNewCanvas(originalImage, ratio, newImg, ctx, oc) {
    //width and height of the new canvas
    oc.width = originalImage.width * ratio;
    oc.height = originalImage.height * ratio;
}
function drawImageContainer(originalImage, ratio, newImg, ctx ,oc ,octx) {
    //draw canvas into canvas
    //redrawing canvas in steps to let the interpolation work with softer transitions

    //step one
    octx.drawImage(originalImage, 0,0, oc.width, oc.height);
    //step two
    octx.drawImage(oc, 0, 0, oc.width * ratio, oc.height * ratio);
    //step three
    ctx.drawImage(oc, 0, 0, oc.width * ratio, oc.height * ratio,
                     0, 0, newImg.width, newImg.height);
}