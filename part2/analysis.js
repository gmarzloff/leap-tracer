// analysis.js 
// Analysis of Spiral performance
// Developed by George Marzloff (george@marzloffmedia.com)

class Analysis {

	// The r and theta polar coordinates of the spiral function are linearly related  
	// So we can plot this relationship: the angles along the x-axis and r's on the y-axis.
	// Since every change in cursor position should increase the radius in a linear fashion, we can 
	// run a regression of (sample #, radius) points to calculate an accuracy score (using R^2).  

	constructor(_userPath){
		this.userPath = _userPath
		this.radiiData = this.generateRadiiOnSamplesData(this.userPath);
		this.regression = this.linearRegression(this.radiiData);

		var accuracyPct = Math.round(this.regression.r2 * 100); // rounds R^2
		$('#results').html("Accuracy: " + accuracyPct + "%");

		// Output data to CSV in the console with this function
		// console.log(this.generateCSV(this.radiiData));
	}

	generateRadiiOnSamplesData(path){
		// incoming path is an array of objects of {x,y} points
		var data = [];
		for (var i=0; i<path.length; i++){
			var pt = path[i];
			var radius = Math.sqrt(pt.x*pt.x + pt.y*pt.y);
			data.push({sample: i, radius: radius});
		}
		return data;
	};

	linearRegression(data){
		// Adapted from Trent Richardson's code snippet
		// Credit: http://trentrichardson.com/2010/04/06/compute-linear-regressions-in-javascript/

		var lr = {};
		var n = data.length;
		var sum_x = 0;
		var sum_y = 0;
		var sum_xy = 0;
		var sum_xx = 0;
		var sum_yy = 0;

		for (var i = 0; i < data.length; i++) {
			sum_x  += data[i].sample;
			sum_y  += data[i].radius;
			sum_xy += (data[i].sample * data[i].radius);
			sum_xx += (data[i].sample * data[i].sample);
			sum_yy += (data[i].radius * data[i].radius);
		} 

		lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
		lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
		lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
		lr['fn'] = function (x) { return this.slope * x + this.intercept; };

		return lr;
	};

	generateCSV(data){
		var str = "";
		for(var i=0; i< data.length; i++){
			str += data[i].angle + ", " + data[i].radius + "\n";
		}
	}
} 



