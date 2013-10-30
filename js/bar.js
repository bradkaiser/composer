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
	this.stave = new Vex.Flow.Stave(x, y, width);
	this.fullBar = 4;
}

Bar.prototype.addNote = function(note){
	this.notes.push(note);
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