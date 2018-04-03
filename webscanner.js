function webscanner(config) {
    var self = this;
    var video = document.querySelector('video');
    var localMediaStream;
    self.videoSources = [];
    self.currentVideoDeviceId = null;
    self.cameraPosition = 0;

    function gotDevices(deviceInfos) {
        for (var i = 0; i < deviceInfos.length; i++) {
            var deviceInfo = deviceInfos[i];
            var deviceId = deviceInfo.deviceId;
            if (deviceInfo.kind === 'videoinput') {
                var deviceLabel = deviceInfo.label || 'camera ' +
                    (self.videoSources.length + 1);
                self.videoSources.push({
                    deviceId: deviceId,
                    deviceLabel: deviceLabel
                });
            }
        }
        if (self.videoSources.length > 0) {
            self.currentVideoDeviceId = self.videoSources[0].deviceId;
        }
        else
        {
            self.handleError(1003, new Error('No device available.'));
        }
    }

    self.startCapture = function () {
        document.getElementById("webscanner").style.display = "block";
        navigator.getUserMedia({
            video: {
                deviceId: {
                    exact: self.currentVideoDeviceId,
                },
                width: {min: 1280, ideal: 1920, max: 1920},
                height: {min: 720, ideal: 1080, max: 1080}
            }
        }, function(stream) {
            localMediaStream = stream;
            localMediaStream.stop = function () {
                this.getAudioTracks().forEach(function (track) {
                    track.stop();
                });
                this.getVideoTracks().forEach(function (track) {
                    track.stop();
                });
            };
            video.srcObject = stream;
        }, function(e) {
            self.handleError(1001, e);
        });
    }

    self.stopCapture = function () {
        video.pause();
        if (localMediaStream && localMediaStream.stop) {
            localMediaStream.stop();
        }
        localMediaStream = null;
        document.getElementById("webscanner").style.display = "none";
    }

    self.changeCamera = function () {
        video.pause();
        if (localMediaStream && localMediaStream.stop) {
            localMediaStream.stop();
        }
        localMediaStream = null;

        self.cameraPosition = self.cameraPosition + 1;
        self.cameraPosition = self.cameraPosition % self.videoSources.length;
        self.currentVideoDeviceId = self.videoSources[self.cameraPosition].deviceId;
        self.startCapture();
    }

    self.capture = function () {
        video.pause();

        if (localMediaStream) {
            var canvas = document.createElement("canvas");
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

            var dataURL = canvas.toDataURL();
            config.handleCapture(dataURL);
        }

        if (localMediaStream && localMediaStream.stop) {
            localMediaStream.stop();
        }
        localMediaStream = null;
        document.getElementById("webscanner").style.display = "none";
    }

    self.handleError = function (code, error) {
        document.getElementById("webscanner").style.display = "none";
        config.handleError(code, error);
    }

    self.initialize = function () {
        // Check if navigator object contains getUserMedia object.
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        
        navigator.mediaDevices.enumerateDevices()
            .then(gotDevices)
            .catch(function (error) {
                self.handleError(1002, error);
            });
    }

    // Check for getUserMedia support.
    if (navigator.getUserMedia) {
        self.initialize();
    } else {
        self.handleError(1004, new Error('No browser support.'));
    }
}
