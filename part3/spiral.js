// spiral.js 
// Spiral object creation
// Developed by George Marzloff (george@marzloffmedia.com)

class Spiral {

	// Creates an Archimedes Spiral
	// where r(theta) = speed * theta + b

	constructor(params){
		this.startPoint = params.startPoint;
		this.numberOfLoops = params.numberOfLoops;
		this.radiusGrowthRate = params.radiusGrowthRate;
		this.centerHoleRadius = params.centerHoleRadius;

		this.endPoint = this.generateEndPoint();
		this.guidelinePoints = this.generateGuidelinePoints();
	}

	xyForPolar(coords){
		// standard polar to cartesian points conversion
		// takes radians
		return {x: Math.round(coords.r * Math.cos(coords.angle)), 
				y: Math.round(coords.r * Math.sin(coords.angle))};
	};

	generateEndPoint(){
		var point = this.xyForPolar(
			{r: this.radiusGrowthRate * this.numberOfLoops * 360,
			angle: this.numberOfLoops * 2 * Math.PI});

		return {x: point.x + this.startPoint.x, 
				y: point.y + this.startPoint.y}; // includes the offset of where the spiral starts
	};

	generateGuidelinePoints(){
		var allPoints = {}; // creates data object
		
		var maxAngleDegs = this.numberOfLoops * 360;

		// The basic spiral function is r(theta) = (speed modifier) * theta + (core space radius)
		for(var currentDegrees = 0; currentDegrees <= maxAngleDegs; currentDegrees++){

			var currRad = radFromDeg(currentDegrees);
			var point = this.xyForPolar({r: this.radiusGrowthRate * currentDegrees + this.centerHoleRadius, 
										angle: currRad});
			allPoints['x'+(currentDegrees+1)] = point.x + this.startPoint.x;
			allPoints['y'+(currentDegrees+1)] = point.y + this.startPoint.y;
		}
		return allPoints;
	};
}

function radFromDeg(theta){
	return theta * Math.PI / 180.0;
}
function degFromRad(theta){
	return theta * 180.0 / Math.PI;
}