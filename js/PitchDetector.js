var ComposerAudio = (function(ComposerAudio, RFFT) {

    function PitchDetector(bufferSize) {
        this.bufferSize = bufferSize;
        this.on = false;
        this.currentFreq = -1;
        this.startTime = -1;
        this.endTime = -1;
    }

    PitchDetector.prototype.process = function(pcm) { 
        var maxVol = Math.max.apply(Math, pcm);
        var fft = new RFFT(this.bufferSize, 44100)
        fft.forward(pcm);

        if (maxVol > 0.01) {
            if(this.on) { 
                //do nothing;
            } else {
                this.on = true;
                this.startTime = new Date().getTime();
                this.currentFreq = this.findPeak(44100, fft.spectrum);
            }
        } else {
            if (this.on) {
                this.on = false;
                this.endTime = new Date().getTime();
                
                //console.log({freq: this.currentFreq, duration: this.endTime - this.startTime, start: this.startTime});
                var noteEvent = new CustomEvent("noteEvent",{detail: {freq: this.currentFreq, duration: this.endTime - this.startTime, start: this.startTime}});
                window.dispatchEvent(noteEvent);

            } else {
                //do nothing
            }
        }

        //debug code remove this
        pcmGraph.update(pcm);
        fftGraph.update(fft.spectrum);


    };

    PitchDetector.prototype.findPeak = function(sampleRate, data) {
        var peak = -1;
        var peakIndex = -1;
        var bucketFreq = sampleRate / this.bufferSize;
        var sum = 0;

        for(var i = 0; i < data.length; i++) {
                sum += data[i];
                if (data[i] > peak) {
                    peak = data[i];
                    peakIndex = i;
                }
        };

        return peakIndex * bucketFreq;
    };

    ComposerAudio.PitchDetector = PitchDetector;

    return ComposerAudio;
}(ComposerAudio || {}, RFFT));





