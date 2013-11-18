//convenience methods
Object.defineProperty( Array.prototype, "last", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function() {
        return this[ this.length - 1 ];
    }
} );

Object.defineProperty( Array.prototype, "splitOn", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(pred) {
        var result = [];
        var isNewSegment = true;

        this.forEach(function(x) {
            if(!pred(x)) {
                if(isNewSegment) {
                    result.push([x]);
                } else {
                    result.last().push(x);
                }
                isNewSegment = false;
            } else {
                isNewSegment = true;
            }
        });

        return result;
    }
});

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

    var mean = function(xs) {
        var sum = xs.reduce(function(acc, x) { return acc + x; }, 0);

        return Math.round(sum / xs.length);
    }

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

    var isClose = function(x,y) {
        return Math.abs(x - y) < 3;
    }


    function NoteDetector(bufferSize, bpm) {
        //public properties
        this.bufferSize = bufferSize;
        this.bpm = bpm;
        this.middleAFreq = 440;
        this.durationOfSample = bufferSize / 44100 * 1000;
        // 120 b/m * 1/60 m/s = 2 b/s -> 1/2 s/b * 1/4 b/sixteenths = 1/8 s = 125 ms
        this.msInSixteenth = (bpm / 60) / 16 * 1000;           
        this.samplesInSixteenth = Math.floor(this.msInSixteenth / this.durationOfSample);

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
        };
        
        //don't break up note too delicately, just get the largest chunk that will fit.
        var msToLargestNoteType = function(duration) {
            //largest note we return is whole note
            //smallest note we return in 16th note
            console.log('duration ' + duration);
            var thirtySecondNotes = Math.round(duration / msPer32nd);
            var result = [];

            noteTypeList.forEach( function(noteType) {
                    var occurrences = Math.floor( thirtySecondNotes / noteType.value );
                    thirtySecondNotes = thirtySecondNotes % noteType.value;

                    result = result.concat(repeat(occurrences, noteType.type));
            });

            //round up to 16th
            if (result.length === 0) {
                return {duration: 16, durationmodifier: ""};
            } else {
                return result[0];
            }


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
        };

        //accumulate pitchdetected audio data so we can pull out notes that are longer than cutoff
        this.generateAccumulator = function(howMany, callBack) {
            var accumulator = [];
            var remainingSpots = howMany;

            return function(keyNumObj) {
                accumulator.push(keyNumObj);
                remainingSpots--;
                if (remainingSpots === 0) {
                    callBack(accumulator);
                    remainingSpots = howMany;
                }
            };
        };


        //format collection of grouped pitched samples and turn them into a note 
        this.format = function(keyNumGroup) {
            var duration = keyNumGroup.length * that.durationOfSample;
            var meanKeyNum = mean(keyNumGroup.map(function(x) { return x.keyNumber; }));
            var octave = keyNumberToOctave(meanKeyNum);
            var note = keyNumberToNote(meanKeyNum);
            var result = msToLargestNoteType(duration);
            result.octave = octave;
            result.note = note;

            return result;
        };

        this.publish = function(note) {
            var noteEvent = new CustomEvent("noteEvent",{detail: note});
            window.dispatchEvent(noteEvent);
        }

        //uses list of pitches and pulls out notes that are at least a sixteenth note. Will leave data at end in case it is
        //continued in next batch;
        this.notePuller = function(accumulator) {
            var workingArray = accumulator.slice(); //make copy 
            accumulator.splice(0); //clean data out of accumulator

            //copy contiguous keys at end back into accumulator
            var lastKeyNum = workingArray.last().keyNumber;
            for(var i = workingArray.length - 1; i >= 0; i--) {
                if (isClose(workingArray[i].keyNumber, lastKeyNum)) {
                    accumulator.unshift(workingArray.pop());
                } else {
                    break;
                }
            }

            //split into groups when no pitch detected
            var keyNumGroups = workingArray.splitOn(function(x) { return x.keyNumber == -Infinity });

            //reject detected pitches that are shorter than a eigth note
            var noteClusters = keyNumGroups.filter(function (xs) { return xs.length >= that.samplesInSixteenth });
            console.log(noteClusters);

            var noteObjs = noteClusters.map(function(x) { return that.format(x); });

            noteObjs.forEach(function(note) { that.publish(note); });
        };

        this.chunkNotes = this.generateAccumulator(10,this.notePuller);

        this.process = function(rawData) {
            var pcm = rawData.data;
            var time = rawData.time;

            var result = rawToPitch(pcm);
            var confidence = result.confidence;
            var pitch = result.pitch;
            var keyNumber = freqToKeyNumber(pitch);

            var keyNumObj = {keyNumber: keyNumber, time: time, confidence: confidence};
            this.chunkNotes(keyNumObj);

        };

        var passesCutoff = function(cutoff, xs) { 
            for (var i = 0; i < xs.length; i++) {
                if(xs[i] > cutoff) {
                    return true;
                }
            }

            return false;
        }

        this.publishBeats = function(beats) { 
            beats.forEach(function (beat) {
                var percEvent = new CustomEvent('percussionEvent', {detail: beat});
                window.dispatchEvent(percEvent);
            });
        };

        this.percussionSeparator = function(accumulator) {
            var workingArray = accumulator.slice();
            accumulator.splice(0);

            //copy dectected beats at end back into accumulator
            for (var i = workingArray.length - 1; i >= 0; i--) {
                if (workingArray[i].detected) {
                    accumulator.unshift(workingArray[i]);
                } else {
                    break;
                }
            }

            var beatGroups = workingArray.splitOn(function(x) { return !x.detected });

            var beats = beatGroups.map(function(x) { return x[0] });
            
            that.publishBeats(beats);
        };


        this.chunkPercussion = this.generateAccumulator(10, this.percussionSeparator);

        this.percussionProcess = function(rawData) {
            var pcm = rawData.data;
            var time = rawData.time;

            var beat = {time: time}
            var cutoff = .2; //determined empirically
            if (passesCutoff(cutoff, pcm)) {
                beat.detected = true;
            } else {
                beat.detected = false;
            }

            this.chunkPercussion(beat);
        };
    }

    ComposerAudio.NoteDetector = NoteDetector;

    return ComposerAudio;
}(ComposerAudio || {}, Module));





