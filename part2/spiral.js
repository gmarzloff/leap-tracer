// spiral.js 
// Spiral class creation
// Developed by George Marzloff (george@marzloffmedia.com)

function Spiral(params) {

	// Creates an Archimedes Spiral
	// where r(theta) = speed * theta

	this.startPoint = params.startPoint;
	this.numberOfLoops = params.numberOfLoops;
	this.radiusGrowthRate = params.radiusGrowthRate;

	this.xyForPolar = function(coords){
		// standard polar to cartesian points conversion
		// takes radians
		return {x: Math.round(coords.r * Math.cos(coords.angle)), 
				y: Math.round(coords.r * Math.sin(coords.angle))};
	};

	this.generateEndPoint = function(){
		var point = this.xyForPolar(
			{r: this.radiusGrowthRate * this.numberOfLoops * 360,
			angle: this.numberOfLoops * 2 * Math.PI});

		return {x: point.x + this.startPoint.x, 
				y: point.y + this.startPoint.y}; // includes the offset of where the spiral starts
	};

	this.generateGuidelinePoints = function(){
		var allPoints = {}; // creates data object
		
		var maxAngleDegs = this.numberOfLoops * 360;

		// The basic spiral function is r(theta) = (speed modifier) * theta
		for(var currentDegrees = 0; currentDegrees <= maxAngleDegs; currentDegrees++){

			var currRad = radFromDeg(currentDegrees);
			var point = this.xyForPolar({r: this.radiusGrowthRate * currentDegrees,
										angle: currRad});
			allPoints['x'+(currentDegrees+1)] = point.x + this.startPoint.x;
			allPoints['y'+(currentDegrees+1)] = point.y + this.startPoint.y;
		}
		return allPoints;
	};

	this.endPoint = this.generateEndPoint();
	this.guidelinePoints = this.generateGuidelinePoints();
}

function radFromDeg(theta){
	return theta * Math.PI / 180.0;
}
function degFromRad(theta){
	return theta * 180.0 / Math.PI;
}