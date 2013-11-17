var player = null;
var highlightedPlayRect = null;
var highlightedPlayPercRect = null;
var barBeat = 2; //each bar is played for 2 seconds at 120BPM
var currentDelay = 0;
var currentPercDelay = 0;
var MIDIplayer = null;
var noteRectangles = [];
var percRectangles = [];


//TODO: Allow stopping
 function playback(notes, percNotes, canvas, notesDelay, percNotesDelay) {	 
	 	if (player == null){
			MIDI.loadPlugin({
			soundfontUrl: "./soundfont/",
			instruments: [ "acoustic_grand_piano", "synth_drum" ],
			callback: function() {
			if (player == null){
				player = MIDI.Player;
			}
			MIDI.programChange(0, 0);
			MIDI.programChange(1, 118);
			MIDIplayer = MIDI;
			playing(notes,percNotes,canvas,notesDelay,percNotesDelay);	
		}
			});
		} 
		else {
			if (player.playing){
				for (var i = 0; i < noteRectangles.length; i++){
					clearTimeout(noteRectangles[i]);	
				}
				for (var i = 0; i < percRectangles.length; i++){
					clearTimeout(percRectangles[i]);	
				}
				highlightedPlayRect.remove();
				highlightedPlayRect = null;	
				
				player.playing = false;
				player.pause();
				player.currentTime = 0;
			}
			else{
				playing(notes,percNotes,canvas,notesDelay,percNotesDelay);
			}
		}
		
}

function playing(notes, percNotes, canvas, notesDelay, percNotesDelay){
		player.playing = true;	
		currentDelay = 0 + notesDelay/2;
		currentPercDelay = 0 + percNotesDelay/2;
		var velocity = 127; // how hard the note hits
		for (var i = 0; i < notes.length; i ++) {
			// play the note
			MIDIplayer.noteOn(0, notes[i].midinote, velocity, currentDelay);
			MIDIplayer.noteOff(0, notes[i].midinote, currentDelay + barBeat * notes[i].getDuration());
			
			var note = notes[i];
			noteRectangles.push(setTimeout(setBlueHighlight,currentDelay * 1000, note));
			
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
		
		for (var i = 0; i < percNotes.length; i++){
			// play the note
			MIDIplayer.noteOn(1, percNotes[i].midinote, velocity/3, currentPercDelay);
			MIDIplayer.noteOff(1, percNotes[i].midinote, currentPercDelay + barBeat * percNotes[i].getDuration());
			
			var note = percNotes[i];
			percRectangles.push(setTimeout(setBluePercHighlight,currentPercDelay * 1000, note));
			
			currentPercDelay = currentPercDelay + barBeat * percNotes[i].getDuration();
			
	
			function setBluePercHighlight(note){
				if (highlightedPlayPercRect != null){
					highlightedPlayPercRect.remove();
					highlightedPlayPercRect = null;	
				}
				var bb = note.getBoundingBox();
				highlightedPlayPercRect = canvas.rect(bb.x-10,bb.y-10,bb.w+20, bb.h + 20, 10);
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
			
		var latestDelay = currentPercDelay;
		if (currentDelay > currentPercDelay){
			latestDelay = currentDelay;
		}
		setTimeout(function(){
			player.playing = false;
			$("audio").remove();
		}, latestDelay * 1000);
				
}

function play(note){
	var velocity = 127; // how hard the note hits
	if (player == null){
			MIDI.loadPlugin({
			soundfontUrl: "./soundfont/",
			instruments: [ "acoustic_grand_piano", "synth_drum" ],
			callback: function() {
			if (player == null){
				player = MIDI.Player;
			}
			MIDI.programChange(0, 0);
			MIDI.programChange(1, 118);
			MIDIplayer = MIDI;
			MIDIplayer.noteOn(0, note.midinote, velocity, 0);
			MIDIplayer.noteOff(0, note.midinote,barBeat * note.getDuration());
		}
			});
	} 
	else{
		MIDIplayer.noteOn(0, note.midinote, velocity, 0);
		MIDIplayer.noteOff(0, note.midinote,barBeat * note.getDuration());
	}
		
	

	
}

