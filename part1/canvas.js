// canvas.js
// This javascript is used to manage the tracer canvas 
// Developed by George Marzloff (george@marzloffmedia.com)

$( document ).ready(function() {
    
    // good introduction to Canvas drawing: 
    // https://www.sitepoint.com/html5-canvas-tutorial-introduction/		
   
   	var startPoint = {x:100, y:200}
	var endPoint = {x:700, y:startPoint.y};
	var hoverTargetsRadius = 20;
	var pathPoints = [];			// stores the path of the mouse
	var deviations
	var isTracking = false;			// flag to turn on/off tracking

	// Draw an invisible layer to track the mouse
	$('canvas').drawRect({
		x: 400, y: 400,
		width: 800,
		height: 800,
		layer: true,
		name: 'cursorTracker',
		mousemove: function(){
       
			if(isTracking){ 	
				// Create a path following the mouse
				// add a point to the path array
				var rect = $('canvas').offset();
				// correct mouse coordinates
				var cursor_x = event.pageX - rect.left;
				var cursor_y = event.pageY - rect.top;

				pathPoints.push([cursor_x, cursor_y]);	// add the cursor coordinates into an array

				var i = pathPoints.length;	// use this # to create the property name e.g. x1, x2, x3, etc
				var pathLayer = $('canvas').getLayer('userPath');	
				pathLayer['x'+i] = pathPoints[i-1][0];
				pathLayer['y'+i] = pathPoints[i-1][1];
			}
		}
	}).drawLayers();

	// Setup an empty layer for userPath without any points yet
	addUserPathLayer();
	
	// Draw a guide line
	$('canvas').drawLine({
		x1: startPoint.x + hoverTargetsRadius, y1: startPoint.y,
		x2: endPoint.x - hoverTargetsRadius, y2: endPoint.y,
		layer:true,
		strokeWidth: 3,
		strokeStyle: '#aaa', // gray
		visible: false,
		name: 'guideline'
	});

	// Draw the start area on the canvas
	$('canvas').drawArc({
	  fillStyle: '#0a0', // green
	  x: startPoint.x, y: startPoint.y,
	  radius: hoverTargetsRadius,
	  layer: true,
	  name: 'startCircle',
	  mouseover: function() {
	    $(this).animateLayer('startCircle', {
	      fillStyle: '#0d0'
	    }, 250);
	   
	  	resetPath();
	  	isTracking = true;
	  	showGuideline(false);
	  	console.log("tracking ON");
	  },
	  mouseout: function() {
	  	 $(this).animateLayer('startCircle', {
	  	  	fillStyle: '#0a0'
	  	}, 250);
	  }
	});

	// Draw the destination area on the canvas
	$('canvas').drawArc({
	  fillStyle: '#00d', // green
	  x: endPoint.x, y: endPoint.y,
	  radius: hoverTargetsRadius,
	  layer: true,
	  name: 'targetCircle',
	  mouseover: function() {
	    $(this).animateLayer('targetCircle', {
	      fillStyle: '#55f'
	    }, 250);

	    isTracking = false;
	    showGuideline(true);
	    analyzePerformance();
	  },
	  mouseout: function() {
	  	 $(this).animateLayer('targetCircle', {
	  	  	fillStyle: '#00d'
	  	}, 250);
	  }

	});

	$('canvas').drawText({
	  fillStyle: '#000',
	  x: 400, y: 20,
	  fontSize: 14,
	  fontFamily: 'Verdana, sans-serif',
	  text: 'Mouseover the green circle and draw a straight line to the blue circle.',
	  layer: true,
	  name: 'resetText'
	});

	function addUserPathLayer(){
		$('canvas').addLayer({
			name: 'userPath',
			type: 'line',
			strokeStyle: '#f00',
			strokeWidth: 3
		});
	}

	function resetPath(){
		// clear the points array, delete userPath and add a blank userPath layer
	  	pathPoints = [];
	  	isTracking = false;
	  	$('canvas').removeLayer('userPath');
	  	addUserPathLayer();
	}

	function showGuideline(show){
		$('canvas').setLayer('guideline', {visible: show}).drawLayers();
	}

	function analyzePerformance(){

		// 1. calculate the total area of the deviations (aka the integral)
		var areaUnderCurve = 0;
		for(i=0; i<pathPoints.length; i++){
			// a straight line parallel to the x-axis simplifies the math: 
			// we just need to find the absolute difference in y pixels for every i-th x pixel.
			var ydiff = pathPoints[i][1] - startPoint.y; 
			areaUnderCurve = areaUnderCurve + Math.abs(ydiff);

			// Note: If you wanted this to work for a straight line no matter where the start/end points were,
			// would need to calculate the slope of the line (y=mx+b) to identify the line's y value at each point
		}

		$('#results').html('Average Deviation: ' + Math.round(areaUnderCurve/pathPoints.length) + ' pixels');

	}
});
