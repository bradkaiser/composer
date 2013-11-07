function PitchDetector() {
    this.on = false;
    this.currentFreq = -1;
    this.startTime = -1;
    this.endTime = -1;
}

PitchDetector.prototype.process = function(pcm, spectrum) { 
    var maxVol = Math.max.apply(Math, pcm);

    if (maxVol > 0.01) {
        if(this.on) { 
            //do nothing;
        } else {
            this.on = true;
            this.startTime = new Date().getTime();
            this.currentFreq = findPeak(44100, spectrum);
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
};
