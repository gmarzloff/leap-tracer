// canvas.js
// This javascript is used to manage the cursor tracer canvas 
// Developed by George Marzloff (george@marzloffmedia.com)

$( document ).ready(function() {
  
  	var spiral = new Spiral({				// we create a Spiral object here.
		startPoint: {x: 400, y: 210},		// See Spiral() object in spiral.js
		numberOfLoops: 3.15,
		radiusGrowthRate: 0.15,
	}); 		

	var hoverTargetsRadius = 15;			
	var pathPoints = [];					// stores the path of the mouse
	var isTracking = false;					// flag to turn on/off tracking

	var radiusPlotForAnalysis = [];			// create an array to store the sample #, radius plot for analysis later

	addUserPathLayer();						// Run a function to setup an empty layer for userPath without any points yet.
											// look for function addUserPathLayer() below to see the instructions
	
	// CREATE LAYER FOR SPIRAL GUIDELINE
	$('canvas').drawLine({
		strokeWidth: 3,
		strokeStyle: '#aaa', // gray
		visible: true,
		name: 'guideline',
		layer: true
	});

	// ADD THE SPIRAL GUIDELINE POINTS TO THE LAYER AND DRAW IT
	$('canvas').setLayer('guideline', spiral.guidelinePoints)
	.drawLayers();

	// Draw the starting circle on the canvas using drawArc method
	$('canvas').drawArc({
	  fillStyle: '#0a0', // green
	  opacity: 0.75,
	  x: spiral.startPoint.x, 
	  y: spiral.startPoint.y,
	  radius: hoverTargetsRadius,
	  layer: true,
	  name: 'startCircle'
	  // Notice! mouseover and mouseout functions are removed
	});

	// DRAW THE TARGET CIRCLE
	$('canvas').drawArc({
	  fillStyle: '#00d', // green
	  opacity: 0.75,
	  x: spiral.endPoint.x, y: spiral.endPoint.y,
	  radius: hoverTargetsRadius,
	  layer: true,
	  name: 'targetCircle'
	  // Notice! mouseover and mouseout functions are removed		
	});

	// DRAW INSTRUCTIONS TEXT
	$('canvas').drawText({
	  fillStyle: '#000',
	  x: 400, y: 20,
	  fontSize: 14,
	  fontFamily: 'Verdana, sans-serif',
	  text: 'Mouseover the green circle and trace the spiral to the blue circle.',
	  layer: true,
	  name: 'instructionsText'	
	});

	// DRAW RESET BUTTON
	$('canvas').drawRect({
		fillStyle: '#f00',
		x: 60, y: 350,
		width: 50, height: 40,
		layer: true,
		name: 'resetButton',
		cornerRadius: 10,
		click: function(){
			resetPath();
		}
	});

	// DRAW TEXT ON RESET BUTTON
	$('canvas').drawText({
		fillStyle: '#fff',
		x: $('canvas').getLayer('resetButton').x,
		y: $('canvas').getLayer('resetButton').y,
		width: 50,
		height: 40,
		text: 'Reset',
		layer: true,
		name: 'resetText',
		intangible: true
	});

	// LEAP MOTION TEXT POSITION
	$('canvas').drawText({
	  fillStyle: '#000',
	  x: 100, y: 20,
	  fontSize: 14,
	  fontFamily: 'Verdana, sans-serif',
	  text: "Leap",
	  layer: true,
	  name: 'leapxy'
	});

	// CREATE A PURPLE CIRCLE LAYER TO SEE THE FINGER POSITION
	$('canvas').drawArc({
	  fillStyle: '#c0f',  
	  radius: 10,
	  layer: true,
	  name: 'leapCursor',
	  visible: false,

	});

	function addUserPathLayer(){
		$('canvas').addLayer({
			name: 'userPath',
			type: 'line',
			strokeStyle: '#f00',
			strokeWidth: 3,
			index: 4
		});
	}

	function resetPath(){
		// clear the points array, delete userPath and add a blank userPath layer
	  	pathPoints = [];
	  	radiusPlotForAnalysis = [];
	  	isTracking = false;
	  	$('canvas').removeLayer('userPath');
	  	$('#results').html("");
	  	addUserPathLayer();
	  	$('canvas').drawLayers();
	}

	//////////////////////////////////////////////////////
	// SETUP AND OBTAIN DATA FROM LEAP MOTION 
	//////////////////////////////////////////////////////
	
	Leap.loop({}, function(frame) {
		// All the data we need is passed to the object called frame, for every capture frame.

        // Get a pointable (finger or any stick tool) and normalize the tip position
        if(frame.pointables.length > 0){

	        var pointable = frame.pointables[0];
	        var interactionBox = frame.interactionBox;
	        var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);
	        
	        var leapCursorLayer = $('canvas').getLayer('leapCursor'); 

	        // Convert the normalized coordinates to span the canvas
	        var pointerOnCanvas = {x: $('canvas').width() * normalizedPosition[0],
	        					   y: $('canvas').height() * (1 - normalizedPosition[1])};
	        // we can ignore z for a 2D context

	        // if the point moved, check collision with start circle
	        if(	((Math.round(pointerOnCanvas.x) != Math.round(leapCursorLayer.x)) || 
	        	(Math.round(pointerOnCanvas.y) != Math.round(leapCursorLayer.y))) &&
	        	isTracking == false) {
	        
	        	isTracking = collisionTest(leapCursorLayer, $('canvas').getLayer('startCircle'));

	        }else if(isTracking == true && collisionTest(leapCursorLayer, $('canvas').getLayer('targetCircle'))){
	        	// already drawing path and hit the targetCircle
	        	isTracking = false;
		   		var analysis = new Analysis(radiusPlotForAnalysis);
	        }
	        
	        $('canvas').setLayer('leapxy',{text: '(' + pointerOnCanvas.x.toFixed() + ', ' + pointerOnCanvas.y.toFixed() + ')' })       
	        leapCursorLayer.x = pointerOnCanvas.x;
	        leapCursorLayer.y = pointerOnCanvas.y;
	        leapCursorLayer.visible = true;

	        if(isTracking){ 	
				// Create a path following the leapCursorLayer
				// add a point to the path array

				pathPoints.push([pointerOnCanvas.x, pointerOnCanvas.y]);	// add the cursor coordinates into an array

				var i = pathPoints.length;	// use this # to create the property name e.g. x1, x2, x3, etc
				var pathLayer = $('canvas').getLayer('userPath');	
				pathLayer['x'+i] = pathPoints[i-1][0];
				pathLayer['y'+i] = pathPoints[i-1][1];

				radiusPlotForAnalysis.push({x: pathPoints[i-1][0] - spiral.startPoint.x, 
										  y: pathPoints[i-1][1] - spiral.startPoint.y});
			}

	        $('canvas').drawLayers();

	    }else{
	    	$('canvas').setLayer('leapCursor',{visible:false})
	    	.drawLayers();
	    }

	});

	function collisionTest(obj1,obj2){
		// This functions tests if the center of obj1 layer has entered the box around obj2 layer
		// assumes obj1 and obj2 are type: arc layers
		var diffInX = (obj2.x + obj2.radius) - obj1.x;
		var diffInY = (obj2.y + obj2.radius) - obj1.y;

		if((diffInX < obj2.radius*2) && (diffInX > 0) && (diffInY < obj2.radius*2) && (diffInY > 0)){
			// hit detected!	
			return true;
		}else {
			return false;
		}
	}
	
});
