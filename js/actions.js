$(function() {
    // hide them
    $("#submit-div").css("display", "none")
    $("#save-div").css("display", "none");
    $("#canvas-div").css("display", "none");
    $("#ack").css("display", "none");

    // set prelude position 
    $("#prelude").offset({
        top: $(window).height() * .4
    });

    // global context
    canvas = document.getElementById("canvas") // cannot use $("#") here
    canvas.width = 800;
    canvas.height = 800;
    context = canvas.getContext('2d');
    cW = canvas.width;
    cH = canvas.height;

    var bk = new Image();
    var fr = new Image();

    bk.src = "bk800.jpg";
    bk.onload = function() {
        bk.crossOrigin = 'anonymous';
        context.drawImage(bk, 0, 0, cW, cH);
        bkDataArray = context.getImageData(0, 0, cW, cH).data;
        context.clearRect(0, 0, cW, cH);
    }

    fr.src = "fr800.jpg";
    fr.onload = function() {
        fr.crossOrigin = 'anonymous';
        context.drawImage(fr, 0, 0, cW, cH);
        frDataArray = context.getImageData(0, 0, cW, cH).data;
        context.clearRect(0, 0, cW, cH);
    }

    $("#loading").css("display", "none");
});

$("#upload").click(function() {
    $("#upload-input").click()
})

$("#upload-input").on("change", function() {
    var im = new Image();

    var oFReader = new FileReader();
    oFReader.readAsDataURL($("#upload-input").get(0).files[0]);
    filename = $("#upload-input").get(0).files[0].name;
    oFReader.onload = function(oFREvent) {
        var userImageSrc = oFREvent.target.result;
        im.src = userImageSrc;
        im.onload = function() {
            var sPara = getSourceImagePara(im);
            context.drawImage(im, sPara.sx, sPara.sy, sPara.sWidth, sPara.sHeight, 0, 0, cW, cH);
            imDataArray = context.getImageData(0, 0, cW, cH).data;
            imDataArraySource = context.getImageData(0, 0, cW, cH).data;
        }
    }

    // show them
    $("#submit-div").css("display", "initial");
    $("#save-div").css("display", "none");
    $("#canvas-div").css("display", "initial");

    // set prelude position 
    $("#prelude").css("top", "0%")
})

function styleBlackButton(flag) {
    if (flag === "on") {
        $("#backgroundcolor-k").css("background-color", "black");
        $("#backgroundcolor-k").css("color", "white");
    } else {
        $("#backgroundcolor-k").css("background-color", "white");
        $("#backgroundcolor-k").css("color", "black");
    }
}

$(".color-btn").click(function() {

    $("#ack").css("display", "initial");

    var color = $(this).attr("id");
    console.debug(color);

    if (color == "backgroundcolor-k") {
        styleBlackButton("on");
    } else {
        styleBlackButton("off");
    }

    // core algorithm
    for (var i = 0; i < imDataArray.length; i += 4) {
        if (imDataArraySource[i] < 170) { // this value is proposed by Jibin
            imDataArray[i + 0] = frDataArray[i + 0]; // r
            imDataArray[i + 1] = frDataArray[i + 1]; // g
            imDataArray[i + 2] = frDataArray[i + 2]; // b
            imDataArray[i + 3] = frDataArray[i + 3]; // a
        } else {
            if (color == "backgroundcolor-r") {
                imDataArray[i + 0] = bkDataArray[i + 0]; // r
                imDataArray[i + 1] = bkDataArray[i + 1]; // g
                imDataArray[i + 2] = bkDataArray[i + 2]; // b
            } else if (color == "backgroundcolor-g") {
                imDataArray[i + 0] = bkDataArray[i + 1]; // r
                imDataArray[i + 1] = bkDataArray[i + 0] - 50; // g
                imDataArray[i + 2] = bkDataArray[i + 2]; // b
            } else if (color == "backgroundcolor-b") {
                imDataArray[i + 0] = bkDataArray[i + 2]; // r
                imDataArray[i + 1] = bkDataArray[i + 1]; // g
                imDataArray[i + 2] = bkDataArray[i + 0]; // b
            } else if (color == "backgroundcolor-w") {
                imDataArray[i + 0] = 255; // r
                imDataArray[i + 1] = 255; // g
                imDataArray[i + 2] = 255; // b
            } else if (color == "backgroundcolor-k") {
                var gray = Math.round((bkDataArray[i + 0] + bkDataArray[i + 1] + bkDataArray[i + 0]) / 3) - 130;
                imDataArray[i + 0] = gray; // r
                imDataArray[i + 1] = gray; // g
                imDataArray[i + 2] = gray; // b
            }
            imDataArray[i + 3] = bkDataArray[i + 3]; // a
        }
    }

    // notification
    console.debug("new image is computed.");

    context.clearRect(0, 0, cW, cH);

    // output image to canvas
    context.putImageData(new ImageData(imDataArray, cW, cH), 0, 0, 0, 0, cW, cH);

    document.getElementById("saveanchor").href = canvas.toDataURL('image/jpeg', 0.6);
    document.getElementById("saveanchor").download = color.substring(color.length - 1) + "_" + filename;

    $("#ack").css("display", "initial");
    $("#submit-div").css("display", "initial");
    $("#save-div").css("display", "initial");
})

getSourceImagePara = function(im) {
    var para = {};
    if (im.width < im.height) {
        para.sx = 0;
        para.sy = (im.height - im.width) / 2;
    } else {
        para.sx = (im.width - im.height) / 2;
        para.sy = 0;
    }
    para.sWidth = Math.min(im.width, im.height);
    para.sHeight = Math.min(im.width, im.height);
    return para;
}
