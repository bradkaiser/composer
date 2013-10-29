function Bar(){
	this.notes = new Array();
	this.bar = new Vex.Flow.Voice({
    num_beats: 4,
    beat_value: 4,
    resolution: Vex.Flow.RESOLUTION
  	});	

	
}

Bar.prototype.addNote = function(note){
	this.notes.push(note);
}

Bar.prototype.finalizeVoice = function(){
	this.bar.addTickables(this.notes);
}

Bar.prototype.draw = function(ctx, stave){
	this.bar.draw(ctx,stave);
}