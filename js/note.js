//Use this to create a StaveNote. Will be added to a bar (which is a Stave )


//To add dot to a note, add a "d" to end of duration. so "8d", or "16d"
//pass in empty string for durationmodifier if nothing
function Note(key, octave, duration, durationmodifier){
	this.key = key + "/" + octave;
	this.duration = 1/duration;
	var that = this;
	
	this.note = new Vex.Flow.StaveNote({ keys: [this.key], duration: duration+durationmodifier });
	//TODO: Fix dot notation with duration
	if (durationmodifier == "d"){
		this.duration = this.duration * (3/2);
		addDot();	
	}
	
	

	if (key.length > 1){
		var modifier = key.slice(1);
		addAccidental(modifier);
	}
	
	//TODO: Fix dot notation with duration
	var dot = duration.slice(duration.length-1);
	if (dot == "d"){
		addDot();	
	}
	
	
	
	function addAccidental(modifier){
		that.note.addAccidental(0, new Vex.Flow.Accidental(modifier));
	}
	
	function addDot(){
		that.note.addDotToAll();	
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

Note.prototype.getKey = function(){
	return this.key;	
}
