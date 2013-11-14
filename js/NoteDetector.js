var ComposerAudio = (function(ComposerAudio, Module) {

    //private static properties and methods
    var noteList = [
            "a","bb","b","c","db","d","eb","e","f","gb","g","ab"
    ];

    var noteTypeList =  [
            {type: {duration: 1, durationmodifier: ""}, value: 32},
            {type: {duration: 2, durationmodifier: "d"}, value: 24},
            {type: {duration: 2, durationmodifier: ""}, value: 16},
            {type: {duration: 4, durationmodifier: "d"}, value: 12},
            {type: {duration: 4, durationmodifier: ""}, value: 8},
            {type: {duration: 8, durationmodifier: "d"}, value: 6},
            {type: {duration: 8, durationmodifier: ""}, value: 4},
            {type: {duration: 16, durationmodifier: "d"}, value: 3},
            {type: {duration: 16, durationmodifier: ""}, value: 2}
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

    var repeat = function(times, obj) {
        var result = new Array(times);
        for (var i = 0; i < times; i++) {
            result[i] = obj;
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
        var trackerPtr = Module._malloc(12);
        Module._dywapitch_inittracking(trackerPtr);
        var that = this;

        //for now we are assuming 4 4 time. One beat is a quarter note
        var msPerQuarter = (60 / this.bpm) * 1000;
        var msPer32nd = msPerQuarter / (2 * 2 * 2);

        //private methods
        var freqToKeyNumber = function(freq) {
            return Math.round(12 * log2(freq / that.middleAFreq) + 49);
        };

        var computePitch = Module.cwrap('dywapitch_computepitch', 'number', ['number','number','number','number']);

        var rawToPitch = function(raw) {
            var rawNumBytes = raw.BYTES_PER_ELEMENT * raw.length;
            var rawPtr = Module._malloc(rawNumBytes);
            var heapBytes = new Uint8Array(Module.HEAPU8.buffer, rawPtr, rawNumBytes);
            heapBytes.set(new Uint8Array(raw.buffer));
            var pitch = computePitch(trackerPtr, rawPtr, 0 , raw.length);
            var confidence = Module.getValue(trackerPtr + 8, 'i8');
            Module._free(rawPtr);

            return {'pitch':pitch, 'confidence': confidence};
        };

        var msToNoteType = function(duration) {
            //largest note we return is whole note
            //smallest note we return in 32nd note
            var thirtySecondNotes = Math.round(duration / msPer32nd);
            var result = [];

            noteTypeList.forEach( function(noteType) {
                    var occurrences = Math.floor( thirtySecondNotes / noteType.value );
                    thirtySecondNotes = thirtySecondNotes % noteType.value;

                    result = result.concat(repeat(occurrences, noteType.type));
            });

            return result;
        }
        
        var rawEventToNotes = function(raw) {
            var types = msToNoteType(raw.duration);
            var keyNumber = freqToKeyNumber(raw.freq);
            var octave = keyNumberToOctave(keyNumber);
            var note = keyNumberToNote(keyNumber);


            var results = types.map(function (type) {
                type.note = note;
                type.octave = octave;
                return type;
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

        var max = function(xs) {
            var result = 0;
            for (var i = 0; i < xs.length; i++) {
                if (xs[i] > result) { result = xs[i]; }
            }

            return result;
        }

         var compressOctaves = function(note) { 
            if (note.octave > 5) {
                note.octave = 5;
            }

            if (note.octave < 4) {
                note.octave = 4;
            }
        }

        //public methods
        this.process = function(pcm) { 
            //var maxVol = max(pcm);
            var result = rawToPitch(pcm);

            if (result.confidence > 1) {
                if(on) { 
                    //do nothing;
                } else {
                    on = true;
                    startTime = new Date().getTime();
                    currentFreq = result.pitch;
                }
            } else {
                if (on) {
                    on = false;
                    endTime = new Date().getTime();
                    
                    //console.log({freq: this.currentFreq, duration: this.endTime - this.startTime, start: this.startTime});
                    var audioObject = {freq: currentFreq, duration: endTime - startTime, start: startTime};
                    var noteObjects = rawEventToNotes(audioObject);
//                    noteObjects.forEach(function (note) {
//                        compressOctaves(note);
//                    });
                    var noteEvent = new CustomEvent("noteEvent",{detail: noteObjects});
                    window.dispatchEvent(noteEvent);
                } else {
                    //do nothing
                }
            }
        };

    }






    ComposerAudio.NoteDetector = NoteDetector;

    return ComposerAudio;
}(ComposerAudio || {}, Module));





