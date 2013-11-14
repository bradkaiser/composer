//Use this to create a StaveNote. Will be added to a bar (which is a Stave )

//To add dot to a note, add a "d" to end of duration. so "8d", or "16d"
//pass in empty string for durationmodifier if nothing

Note = (function() {
  function Note(key,octave,duration,durationmodifier) {
    this.init(key,octave,duration,durationmodifier);
  }

  Note.prototype = {
    init: function(key,octave,duration,durationmodifier) {
      	this.key = key + "/" + octave;
		this.midinote = keyToNote(key, octave);
        this.durationString = duration + durationmodifier;
		this.duration = 1/duration;
		this.durationmodifier = durationmodifier;
		this.highlighted = false;
        this.classes = "";
		this.bar = null;
		var that = this;
		
		if (durationmodifier == "d"){
			this.duration = this.duration * (3/2);
			this.addDot();	
		}
		
		if (key.length > 1){
			var modifier = key.slice(1);
			addAccidental(modifier);
		}
		
		function addAccidental(modifier){
			that.note.addAccidental(0, new Vex.Flow.Accidental(modifier));
		}
		
	
		
		function keyToNote(key, octave){
			if (key.length > 1){
				key = key.charAt(0).toUpperCase() + key.slice(1);
			}
			else {
				key = key.toUpperCase();	
			}
			return MIDI.keyToNote[key + octave];	
			
			return null;
		}
	
    },

    getVexNote: function() {
        return new Vex.Flow.StaveNote({keys: [this.key], duration: this.durationString, classes: this.classes});
    },
	
	addDot: function(){
		this.note.addDotToAll();	
	},

    setKey: function(key,octave) {
		this.key = key + "/" + octave;
		this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: this.duration });
		this.midinote = keyToNote(key,octave);;

	},

    setDuration: function(duration, wholeNote) { 
		this.duration = duration;
		if (!wholeNote){
			if (this.duration == 0.375){
				this.durationmodifier = "d";
				this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: 4 + this.durationmodifier });
				this.addDot();
			}
			else if (this.duration == 0.1875){
				this.durationmodifier ="d";
				this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: 8 + this.durationmodifier });
				this.addDot();
			}
			else {
				this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: 1/this.duration + this.durationmodifier });
			}
		}
	},
	
	setHighlighted: function(hl) {
    	this.highlighted = hl;
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
	
	
  };
  
  return Note;
}());
