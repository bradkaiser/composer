//TODO: Export to MusicXML
//TODO: stop recording when hitting play
$(document).ready(function(e){
  $(document).keydown(function(e){
		  if (e.keyCode == 8 || e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 37|| e.keyCode == 39 || e.keyCode == 13){
			    e.preventDefault();
		  }
	  });
	  
	  $(document).keyup(function(e){
		  if (e.keyCode == 8){
			if (highlightedNote != null){
				if (highlightedPercNote)
					deleteNote(highlightedNote, true);
				else
					deleteNote(highlightedNote, false);	
			}
		  }
		  
		  if (e.keyCode == 13){
			  	$playStopButton.find('i').toggleClass('fa fa-play fa-2x').toggleClass('fa fa-stop fa-2x');
				playStop();  

		  }
		  
		   if (e.keyCode == 38){
			if (highlightedNote != null){
				if (!highlightedPercNote){
					highlightedNote.upTone();
					play(highlightedNote);
					createStaves(allNotes,allPercNotes);
				}
			}
		  }
		  
		   if (e.keyCode == 40){
			if (highlightedNote != null){
				if (!highlightedPercNote){
					highlightedNote.downTone();
					play(highlightedNote);
					createStaves(allNotes,allPercNotes);
				}
			}
		  }
		  
		  if (e.keyCode == 39){
			if (highlightedNote != null){
				if (!highlightedPercNote){
					if (allNotes.indexOf(highlightedNote) != allNotes.length-1){
						var index = allNotes.indexOf(highlightedNote);
						var tempNote = highlightedNote;
						var tempNote2 = allNotes[allNotes.indexOf(highlightedNote)+1];
						allNotes.splice(index,2);
						allNotes.splice(index,0,tempNote2,tempNote);
					}
				}
				else{
					if (allPercNotes.indexOf(highlightedNote) != allPercNotes.length-1){
						var index = allPercNotes.indexOf(highlightedNote);
						var tempNote = highlightedNote;
						var tempNote2 = allPercNotes[allPercNotes.indexOf(highlightedNote)+1];
						allPercNotes.splice(index,2);
						allPercNotes.splice(index,0,tempNote2,tempNote);
					}
				}
				
				createStaves(allNotes,allPercNotes);
			}
		  }
		  
		  
		  if (e.keyCode == 37){
			if (highlightedNote != null){
				if (!highlightedPercNote){
					if (allNotes.indexOf(highlightedNote) != 0){
						var index = allNotes.indexOf(highlightedNote);
						var tempNote = highlightedNote;
						var tempNote2 = allNotes[allNotes.indexOf(highlightedNote)-1];
						allNotes.splice(index-1,2);
						allNotes.splice(index-1,0,tempNote,tempNote2);
					}
				}
				else{
					if (allPercNotes.indexOf(highlightedNote) != 0){
						var index = allPercNotes.indexOf(highlightedNote);
						var tempNote = highlightedNote;
						var tempNote2 = allPercNotes[allPercNotes.indexOf(highlightedNote)-1];
						allPercNotes.splice(index-1,2);
						allPercNotes.splice(index-1,0,tempNote,tempNotes);
					}
				}
				
				createStaves(allNotes,allPercNotes);
			}
		  }
		  
		  
	  });
	});


var barwidth = 250;
var offset = 75;
var canvasWidth = 1075;
var canvasHeight = 1000;
var sheetWidth = 1050;
var staveDifference = 200;
var bassDifference = 60;
var percussionDifference = bassDifference + 60;

var currentBar = null;
var currentPercBar = null;
//Only for drawing stave ends
var currentBassBars = null;

var startingX = offset;
var startingY = 30;
var startingPercX = offset;
var startingPercY = percussionDifference + startingY;

var backgroundStaves = [];
var connectors = [];
var bars = [];
var percBars = [];
var bassBars = [];
var allNotes = [];
var allPercNotes = [];
var canvas;

var highlightedNote = null;
var highlightedRect = null;
var highlightedPercNote = false;

var atEndNote = false;
var atEndPerc = false;

var ctx;

