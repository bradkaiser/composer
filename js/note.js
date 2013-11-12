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
		this.duration = 1/duration;
		this.highlighted = false;
		this.bar = null;
		var that = this;
		
		this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: duration+durationmodifier });
		
		if (durationmodifier == "d"){
			this.duration = this.duration * (3/2);
			addDot();	
		}
		
		
	
		if (key.length > 1){
			var modifier = key.slice(1);
			addAccidental(modifier);
		}
		
		
		function addAccidental(modifier){
			that.note.addAccidental(0, new Vex.Flow.Accidental(modifier));
		}
		
		function addDot(){
			that.note.addDotToAll();	
		}
	
    },

    setKey: function(key,octave) {
		this.key = key + "/" + octave;
		this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: this.duration });
	},

    setDuration: function(duration) { 
		this.duration = duration;
		this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: this.duration });
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
	
	setHighlighted: function(hl) {
    	this.highlighted = hl;
    },
  };
  
  return Note;
}());