

Bar = (function() {
  function Bar(x,y,width) {
    this.init(x,y,width);
  }

  Bar.prototype = {
    init: function(x,y,width) {
      	this.x = x;
		this.y = y;
		this.width = width;
		this.notes = new Array();
		this.bar = new Vex.Flow.Voice({
			num_beats: 4,
			beat_value: 4,
			resolution: Vex.Flow.RESOLUTION
		});	
		this.bar.setStrict(false);
		this.stave = new Vex.Flow.Stave(x, y, width);
		//Keeps track of how many notes by duration will make this bar full with 4 beats (4 quarter note equivalent)
		this.percentFull = 0;
		this.barIndex = -1;
		this.beams = [];
    },

    addNote: function(note) {
		var beamed = false;
		if (this.percentFull + note.getDuration() > 1){
			return;	
		}
		this.percentFull += note.getDuration();
		if (this.notes.length >= 1){
			var previousNote = this.notes[this.notes.length-1];
			if (previousNote.getDuration() <= 0.1875 && (note.getDuration() <= 0.1875)){
				if ((this.getBeatIndexOfNote(previousNote) + note.getDuration()*4 != 1) && (this.getBeatIndexOfNote(previousNote) + note.getDuration()*4 != 2) && (this.getBeatIndexOfNote(previousNote) + note.getDuration()*4 != 3) && (this.getBeatIndexOfNote(previousNote) + note.getDuration()*4 != 0)) { 
					var addNote = note.getVexNote();
					if (addNote == null)
						return null;
					var array = new Array(this.notes[this.notes.length-1].note,addNote);
					var beam = new Vex.Flow.Beam(array);
					this.beams.push(beam);
					beamed = true;
				}
			}
		}
		
		
		this.notes.push(note);
		if (beamed){
			this.bar.addTickable(note.note);
		}
		else{
			//Some notes have a bad duration and return an error. If this is the case just delete the note and move on.
			var addNote = note.getVexNote();
			if (addNote == null)
				return null;
			this.bar.addTickable(addNote);	
			return addNote;	
			
		}
	},
	

    addClef: function(clef) {
      	this.stave.addClef(clef);
    },
	
	addTimeSignature: function() {
    	this.stave.addTimeSignature("4/4");
    },
	
	draw: function(ctx, notesDraw) {
    	var formatter = new Vex.Flow.Formatter().
		joinVoices([this.bar]).format([this.bar], (barwidth-10) * this.percentFull);
		this.stave.setContext(ctx).draw();
		if (notesDraw == true){
			this.bar.draw(ctx,this.stave);
			for (var i = 0; i < this.beams.length; i ++){
				this.beams[i].setContext(ctx).draw();	
			}
		}
    },
	
	
	setBegBarType: function(bartype) {
    	this.stave.setBegBarType(bartype);	
    },
	
	setEndBarType: function(bartype) {
		this.stave.setEndBarType(bartype);	
	},
	
	setClef: function(clef) {
		this.stave.clef = clef;
	},
	
	getPercentFull: function(){
		return this.percentFull;	
	},
	
	//Returns note that is at least at the same beat as beat out of 4 beats per bar. Will also return an offset if larger than it.
	getNoteByBeatIndex: function(beat){
		var array = [];
		if (beat == 0){
			array.push(this.notes[0]);
			array.push(0);
			return array;	
		}
		var sum = 0;
		for (var i = 1; i < this.notes.length; i++){
			sum += this.notes[i-1].getDuration() * 4;
			if (sum == beat){
				array.push(this.notes[i]);
				array.push(0);
				return array;
			}
			if (sum > beat){
				array.push(this.notes[i]);
				array.push(sum-beat);
				return array;	
			}
			
		}
		
	},
	
	getBeatIndexOfNote: function(note){
		var index= 0;
		if (note == this.notes[0]){
			return index;	
		}
		for (var i = 1; i < this.notes.length;i++){
			index = index + this.notes[i-1].getDuration() * 4;
			if (note == this.notes[i]){
				return index;	
			}
		}
		
		return -1;
		
	}
	
	
	
  };
  
  return Bar;
}());