var noteId = 0;

function BarManager(div){
  var renderer = new Vex.Flow.Renderer(div,
    Vex.Flow.Renderer.Backends.RAPHAEL);
  ctx = renderer.getContext();
  canvas = ctx.paper;
  
  	createBackground(ctx);	
}


//Add, insert, or delete notes from allNotes array. This will then be passed sequetially to addNoteToStave to modify the drawing code
function addNote(note, percussion){
	if (highlightedNote != null){
		highlightedRect.remove();
		highlightedRect = null;
		highlightedNote = null;
	}
	
    var noteIdClass = "note note-" + noteId;
    note.classes = noteIdClass + " latest-note" ;
    noteId++;

	if (!percussion){
		if (!atEndNote){
			allNotes.push(note);
			createStaves(allNotes, allPercNotes);
			allNotes[allNotes.length - 1].classes = noteIdClass;
		}
	}
	else{
		if (!atEndPerc){
			note.setPercussion();
			allPercNotes.push(note);
			createStaves(allNotes, allPercNotes);
			allPercNotes[allPercNotes.length - 1].classes = noteIdClass;
		}
	}
}

function deleteNote(note, percussion){
	if (!percussion){
		var index = allNotes.indexOf(highlightedNote);
		allNotes.splice(index,1);
		atEndNote = false;
	}
	else{
		var index = allPercNotes.indexOf(highlightedNote);
		allPercNotes.splice(index,1);
		atEndPerc = false;
		
	}
	
	createStaves(allNotes, allPercNotes);
	
	highlightedRect.remove();
	highlightedRect = null;
	highlightedNote = null;
	

}


function createStaves(notes, percNotes){
	
	bars.length = 0;
	percBars.length = 0;
	bassBars.length = 0;
		
	nextX = startingX;
	nextY = startingY;
	nextPercX = startingPercX;
	nextPercY = startingPercY;
	
	//re-add all musical notes
	currentBar = new Bar(nextX, nextY, barwidth);
	currentBar.setBegBarType(Vex.Flow.Barline.type.NONE);
	bars.push(currentBar);
	
	currentBassBar = new Bar(nextX, nextY + bassDifference, barwidth);
	currentBassBar.setBegBarType(Vex.Flow.Barline.type.NONE);
	bassBars.push(currentBassBar);
	
	nextX = currentBar.x + currentBar.width;
	currentBar.barIndex = bars.length - 1;
	currentBassBar.barIndex = bassBars.length-1;
	
	for (var i = 0; i < notes.length; i++){
		if (currentBar.getPercentFull() >= 1){
			if ((nextX > canvasWidth - 100) && (nextY >600)){
				atEndNote = true;
				break;
			}
			if (nextX > canvasWidth - 100){
				nextY = nextY + staveDifference;
				currentBar = new Bar(offset,nextY,barwidth);	
				currentBar.setBegBarType(Vex.Flow.Barline.type.NONE);
				currentBassBar = new Bar(offset,nextY+bassDifference,barwidth);	
				currentBassBar.setBegBarType(Vex.Flow.Barline.type.NONE);
				nextX = currentBar.x + currentBar.width;
			}
			else{
				currentBar = new Bar(nextX,nextY,barwidth);
				currentBassBar = new Bar(nextX, nextY+bassDifference, barwidth);
				nextX = nextX + barwidth;
			}
			bars.push(currentBar);
			bassBars.push(currentBassBar);
			currentBassBar.barIndex = bassBars.length-1;
			currentBar.barIndex = bars.length - 1;
		}
		
		//trim note if duration is greater than the beats left in the bar
		notes[i] = full(currentBar, notes[i]);
		
		if (currentBar.addNote(notes[i]) == null){
			console.log("null note");
		};
		notes[i].setBar(currentBar);
	}
		
		
		
	//re-add all percussion notes
	currentPercBar = new Bar(nextPercX, nextPercY, barwidth);
	currentPercBar.setBegBarType(Vex.Flow.Barline.type.NONE);
	nextPercX = currentPercBar.x + currentPercBar.width;
	percBars.push(currentPercBar);
	currentPercBar.barIndex = percBars.length - 1;
	
	for (var i = 0; i < percNotes.length; i++){
		if (currentPercBar.getPercentFull() >= 1){
			if ((nextPercX > canvasWidth - 100) && (nextPercY > 600)){
				atEndPerc = true;
				break;
			}
			if (nextPercX > canvasWidth - 100){
				nextPercY = nextPercY + staveDifference;
				currentPercBar = new Bar(offset,nextPercY,barwidth);	
				currentPercBar.setBegBarType(Vex.Flow.Barline.type.NONE);
				nextPercX = currentPercBar.x + currentPercBar.width;
			}
			else{
				currentPercBar = new Bar(nextPercX,nextPercY,barwidth);
				nextPercX = nextPercX + barwidth;
			}
			percBars.push(currentPercBar);
			currentPercBar.barIndex = percBars.length - 1;
		}
	
		//trim note if duration is greater than the beats left in the bar
		percNotes[i] = full(currentPercBar, percNotes[i]);
		
		if (currentPercBar.addNote(percNotes[i]) == null){
			percsToRemove.push(i);

		}
		percNotes[i].setBar(currentPercBar);
	}
	cleanNulls();	
	redraw();
		
}

