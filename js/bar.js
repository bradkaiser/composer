function Bar(x, y, width){
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
}

Bar.prototype.addNote = function(note){
	if (this.percentFull + 1/note.note.getDuration() > 1){
		return;	
	}
	this.percentFull += 1/note.note.getDuration();
	
	this.notes.push(note.note);
}

Bar.prototype.finalizeVoice = function(){
	this.bar.addTickables(this.notes);
}

Bar.prototype.addClef = function(){
	if (this.x == 0){
		this.stave.addClef("treble");
	}
}

Bar.prototype.draw = function(ctx, notesDraw){
	this.stave.setContext(ctx).draw();
	if (notesDraw == true){
		this.bar.draw(ctx,this.stave);
	}
}

Bar.prototype.setBegBarType = function(bartype){
	this.stave.setBegBarType(bartype);	
}

Bar.prototype.setEndBarType = function(bartype){
	this.stave.setEndBarType(bartype);	
}
