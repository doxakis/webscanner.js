var image = document.querySelector('img');

var webscanner = new webscanner({
    handleError: function (code, error) {
        console.log("Error #" + code);
        if (code == 1001) {
            alert('Could not get camera stream.');
        }

        if (code == 1003) {
            // No camera available.
            // Scanner not available.
            alert('No camera available.');
        }
        
        if (code == 1004) {
            // No browser support
            // Scanner not available.
            alert('No browser support.');
        }
    },
    handleCapture: function (dataURL) {
        image.src = dataURL;
    }
})

// Events:

document.querySelector('button#startCapture').addEventListener('click', function () {
    webscanner.startCapture();
});

document.querySelector('button#capture').addEventListener('click', function(e) {
    webscanner.capture();
});

document.querySelector('button#change').addEventListener('click', function(e) {
    webscanner.changeCamera();
});

document.querySelector('button#close').addEventListener('click', function(e) {
    webscanner.stopCapture();
});
