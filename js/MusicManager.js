MusicManager = (function() {
  function MusicManager() {
    this.init();
  }
  
  MusicManager.prototype = {  
	 init: function() {
      	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instruments: [ "acoustic_grand_piano", "synth_drum" ],
		callback: function() {
			MIDI.programChange(0, 0);
			MIDI.programChange(1, 118);
			for (var n = 0; n < 100; n ++) {
				var delay = n / 4; // play one note every quarter second
				var note = MIDI.pianoKeyOffset + n; // the MIDI note
				var velocity = 127; // how hard the note hits
				// play the note
				//MIDI.noteOn(0, note, velocity, delay);
				// play the some note 3-steps up
				//MIDI.noteOn(1, note + 3, velocity, delay);
			}		
		}
	});
	  
	 },
	 
	 playback: function(note) {
		 
		 
	 }
	  
  };
  
  return MusicManager;
}());