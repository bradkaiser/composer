var player;
var highlightedPlayRect = null;
var barBeat = 2; //each bar is played for 2 seconds at 120BPM
var currentDelay = 0;


 function playback(notes, canvas) {
      	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instruments: [ "acoustic_grand_piano", "synth_drum" ],
		callback: function() {
			currentDelay = 0;
			player = MIDI.Player;
			MIDI.programChange(0, 0);
			MIDI.programChange(1, 118);
			for (var i = 0; i < notes.length; i ++) {
				var velocity = 127; // how hard the note hits
				// play the note
				MIDI.noteOn(0, notes[i].midinote, velocity, currentDelay);
				// play the some note 3-steps up
				MIDI.noteOff(0, notes[i].midinote, currentDelay + notes[i].getDuration());
				//MIDI.noteOn(1, note + 3, velocity, delay);
				
				var note = notes[i];
				setTimeout(setBlueHighlight,currentDelay * 1000, note);
				
				currentDelay = currentDelay + barBeat * notes[i].getDuration();
				

				function setBlueHighlight(note){
					if (highlightedPlayRect != null){
						highlightedPlayRect.remove();
						highlightedPlayRect = null;	
					}
					var bb = note.getBoundingBox();
					highlightedPlayRect = canvas.rect(bb.x-10,bb.y-10,bb.w+20, bb.h + 20, 10);
					highlightedPlayRect.attr("fill", "blue");
					highlightedPlayRect.attr("opacity", "0.2");
					
				}
				
			}	
			setTimeout(function(){
					if (highlightedPlayRect != null){
						highlightedPlayRect.remove();
						highlightedPlayRect = null;	
					}
				},currentDelay*1000);
			
				
		}

	});
	
	  
}

