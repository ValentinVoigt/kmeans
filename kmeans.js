var btnReset;
var btnStep;
var btnDemo;
var sliderK;
var samples = [];
var means = [];
var step = 0;

const settingsRect = [0, 0, 200, 150];
const colors = [
	"#ff0000",
	"#00ff00",
	"#0000ff",
	"#ff00ff",
	"#ffff00",
	"#00ffff",
	"#ff0088",
	"#88ff00",
	"#4400ff",
	"#0088ff",
];

class Point {

	constructor(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
	}

}

class Sample extends Point {

	draw() {
		fill(this.color);
		noStroke();
		circle(this.x, this.y, 8);
	}

	assignClassToNearest(means) {
		let nearestMean;
		let nearestMeanDist;

		for (let mean of means) {
			let dist = Math.sqrt((this.x - mean.x)**2 + (this.y - mean.y)**2);
			if (!nearestMean || dist < nearestMeanDist) {
				nearestMean = mean;
				nearestMeanDist = dist;
			}
		}

		this.color = nearestMean.color;
	}

}

class Mean extends Point {

	draw() {
		fill(this.color);
		stroke(255, 255, 255);
		rect(this.x-5, this.y-5, this.x+5, this.y+5);
	}

	recalculate(samples) {
		this.x = samples.reduce((t, s) => t+s.x, 0) / samples.length;
		this.y = samples.reduce((t, s) => t+s.y, 0) / samples.length;
	}

}

function pickRandom(list, n) {
	let indexes = [...Array(n).keys()];
	let samples = [];

	while (samples.length < n) {
		let random = Math.floor(Math.random() * indexes.length);
		samples.push(indexes.splice(random, 1)[0]);
	}

	return samples.map((i) => list[i]);
}

function onBtnResetClick() {
	samples = [];
	means = [];
	setStep(0);
}

function onBtnDemoClick() {
	let clusters = [
		createVector(width / 2, height / 3),
		createVector(width / 3, 2 * height / 3),
		createVector(2 * width / 3, 2 * height / 3),
	];

	for (let center of clusters) {
		for (let i = 0; i < 25; i++) {
			let angle = TWO_PI * Math.random();
			let length = randomGaussian(0, 100);
			let point = p5.Vector.add(center, p5.Vector.fromAngle(angle, length));
			samples.push(new Sample(point.x, point.y, color(255, 255, 255)));
		}
	}
}

function setStep(newStep) {
	step = newStep;

	if (step == 0) {
		sliderK.show();
		btnDemo.show();
	} else {
		sliderK.hide();
		btnDemo.hide();
	}

	btnStep.html([
		"Randomize means",
		"Set to nearest",
		"Calculate new means",
	][step]);
}

function onBtnStepClick() {
	if (means.length == 0) {
		// Sample k random points as new means
		if (samples.length >= sliderK.value()) {
			let newMeans = pickRandom(samples, sliderK.value());
			let index = 0;
			for (let newMean of newMeans) {
				means.push(new Mean(newMean.x, newMean.y, color(colors[index]), index));
				index++;
			}
			setStep(1);
		} else {
			console.warn("Not enough samples for k=" + sliderK.value());
		}
	} else {
		if (step == 1) {
			// Assign each sample to its nearest mean
			for (let sample of samples) {
				sample.assignClassToNearest(means);
			}
			setStep(2);
		} else if (step == 2) {
			// Re-calculate means
			for (let mean of means) {
				mean.recalculate(samples.filter((s) => s.color == mean.color));
			}
			setStep(1);
		}
	}
}

function mouseClicked() {
	if (mouseX >= settingsRect[0] && mouseX <= settingsRect[2]
		&& mouseY >= settingsRect[1] && mouseY <= settingsRect[3]) 
		return false;

	samples.push(new Sample(mouseX, mouseY, color(255, 255, 255)));
	return false;
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	rectMode(CORNERS);

	btnReset = createButton('Reset');
	btnReset.position(20, 20);
	btnReset.mousePressed(onBtnResetClick);

	btnDemo = createButton('Load Demo');
	btnDemo.position(80, 20);
	btnDemo.mousePressed(onBtnDemoClick);

	btnStep = createButton('Randomize means');
	btnStep.position(20, 50);
	btnStep.mousePressed(onBtnStepClick);

	sliderK = createSlider(2, 10, 3, 1);
	sliderK.position(20, 80);
	sliderK.style('width', '80px');
}

function draw() {
	background(42);

	stroke(0, 0, 0);
	fill(84);
	rect.apply(this, settingsRect);

	stroke(255, 255, 255);
	fill(255, 255, 255);
	textSize(18);
	text("k = " + sliderK.value(), 20, 130);

	for (let sample of samples) {
		sample.draw();
	}
	for (let mean of means) {
		mean.draw();
	}
}