function cleanNulls(){
	for (var i = 0; i < allNotes.length; i++){
		if (allNotes[i].note == null){
			allNotes.splice(i, 1);
		}
	}
	
	for (var i = 0; i < allPercNotes.length; i++){
		if (allPercNotes[i].note == null){
			allPercNotes.splice(i, 1);
		}
	}
	
}

function full(bar, note){
	if (note.getDuration() + bar.getPercentFull() > 1){
		if (note.getDuration() == 1){
			note.setDuration(1-bar.getPercentFull(),true);	
		}
		else{
			note.setDuration(1- bar.getPercentFull(), false);
		}
	}
	
	return note;
}

//Checks for highlighted note and plays from there, sending the list of notes to the Music Manager to play
//Slightly convoluted math that was done to get the right indexes. But it works 
function playStop(){
	if (allNotes.length <= 0 && allPercNotes.length <= 0){
		return;
	}
	if (highlightedNote == null){
		playback(allNotes, allPercNotes, canvas, 0, 0);	
	}
	else {
		if (highlightedPercNote){
			var index = allPercNotes.indexOf(highlightedNote);
			var bar = highlightedNote.getBar();
			var barIndex = percBars.indexOf(bar);
			if (bars.length > barIndex){
				melodyBar = bars[barIndex];
				var beatIndex = bar.getBeatIndexOfNote(highlightedNote);
				if (melodyBar.getPercentFull() >= (beatIndex + 1)/4)
				{
					var melodyNoteandOffset = melodyBar.getNoteByBeatIndex(beatIndex);
					var melodyIndex = allNotes.indexOf(melodyNoteandOffset[0]);
					playback(allNotes.slice(melodyIndex),allPercNotes.slice(index), canvas, melodyNoteandOffset[1], 0);
				}
				else{
					playback(new Array(),allPercNotes.slice(index), canvas, 0,0);	
				}
			}
			else{
				playback(new Array(),allPercNotes.slice(index), canvas, 0,0);	
			}
		}
		else{
			var index = allNotes.indexOf(highlightedNote);
			var bar = highlightedNote.getBar();
			var barIndex = bars.indexOf(bar);
			if (percBars.length > barIndex){
				percussionBar = percBars[barIndex];
				var beatIndex = bar.getBeatIndexOfNote(highlightedNote);
				if (percussionBar.getPercentFull() >= (beatIndex + 1)/4)
				{
					var percNoteandOffset = percussionBar.getNoteByBeatIndex(beatIndex);
					var percIndex = allPercNotes.indexOf(percNoteandOffset[0]);
					playback(allNotes.slice(index),allPercNotes.slice(percIndex),canvas,  0, percNoteandOffset[1]);
				}
				else{
					playback(allNotes.slice(index),new Array(),canvas, 0,0);	
				}
			}
			else{
				playback(allNotes.slice(index),new Array(),canvas, 0,0);	
			}
				
		}
	}
	
}


