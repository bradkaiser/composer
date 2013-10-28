function Note(key, octave, duration){
	this.key = key + "/" + octave;
	this.duration = duration;
	this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: this.duration });

	this.getKey = getKey;
	function getKey(){
			
		
	}
	
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