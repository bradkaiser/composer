//Use this to create a StaveNote. Will be added to a bar (which is a Stave )

//To add dot to a note, add a "d" to end of duration. so "8d", or "16d"
//pass in empty string for durationmodifier if nothing

Note = (function() {
  function Note(key,octave,duration,durationmodifier) {
    this.init(key,octave,duration,durationmodifier);
  }

  Note.prototype = {
    init: function(key,octave,duration,durationmodifier) {
		if (durationmodifier == "r"){
			key = "b";
			octave = "4";	
		}
		this.originalKey = key;
		this.originalOctave = octave;
      	this.key = key + "/" + octave;
		if (durationmodifier != "r"){
			this.midinote = this.keyToNote(key, octave);
		}
		else {this.midinote = null;}
		
		this.duration = 1/duration;
		this.durationmodifier = durationmodifier;
		if (durationmodifier == "d"){
			this.duration = this.duration * (3/2);	
		}
		this.durationString = duration + durationmodifier;
		this.highlighted = false;
        this.classes = "";
		this.bar = null;
		this.note = null;
		this.playableNotes = new Array("c","db","d","eb","e","f","gb","g","ab","a","bb","b");
	
    },

    getVexNote: function(createNew) {
		try{
			this.note = new Vex.Flow.StaveNote({keys: [this.key], duration: this.durationString, classes: this.classes});
		}
		catch(err){
			this.midinote = -1;
			return null;	
		}
		if (this.durationmodifier == "d"){
			this.addDot();	
		}
		if (this.key.length > 3){
			var modifier = this.key.slice(1,2);
			this.note.addAccidental(0, new Vex.Flow.Accidental(modifier));
		}
		
		return this.note;
    },
	
	addDot: function(){
		this.note.addDot(0);	
	},

    setKey: function(key,octave) {
		this.originalKey = key;
		this.originalOctave = octave;
		this.key = key + "/" + octave;
		this.midinote = this.keyToNote(key,octave);

	},

    setDuration: function(duration, wholeNote) { 
		this.duration = duration;
		if (!wholeNote){
			this.durationString = (1/duration) + this.durationmodifier;
		}
		if (!wholeNote){
			if (this.duration == 0.375){
				this.durationmodifier = "d";
				this.durationString = 4 + "d";
			}
			else if (this.duration == 0.1875){
				this.durationmodifier ="d";
				this.durationString = 8 + "d";
			}
			else if (this.duration == 0.09375){
				this.durationmodifier ="d";
				this.durationString = 16 + "d";
			}
		}
		if (this.durationmodifier == "d"){
			this.durationmodifier = "";
			this.durationString = (1/this.duration) + this.durationmodifier;
		}
	},
	
	setHighlighted: function(hl) {
    	this.highlighted = hl;
    },
	
	setPercussion: function() {
		this.originalKey = "b";
		this.originalOctave = "4";
		this.key = this.originalKey + "/" + this.originalOctave;
    	this.midinote = this.keyToNote("d","3");
    },
	
	setBar: function(bar) { 
		this.bar = bar;
	},

    getDuration: function() {
      	return this.duration;
    },
	
	getKey: function() {
    	return this.key;
    },

	getBoundingBox: function() {
    	return this.note.getBoundingBox();
    },
	
	getBar: function() { 
		return this.bar;
	},
	
		
	keyToNote: function(key, octave){
		if (key.length > 1){
			key = key.charAt(0).toUpperCase() + key.slice(1);
		}
		else {
			key = key.toUpperCase();	
		}
		if (key.charAt(1) == "n"){
			key = key.slice(0,1);	
		}
		return MIDI.keyToNote[key + octave];	
		
		return null;
	},
	
	upTone:  function(){
		if (this.originalKey == "g" && this.originalOctave == 6){
			return;	
		}
		for (var i = 0; i < this.playableNotes.length;i++){
			if (this.originalKey == this.playableNotes[i]){
				if (this.playableNotes[i] == "b"){
					var oct = parseInt(this.originalOctave);
					oct ++;
					this.setKey("c", oct + "");
					return;
				}
				else{
					this.setKey(this.playableNotes[i+1], this.originalOctave);
					return;
				}
			}
		}
	},
	
	downTone:  function(){
		if (this.originalKey == "c" && this.originalOctave == "2"){
			return;	
		}
		for (var i = 0; i < this.playableNotes.length;i++){
			if (this.originalKey == this.playableNotes[i]){
				if (this.playableNotes[i] == "c"){
					var oct = parseInt(this.originalOctave);
					oct --;
					this.setKey("b", oct + "");
					return;
				}
				else{
					this.setKey(this.playableNotes[i-1], this.originalOctave);
					return;
				}
			}
		}
	},
	
	
	
	
	
  };
  
  return Note;
}());
