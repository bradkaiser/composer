function Bar(x, y, width){
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
}

Bar.prototype.addNote = function(note){
	if (this.percentFull + note.getDuration() > 1){
		return;	
	}
	this.percentFull += note.getDuration();
	
	this.notes.push(note.note);
	this.bar.addTickable(note.note);
}

Bar.prototype.addClef = function(clef){
	this.stave.addClef(clef);
}

Bar.prototype.addTimeSignature = function(){
    this.stave.addTimeSignature("4/4");
}

Bar.prototype.draw = function(ctx, notesDraw){
	this.stave.setContext(ctx).draw();
	if (notesDraw == true){
		this.bar.draw(ctx,this.stave);
	}
	
	//Store bounding boxes of each note
	for (var i = 0; i < this.notes.length; i++){
		
	}
}

Bar.prototype.setBegBarType = function(bartype){
	this.stave.setBegBarType(bartype);	
}

Bar.prototype.setEndBarType = function(bartype){
	this.stave.setEndBarType(bartype);	
}
