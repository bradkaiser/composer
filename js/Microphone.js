//Microphone.js 
//Handles getting microphone input from browser
//publishes raw audio data events on el
var ComposerAudio = (function(ComposerAudio ) {

    function Microphone(el, bufferSize) {
        this.el = (el instanceof HTMLElement) ? el : document.getElementById(el);
        this.bufferSize = bufferSize;
        var that = this;

        if (!navigator.getUserMedia) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        }

        el.onclick = function(e) {
            that.toggle();
        };

        var setUpNodes = function(e) {
            console.log('success');
            var audioContext = window.AudioContext || window.webkitAudioContext;
            that.context = new audioContext();
            that.volume = that.context.createGain();
            that.audioInput = that.context.createMediaStreamSource(e);
            that.recorder = that.context.createJavaScriptNode(that.bufferSize,2,2);

            that.audioInput.connect(that.volume);
            that.volume.connect(that.recorder);
            that.recorder.connect(that.context.destination);

            that.recorder.onaudioprocess = function(stream) {
                var rawEvent = new CustomEvent('rawAudio', {'detail': stream.inputBuffer.getChannelData(0)});
                that.el.dispatchEvent(rawEvent);
            }
        }

        this.toggle = function() {
            if(that.context) {
                that.stop();
            } else {
                that.start();
            }
        };

        this.start = function() {
            if (!that.context) {
                if (navigator.getUserMedia) {
                    navigator.getUserMedia({audio: true}, setUpNodes, function(e) { alert('boo'); });
                } else {
                    alert('not supported');
                }
            } else {
                console.log('Already started');
            }
        };

        this.stop = function() {
            if (that.context) {
                that.recorder.disconnect();
                that.volume.disconnect();
                that.audioInput.disconnect();

                that.recorder = null;
                that.volume = null;
                that.audioInput = null;
                that.context = null;
            } else {
                console.log('Not started');
            }
        }
    }



    ComposerAudio.Microphone = Microphone;

    return ComposerAudio;

}(ComposerAudio || {}));
