//TODO: Formatter basedupon type of note\
//TODO: beam previous 8th notes
//TODO: check if a flat is previously in bar

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
		this.notesPositions = new Array();
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
    },

    addNote: function(note) {
		if (this.percentFull + note.getDuration() > 1){
			return;	
		}
		this.percentFull += note.getDuration();
		
		this.notes.push(note);
		this.bar.addTickable(note.note);
	},

    addClef: function(clef) {
      	this.stave.addClef(clef);
    },
	
	addTimeSignature: function() {
    	this.stave.addTimeSignature("4/4");
    },
	
	draw: function(ctx, notesDraw) {
    	var formatter = new Vex.Flow.Formatter().
		joinVoices([this.bar]).format([this.bar], 240 * this.percentFull);
		this.stave.setContext(ctx).draw();
		if (notesDraw == true){
			this.bar.draw(ctx,this.stave);
		}
    },
	
	
	setBegBarType: function(bartype) {
    	this.stave.setBegBarType(bartype);	
    },
	
	setEndBarType: function(bartype) {
		this.stave.setEndBarType(bartype);	
	},
	
	getPercentFull: function(){
		return this.percentFull;	
	}
	
	
  };
  
  return Bar;
}());