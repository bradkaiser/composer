var player;
var highlightedRect = null;


 function playback(notes, canvas) {
      	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instruments: [ "acoustic_grand_piano", "synth_drum" ],
		callback: function() {
			player = MIDI.Player;
			MIDI.programChange(0, 0);
			MIDI.programChange(1, 118);
			for (var i = 0; i < notes.length; i ++) {
				var delay =  i/ 2; // play one note every quarter second
				var note = MIDI.pianoKeyOffset + n; // the MIDI note
				var velocity = 127; // how hard the note hits
				// play the note
				MIDI.noteOn(0, note, velocity, delay);
				// play the some note 3-steps up
				//MIDI.noteOn(1, note + 3, velocity, delay);
				
				
				
				var bb = notes[i].getBoundingBox();
				highlightedRect = canvas.rect(bb.x-10,bb.y-10,bb.w+20, bb.h + 20, 10);
				highlightedRect.attr("fill", "blue");
				highlightedRect.attr("opacity", "0.2");
			}		
		}
		

	});
	  
}