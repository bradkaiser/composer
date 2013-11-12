var player;
var highlightedRect = null;
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
				currentDelay = currentDelay + barBeat * notes[i].getDuration();
				
				/*var bb = notes[i].getBoundingBox();
				highlightedRect = canvas.rect(bb.x-10,bb.y-10,bb.w+20, bb.h + 20, 10);
				highlightedRect.attr("fill", "blue");
				highlightedRect.attr("opacity", "0.2");*/
			}		
		}

	});
	  
}

function convertNote(note){
	
}