function createBackground(ctx){
  	
	var barBack1 = new Bar(25,startingY,sheetWidth);
	barBack1.addClef("treble");
	barBack1.addTimeSignature();
	barBack1.draw(ctx,false);
	
	var barBack1B = new Bar(25,barBack1.y + bassDifference,sheetWidth);
	barBack1B.addClef("bass");
	barBack1B.addTimeSignature();
	barBack1B.draw(ctx, false);

	var barBack1L = new Bar(25,barBack1.y + percussionDifference,sheetWidth);
	barBack1L.addClef("percussion");
	barBack1L.addTimeSignature();
	barBack1L.draw(ctx, false);
	

	
	var connector = new Vex.Flow.StaveConnector(barBack1B.stave, barBack1L.stave);
        connector.setType(Vex.Flow.StaveConnector.type.SINGLE);
        connector.setContext(ctx).draw();
		
	var connector2 = new Vex.Flow.StaveConnector(barBack1.stave, barBack1B.stave);
        connector2.setType(Vex.Flow.StaveConnector.type.BRACE);
        connector2.setContext(ctx).draw();
	

	var barBack2 = new Bar(25, staveDifference * 1 + startingY,sheetWidth);
	barBack2.addClef("treble");
	barBack2.addTimeSignature();
	barBack2.draw(ctx, false);
	
	var barBack2B = new Bar(25,barBack2.y + bassDifference,sheetWidth);
	barBack2B.addClef("bass");
	barBack2B.addTimeSignature();
	barBack2B.draw(ctx, false);
	
	var barBack2L = new Bar(25, barBack2.y + percussionDifference,sheetWidth);
	barBack2L.addClef("percussion");
	barBack2L.addTimeSignature();
	barBack2L.draw(ctx, false);
	
	var connector3 = new Vex.Flow.StaveConnector(barBack2B.stave, barBack2L.stave);
        connector3.setType(Vex.Flow.StaveConnector.type.SINGLE);
        connector3.setContext(ctx).draw();
		
	var connector4 = new Vex.Flow.StaveConnector(barBack2.stave, barBack2B.stave);
        connector4.setType(Vex.Flow.StaveConnector.type.BRACE);
        connector4.setContext(ctx).draw();
	
	
	var barBack3 = new Bar(25, staveDifference * 2 + startingY,sheetWidth);
	barBack3.addClef("treble");
	barBack3.addTimeSignature();
	barBack3.draw(ctx, false);
	
	var barBack3B = new Bar(25,barBack3.y + bassDifference,sheetWidth);
	barBack3B.addClef("bass");
	barBack3B.addTimeSignature();
	barBack3B.draw(ctx, false);
	
	var barBack3L = new Bar(25, barBack3.y + percussionDifference,sheetWidth);
	barBack3L.addClef("percussion");
	barBack3L.addTimeSignature();
	barBack3L.draw(ctx, false);
	
	var connector5 = new Vex.Flow.StaveConnector(barBack3B.stave, barBack3L.stave);
        connector5.setType(Vex.Flow.StaveConnector.type.SINGLE);
        connector5.setContext(ctx).draw();
		
	var connector6 = new Vex.Flow.StaveConnector(barBack3.stave, barBack3B.stave);
        connector6.setType(Vex.Flow.StaveConnector.type.BRACE);
        connector6.setContext(ctx).draw();	
		
		
	var barBack4 = new Bar(25, staveDifference * 3 + startingY,sheetWidth);
	barBack4.addClef("treble");
	barBack4.addTimeSignature();
	barBack4.setEndBarType(Vex.Flow.Barline.type.END);
	barBack4.draw(ctx, false);
	
	var barBack4B = new Bar(25,barBack4.y + bassDifference,sheetWidth);
	barBack4B.addClef("bass");
	barBack4B.addTimeSignature();
	barBack4B.setEndBarType(Vex.Flow.Barline.type.END);
	barBack4B.draw(ctx, false);
	
	var barBack4L = new Bar(25, barBack4.y + percussionDifference,sheetWidth);
	barBack4L.addClef("percussion");
	barBack4L.addTimeSignature();
	barBack4L.setEndBarType(Vex.Flow.Barline.type.END);
	barBack4L.draw(ctx, false);
	
	var connector7 = new Vex.Flow.StaveConnector(barBack4B.stave, barBack4L.stave);
        connector7.setType(Vex.Flow.StaveConnector.type.SINGLE);
        connector7.setContext(ctx).draw();
		
	var connector8 = new Vex.Flow.StaveConnector(barBack4.stave, barBack4B.stave);
        connector8.setType(Vex.Flow.StaveConnector.type.BRACE);
        connector8.setContext(ctx).draw();	

	backgroundStaves.push(barBack1);
	backgroundStaves.push(barBack1L);
	backgroundStaves.push(barBack1B);
	backgroundStaves.push(barBack2);
	backgroundStaves.push(barBack2B);
	backgroundStaves.push(barBack2L);
	backgroundStaves.push(barBack3);
	backgroundStaves.push(barBack3B);
	backgroundStaves.push(barBack3L);
	backgroundStaves.push(barBack4);
	backgroundStaves.push(barBack4B);
	backgroundStaves.push(barBack4L);
	
	connectors.push(connector);
	connectors.push(connector2);
	connectors.push(connector3);
	connectors.push(connector4);
	connectors.push(connector5);
	connectors.push(connector6);
	connectors.push(connector7);
	connectors.push(connector8);	
}

