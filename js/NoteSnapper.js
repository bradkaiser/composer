var AudioInput = (function(AudioInput) {
    function NoteSnapper(bpm) {
        this.bpm = bpm;
        this.middleAFreq = 440;

        //for now we are assuming 4 4 time
        //one beat is a quarter note
        this.msPerQuarter = (60 / this.bpm) * 1000;
        this.msPer32nd = this.msPerQuarter / (2 * 2 * 2);
    }

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

    var freqToKeyNumber = function(that, freq) {
        return Math.round(12 * log2(freq / that.middleAFreq) + 49);
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

    var msToNoteType = function(that, duration) {
        //largest note we return is whole note
        //smallest note we return in 32nd note
        var thirtySecondNotes = Math.round(duration / that.msPer32nd);
        var result = [];

        noteTypeList.forEach( function(noteType) {
                var occurrences = Math.floor( thirtySecondNotes / noteType.value );
                thirtySecondNotes = thirtySecondNotes % noteType.value;

                result = result.concat(repeatStr(occurrences, noteType.name));
        });

        return result;
    }

    NoteSnapper.prototype.rawEventToNotes = function(raw) {
        var types = msToNoteType(this, raw.duration);
        var keyNumber = freqToKeyNumber(this, raw.freq);
        var octave = keyNumberToOctave(keyNumber);
        var note = keyNumberToNote(keyNumber);

        var results = types.map(function (type) {
                return {note: note, octave: octave, type: type};
        });

        return results;
    };

    AudioInput.NoteSnapper = NoteSnapper;
    return AudioInput;

}(AudioInput || {}));

