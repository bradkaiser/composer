//Use this to create a StaveNote. Will be added to a bar (which is a Stave )

function Note(key, octave, duration){
	this.key = key + "/" + octave;
	this.duration = duration;
	this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: this.duration });
	
}


Note.prototype.setKey = function(key, octave){
	this.key = key + "/" + octave;
	this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: this.duration });
}

Note.prototype.setDuration = function(duration){
	this.duration = duration;
	this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: this.duration });
}

Note.prototype.getDuration = function(){
	return this.duration;	
}

Note.prototype.getKey = function(){
	return this.key;	
}