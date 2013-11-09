var ComposerAudio = (function(ComposerAudio, RFFT) {

    //private static properties and methods
    var noteList = [
            "a","bb","b","c","db","d","eb","e","f","gb","g","ab"
    ];

    var noteTypeList =  [
            {name: "1", value: 32},
            {name: "2d", value: 24},
            {name: "2", value: 16},
            {name: "4d", value: 12},
            {name: "4", value: 8},
            {name: "8d", value: 6},
            {name: "8", value: 4},
            {name: "16d", value: 3},
            {name: "16", value: 2},
    ];

    var log2 = function(x) {
        return Math.log(x) / Math.LN2;
    };

    var keyNumberToOctave = function(keyNumber) {
        return Math.floor( (keyNumber - 4 + 12) / 12);
    };

    var keyNumberToNote = function(keyNumber) { 
        return noteList[(keyNumber - 1) % 12]
    };

    var repeatStr = function(times, str) {
        var result = new Array(times);
        for (var i = 0; i < times; i++) {
            result[i] = str;
        }

        return result;
    };


    function NoteDetector(bufferSize, bpm) {
        //public properties
        this.bufferSize = bufferSize;
        this.bpm = bpm;
        this.middleAFreq = 440;

        //private properties
        var on = false;
        var currentFreq = -1;
        var startTime = -1;
        var endTime = -1;
        var that = this;

        //for now we are assuming 4 4 time
        //one beat is a quarter note
        var msPerQuarter = (60 / this.bpm) * 1000;
        var msPer32nd = msPerQuarter / (2 * 2 * 2);

        //private methods
        var freqToKeyNumber = function(freq) {
            return Math.round(12 * log2(freq / that.middleAFreq) + 49);
        };

        var msToNoteType = function(duration) {
            //largest note we return is whole note
            //smallest note we return in 32nd note
            var thirtySecondNotes = Math.round(duration / msPer32nd);
            var result = [];

            noteTypeList.forEach( function(noteType) {
                    var occurrences = Math.floor( thirtySecondNotes / noteType.value );
                    thirtySecondNotes = thirtySecondNotes % noteType.value;

                    result = result.concat(repeatStr(occurrences, noteType.name));
            });

            return result;
        }
        
        var rawEventToNotes = function(raw) {
            var types = msToNoteType(raw.duration);
            var keyNumber = freqToKeyNumber(raw.freq);
            var octave = keyNumberToOctave(keyNumber);
            var note = keyNumberToNote(keyNumber);

            var results = types.map(function (type) {
                    return {note: note, octave: octave, type: type};
            });

            return results;
        };

        var findPeak = function(sampleRate, data) {
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

        //public methods
        this.process = function(pcm) { 
            var maxVol = Math.max.apply(Math, pcm);
            var fft = new RFFT(this.bufferSize, 44100)
            fft.forward(pcm);

            if (maxVol > 0.01) {
                if(on) { 
                    //do nothing;
                } else {
                    on = true;
                    startTime = new Date().getTime();
                    currentFreq = findPeak(44100, fft.spectrum);
                }
            } else {
                if (on) {
                    on = false;
                    endTime = new Date().getTime();
                    
                    //console.log({freq: this.currentFreq, duration: this.endTime - this.startTime, start: this.startTime});
                    var audioObject = {freq: currentFreq, duration: endTime - startTime, start: startTime};
                    var noteObject = rawEventToNotes(audioObject);
                    var noteEvent = new CustomEvent("noteEvent",{detail: noteObject});
                    window.dispatchEvent(noteEvent);

                } else {
                    //do nothing
                }
            }

            //debug code remove this
            pcmGraph.update(pcm);
            fftGraph.update(fft.spectrum);


        };

    }






    ComposerAudio.NoteDetector = NoteDetector;

    return ComposerAudio;
}(ComposerAudio || {}, RFFT));





