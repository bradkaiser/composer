//TODO: prevent Backspace from going back
$(document).ready(function(e){
	  $("#subsidiaryDiv").dblclick(function(e){
		  var posX = $(this).position().left,
            posY = $(this).position().top;
			highlightNote(e.pageX - posX,e.pageY - posY); 	
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
		  e.preventDefault();
		  
		  
	  });
	});


var barwidth = 250;
var offset = 75;
var canvasWidth = 1075;
var canvasHeight = 1000;
var sheetWidth = 1050;
var staveDifference = 200;
var percussionDifference = 80;

var currentBar = null;
var currentPercBar = null;

var nextX = offset;
var nextY = 0;
var nextPercX = offset;
var nextPercY = percussionDifference;

var backgroundStaves = [];
var connectors = [];
var bars = [];
var percBars = [];
var allNotes = [];
var allPercNotes = [];
var canvas;

var highlightedNote = null;
var highlightedRect = null;
var highlightedPercNote = false;

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
	
	if (!percussion){
        note.classes = "note-" + noteId;
        noteId++;
		allNotes.push(note);
	}
	else{
		note.setKey("b","4");
		note.setPercussion();
		allPercNotes.push(note);
	}
	
	createStaves(allNotes, allPercNotes);

}

function deleteNote(note, percussion){
	if (highlightedNote != null){
		highlightedRect.remove();
		highlightedRect = null;
		highlightedNote = null;
	}
	
	if (!percussion){
		var index = allNotes.indexOf(highlightedNote);
		allNotes.splice(index,1);
	}
	else{
		var index = allPercNotes.indexOf(highlightedNote);
		allPercNotes.splice(index,1);
	}
	
	createStaves(allNotes, allPercNotes);

}

function insertNote(note,index){
	
	
}