function highlightAndPlayNote(x,y){
	if (highlightedNote != null){
		highlightedRect.remove();
		highlightedRect = null;
		highlightedNote = null;
	}
	
	for (var i = 0; i < bars.length; i++){
		for (var j = 0; j < bars[i].notes.length;j++){
			var bb = bars[i].notes[j].note.getBoundingBox();
			if (x <= (bb.x + bb.w) && x >= (bb.x) && y <= (bb.y + bb.h) && y > bb.y){
				highlightedRect = canvas.rect(bb.x-10,bb.y-10,bb.w+20, bb.h + 20, 10);
				highlightedRect.attr("fill", "red");
				highlightedRect.attr("opacity", "0.2");
				highlightedPercNote = false;
				highlightedNote = bars[i].notes[j];
				bars[i].notes[j].setHighlighted(true);
				play(highlightedNote);
				return;
			}
			
		}
	}
	
	for (var i = 0; i < percBars.length; i++){
		for (var j = 0; j < percBars[i].notes.length;j++){
			var bb = percBars[i].notes[j].note.getBoundingBox();
			if (x <= (bb.x + bb.w) && x >= (bb.x) && y <= (bb.y + bb.h) && y > bb.y){
				highlightedRect = canvas.rect(bb.x-10,bb.y-10,bb.w+20, bb.h + 20, 10);
				highlightedRect.attr("fill", "red");
				highlightedRect.attr("opacity", "0.2");
				highlightedPercNote = true;
				found = true;
				highlightedNote = percBars[i].notes[j];
				percBars[i].notes[j].setHighlighted(true);
				play(highlightedNote, true);
				return;
			}
			
		}
	}
}



function redraw(){
	canvas.clear();
	for (var i = 0; i < backgroundStaves.length; i++){
		backgroundStaves[i].draw(ctx, false);
	}
	for (var i = 0; i < connectors.length;i++){
		connectors[i].setContext(ctx).draw();		
	}
	for (var i = 0; i < percBars.length;i++){
		percBars[i].draw(ctx,true);	
	}
	for (var i = 0; i < bassBars.length;i++){
		bassBars[i].draw(ctx,true);	
	}
	for (var i = 0; i < bars.length;i++){
		bars[i].draw(ctx,true);	
	}

	
	
	if (highlightedNote != null){
		var bb = highlightedNote.getBoundingBox();
		highlightedRect = canvas.rect(bb.x-10,bb.y-10,bb.w+20, bb.h + 20, 10);
		highlightedRect.attr("fill", "red");
		highlightedRect.attr("opacity", "0.2");
	}
	
}
