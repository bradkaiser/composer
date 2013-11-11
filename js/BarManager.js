
var barwidth = 250;
var offset = 75;
var canvasWidth = 1075;
var canvasHeight = 1000;
var sheetWidth = 1050;
var staveDifference = 200;
var percussionDifference = 80;
var currentBar = null;
var nextX = offset;
var nextY = 0;

var backgroundStaves = [];
var connectors = [];
var bars = [];
var allNotes = [];
var percussionBars = [];
var canvas;

var highlightedNote = null;
var highlightedRect = null;

var ctx;

function BarManager(div){
	canvas = Raphael(div,canvasWidth,canvasHeight);
  var renderer = new Vex.Flow.Renderer(canvas,
    Vex.Flow.Renderer.Backends.RAPHAEL);
  ctx = renderer.getContext();
  
  	createBackground(ctx);	
}


function addNoteToStave(note){
	
	if (currentBar == null){
		currentBar = new Bar(nextX, nextY, barwidth);
		currentBar.setBegBarType(Vex.Flow.Barline.type.NONE);
		nextX = currentBar.x + currentBar.width;
		bars.push(currentBar);
	}
	
	//trim note if duration is greater than the beats left in the bar
	note = full(currentBar, note);
	
	currentBar.addNote(note);
	
	redraw();
	
	if (currentBar.getPercentFull() >= 1){
		if (nextX > 975){
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
	}
	
	allNotes.push(note);
	
}

function full(bar, note){
	if (note.getDuration() + bar.getPercentFull() > 1){
		note.setDuration(1- bar.getPercentFull());
	}
	
	return note;
}

//Checks for highlighted note and plays from there, sending the list of notes to the Music Manager to play
function playPause(){
	if (allNotes.length <= 0){
		return;
	}
	if (highlightedNote == null){
		playback(allNotes);	
	}
	
	else {
		for (var i = 0; i < allNotes.length; i++){
			if (highlightedNote === allNotes[i]){
				var playedNotes = allNotes.slice(i);
				playback(playedNotes, canvas);
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
		highlightedNote == null;
	}
	
	var found = false;
	for (var i = 0; i < bars.length; i++){
		for (var j = 0; j < bars[i].notes.length;j++){
			var bb = bars[i].notes[j].note.getBoundingBox();
			if (x <= (bb.x + bb.w) && x >= (bb.x) && y <= (bb.y + bb.h) && y > bb.y){
				highlightedRect = canvas.rect(bb.x-10,bb.y-10,bb.w+20, bb.h + 20, 10);
				highlightedRect.attr("fill", "#f00");
				highlightedRect.attr("opacity", "0.2");
				found = true;
				highlightedNote = bars[i].notes[j];
				bars[i].notes[j].setHighlighted(true);
				break;
			}
			
		}
		if (found)
			break;
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
	for (var i = 0; i < percussionBars.length;i++){
		percussionBars[i].draw(ctx,true);	
	}
}