//Change drawing for percnotes
function createStaves(notes, percNotes){
	
	bars.length = 0;
	percBars.length = 0;
		
	nextX = offset;
	nextY = 0;
	nextPercX = offset;
	nextPercY = percussionDifference;
	
	//re-add all musical notes
	currentBar = new Bar(nextX, nextY, barwidth);
	currentBar.setBegBarType(Vex.Flow.Barline.type.NONE);
	nextX = currentBar.x + currentBar.width;
	bars.push(currentBar);
	currentBar.barIndex = bars.length - 1;
	
	for (var i = 0; i < notes.length; i++){
		if (currentBar.getPercentFull() >= 1){
			if (nextX > canvasWidth - 100){
				nextY = nextY + staveDifference;
				currentBar = new Bar(offset,nextY,barwidth);	
				currentBar.setBegBarType(Vex.Flow.Barline.type.NONE);
				nextX = currentBar.x + currentBar.width;
			}
			else{
				currentBar = new Bar(nextX,nextY,barwidth);
				nextX = nextX + barwidth;
			}
			bars.push(currentBar);
			currentBar.barIndex = bars.length - 1;
		}
		
		//trim note if duration is greater than the beats left in the bar
		notes[i] = full(currentBar, notes[i]);
		
		currentBar.addNote(notes[i]);
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
		
		currentPercBar.addNote(percNotes[i]);
		percNotes[i].setBar(currentPercBar);
	}
	
	
	
	redraw();
		
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
function playPause(){
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
  	
	var barBack1 = new Bar(25,0,sheetWidth);
	barBack1.addClef("treble");
	barBack1.addTimeSignature();
	barBack1.draw(ctx,false);

	var barBack1L = new Bar(25,barBack1.y + percussionDifference,sheetWidth);
	barBack1L.addClef("percussion");
	barBack1L.addTimeSignature();
	barBack1L.draw(ctx, false);
	
	var connector = new Vex.Flow.StaveConnector(barBack1.stave, barBack1L.stave);
        connector.setType(Vex.Flow.StaveConnector.type.SINGLE);
        connector.setContext(ctx).draw();
		
	var connector2 = new Vex.Flow.StaveConnector(barBack1.stave, barBack1L.stave);
        connector2.setType(Vex.Flow.StaveConnector.type.BRACE);
        connector2.setContext(ctx).draw();
	

	var barBack2 = new Bar(25, staveDifference * 1,sheetWidth);
	barBack2.addClef("treble");
	barBack2.addTimeSignature();
	barBack2.draw(ctx, false);
	
	var barBack2L = new Bar(25, barBack2.y + percussionDifference,sheetWidth);
	barBack2L.addClef("percussion");
	barBack2L.addTimeSignature();
	barBack2L.draw(ctx, false);
	
	var connector3 = new Vex.Flow.StaveConnector(barBack2.stave, barBack2L.stave);
        connector3.setType(Vex.Flow.StaveConnector.type.SINGLE);
        connector3.setContext(ctx).draw();
		
	var connector4 = new Vex.Flow.StaveConnector(barBack2.stave, barBack2L.stave);
        connector4.setType(Vex.Flow.StaveConnector.type.BRACE);
        connector4.setContext(ctx).draw();
	
	
	var barBack3 = new Bar(25, staveDifference * 2,sheetWidth);
	barBack3.addClef("treble");
	barBack3.addTimeSignature();
	barBack3.draw(ctx, false);
	
	var barBack3L = new Bar(25, barBack3.y + percussionDifference,sheetWidth);
	barBack3L.addClef("percussion");
	barBack3L.addTimeSignature();
	barBack3L.draw(ctx, false);
	
	var connector5 = new Vex.Flow.StaveConnector(barBack3.stave, barBack3L.stave);
        connector5.setType(Vex.Flow.StaveConnector.type.SINGLE);
        connector5.setContext(ctx).draw();
		
	var connector6 = new Vex.Flow.StaveConnector(barBack3.stave, barBack3L.stave);
        connector6.setType(Vex.Flow.StaveConnector.type.BRACE);
        connector6.setContext(ctx).draw();	
		
		
	var barBack4 = new Bar(25, staveDifference * 3,sheetWidth);
	barBack4.addClef("treble");
	barBack4.addTimeSignature();
	barBack4.setEndBarType(Vex.Flow.Barline.type.END);
	barBack4.draw(ctx, false);
	
	var barBack4L = new Bar(25, barBack4.y + percussionDifference,sheetWidth);
	barBack4L.addClef("percussion");
	barBack4L.addTimeSignature();
	barBack4L.setEndBarType(Vex.Flow.Barline.type.END);
	barBack4L.draw(ctx, false);
	
	var connector7 = new Vex.Flow.StaveConnector(barBack4.stave, barBack4L.stave);
        connector7.setType(Vex.Flow.StaveConnector.type.SINGLE);
        connector7.setContext(ctx).draw();
		
	var connector8 = new Vex.Flow.StaveConnector(barBack4.stave, barBack4L.stave);
        connector8.setType(Vex.Flow.StaveConnector.type.BRACE);
        connector8.setContext(ctx).draw();	

	backgroundStaves.push(barBack1);
	backgroundStaves.push(barBack1L);
	backgroundStaves.push(barBack2);
	backgroundStaves.push(barBack2L);
	backgroundStaves.push(barBack3);
	backgroundStaves.push(barBack3L);
	backgroundStaves.push(barBack4);
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

function highlightNote(x,y){
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
				return;
			}
			
		}
	}
}

function moveNote(){
	if (highlightedNote != null){
		for (var i = 0; i < bars.length; i++){
			for (var j = 0; j < bars[i].notes.length;j++){	
				if (highlightedNote == bars[i].notes[j]){
					var temp = bars[i].notes[j];
					bars[i].notes[j] = bars[i].notes[j+1];
					bars[i].notes[j+1] = temp;
					redraw();
					break;
				}
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
	for (var i = 0; i < bars.length;i++){
		bars[i].draw(ctx,true);	
	}
	for (var i = 0; i < percBars.length;i++){
		percBars[i].draw(ctx,true);	
	}
}
