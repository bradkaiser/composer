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
		
		function addAccidental(modifier){
			that.note.addAccidental(0, new Vex.Flow.Accidental(modifier));
		}
	
    },

    getVexNote: function() {
        this.note = new Vex.Flow.StaveNote({keys: [this.key], duration: this.durationString, classes: this.classes});
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
		this.note.addDotToAll();	
	},

    setKey: function(key,octave) {
		this.key = key + "/" + octave;
		this.midinote = this.keyToNote(key,octave);

	},

    setDuration: function(duration, wholeNote) { 
		this.duration = duration;
		this.durationString = (1/duration) + this.durationmodifier;
		if (!wholeNote){
			if (this.duration == 0.375){
				this.durationmodifier = "d";
				this.durationString = 4 + "d";
			}
			else if (this.duration == 0.1875){
				this.durationmodifier ="d";
				this.durationString = 8 + "d";
			}
		}
	},
	
	setHighlighted: function(hl) {
    	this.highlighted = hl;
    },
	
	setPercussion: function() {
    	this.midinote = this.keyToNote("c","4");
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
	
		
	keyToNote: function(key, octave){
		if (key.length > 1){
			key = key.charAt(0).toUpperCase() + key.slice(1);
		}
		else {
			key = key.toUpperCase();	
		}
		return MIDI.keyToNote[key + octave];	
		
		return null;
	}
	
	
  };
  
  return Note;
}());
