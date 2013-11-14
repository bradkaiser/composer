var player;
var highlightedPlayRect = null;
var highlightedPlayPercRect = null;
var barBeat = 2; //each bar is played for 2 seconds at 120BPM
var currentDelay = 0;
var currentPercDelay = 0;

//For ease may not allow pausing. May have to play and wait for it to finish. Or just stop it

//TODO: Deal with AudioContext problem
//TODO: Allow pausing and replaying
 function playback(notes, percNotes, canvas, notesDelay, percNotesDelay) {
	 	$("audio").remove();
	 
      	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instruments: [ "acoustic_grand_piano", "synth_drum" ],
		callback: function() {
			currentDelay = 0 + notesDelay/2;
			currentPercDelay = 0 + percNotesDelay/2;
			player = MIDI.Player;
			MIDI.programChange(0, 0);
			MIDI.programChange(1, 118);
			var velocity = 127; // how hard the note hits
			for (var i = 0; i < notes.length; i ++) {
				// play the note
				MIDI.noteOn(0, notes[i].midinote, velocity, currentDelay);
				MIDI.noteOff(0, notes[i].midinote, currentDelay + barBeat * notes[i].getDuration());
				
				var note = notes[i];
				setTimeout(setBlueHighlight,currentDelay * 1000, note);
				
				currentDelay = currentDelay + barBeat * notes[i].getDuration();
				

				function setBlueHighlight(note){
					if (highlightedPlayRect != null){
						highlightedPlayRect.remove();
						highlightedPlayRect = null;	
					}
					var bb = note.getBoundingBox();
					if (note.getDuration() == 1/8){
						highlightedPlayRect = canvas.rect(bb.x-5,bb.y-5,bb.w+10, bb.h+10,10);	
					}
					else{
						highlightedPlayRect = canvas.rect(bb.x-10,bb.y-10,bb.w+20, bb.h + 20, 10);
					}
					highlightedPlayRect.attr("fill", "blue");
					highlightedPlayRect.attr("opacity", "0.2");
					
				}
				
			}	
			
			for (var i = 0; i < percNotes.length; i++){
				// play the note
				MIDI.noteOn(1, percNotes[i].midinote, velocity/4, currentPercDelay);
				MIDI.noteOff(1, percNotes[i].midinote, currentPercDelay + barBeat * percNotes[i].getDuration());
				
				var note = percNotes[i];
				setTimeout(setBluePercHighlight,currentPercDelay * 1000, note);
				
				currentPercDelay = currentPercDelay + barBeat * percNotes[i].getDuration();
				

				function setBluePercHighlight(note){
					if (highlightedPlayPercRect != null){
						highlightedPlayPercRect.remove();
						highlightedPlayPercRect = null;	
					}
					var bb = note.getBoundingBox();
					if (note.getDuration() == 1/8){
						highlightedPlayPercRect = canvas.rect(bb.x-5,bb.y-5,bb.w+10, bb.h+10,10);	
					}
					else{
						highlightedPlayPercRect = canvas.rect(bb.x-10,bb.y-10,bb.w+20, bb.h + 20, 10);
					}
					highlightedPlayPercRect.attr("fill", "blue");
					highlightedPlayPercRect.attr("opacity", "0.2");
					
				}
				
			}
			
			
			setTimeout(function(){
					if (highlightedPlayRect != null){
						highlightedPlayRect.remove();
						highlightedPlayRect = null;	
					}
				},currentDelay*1000);
				
			setTimeout(function(){
					if (highlightedPlayPercRect != null){
						highlightedPlayPercRect.remove();
						highlightedPlayPercRect = null;	
					}
				},currentPercDelay*1000);
			
				
		}

	});
	
	  
}

