let song;
let albumCover;
let lyrics = [];
let times = [];
let currentLine = 0;
let bgSwirls = [];
let stars = [];
let shootingStars = [];
let lyricPositions = [];
let magicalFont;
let floatingParticles = [];
let fft;

function preload() {
  song = loadSound('song.mp3');
  albumCover = loadImage('songs_album_cover.jpg');
  magicalFont = loadFont('biro_font.ttf'); //font
}

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 100);
  textAlign(CENTER, CENTER);
  textFont(magicalFont);
  textSize(28);
  noStroke();

  fft = new p5.FFT(); //fft

  lyrics = [
    "Over the Dead Sea, keepin' you company",
    "Thinkin' I'm not afraid of you now",
    "I'm not afraid of you now",
    "Lettin' my eyes close, sheddin' my soft clothes",
    "Wind blows, wind that howls like a hound",
    "Wind that laughs like a clown",
    "Mystery of lack",
    "Stabbing stars through my back",
    "Forwards, beckon, rebound",
    "Forwards, beckon, rebound",
  ];

  times = [
    32, 38, 42, 45, 50, 54, 57, 60, 64, 68
  ];

  let topMargin = 50;
  let bottomMargin = 50;
  let usableHeight = height - topMargin - bottomMargin;
  let spacing = usableHeight / (lyrics.length - 1);

  for (let i = 0; i < lyrics.length; i++) {
    let yPos = topMargin + i * spacing;
    let xPos = width / 2;
    lyricPositions.push({ x: xPos, y: yPos });
  }

  for (let i = 0; i < 50; i++) {
    bgSwirls.push(new Swirl());
  }

  for (let i = 0; i < 150; i++) {
    stars.push(new Star());
  }

  for (let i = 0; i < 5; i++) {
    shootingStars.push(new ShootingStar());
  }

  for (let i = 0; i < 100; i++) {
    floatingParticles.push(new FloatingParticle());
  }
}

function draw() {
  background(230, 30, 5); //background color?

  image(albumCover, 0, 0, width, height);

  for (let s of stars) {
    s.update();
    s.display();
  }

  for (let swirl of bgSwirls) {
    swirl.update();
    swirl.display();
  }

  for (let ss of shootingStars) {
    ss.update();
    ss.display();
  }

  for (let p of floatingParticles) {
    p.update();
    p.display();
  }

  if (song.isPlaying()) {
    let t = song.currentTime();

    for (let i = 0; i < lyrics.length; i++) {
      if (t > times[i]) {
        push();
        fill(0, 0, 100);
        stroke(60, 20, 100, 50); 
        strokeWeight(3);
        text(lyrics[i], lyricPositions[i].x, lyricPositions[i].y);
        pop();
      }
    }
  } else {
    fill(0, 0, 100);
    textSize(24);
    text("Click to Start", width / 2, height / 2);
  }
}

function mousePressed() {
  if (!song.isPlaying()) {
    song.play();
    currentLine = 0;
  }
}

//colored circles
class Swirl {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.baseSize = random(5, 20);
    this.size = this.baseSize;
    this.speed = random(0.2, 0.5);
    this.angle = random(TWO_PI);
    this.hue = random(200, 360);
    this.offset = random(TWO_PI);
    this.brightnessOffset = random(TWO_PI);
  }

  update() {
    this.angle += 0.01;
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;

    this.size = this.baseSize + sin(frameCount * 0.02 + this.offset) * 3;

    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
    if (this.y > height) this.y = 0;
    if (this.y < 0) this.y = height;
  }

  display() {
    let brightness = 80 + sin(frameCount * 0.02 + this.brightnessOffset) * 20;
    fill(this.hue, 50, brightness, 30);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
}


class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.twinkle = random(70, 100);
    this.hue = random(40, 60);
  }

  update() {
    this.twinkle += random(-2, 2);
    this.twinkle = constrain(this.twinkle, 50, 100);
  }

  display() {
    noStroke();
    fill(this.hue, 20, this.twinkle);
    ellipse(this.x, this.y, this.size);
  }
}

//shootingstars
class ShootingStar {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(-width, 0);
    this.y = random(0, height / 2);
    this.len = random(30, 80);
    this.speed = random(5, 10);
    this.alpha = 255;
  }

  update() {
    this.x += this.speed;
    this.y += this.speed * 0.3;
    this.alpha -= 2;
    if (this.alpha <= 0) {
      this.reset();
    }
  }

  display() {
    stroke(60, 10, 100, this.alpha);
    strokeWeight(2);
    line(this.x, this.y, this.x - this.len, this.y - this.len * 0.3);
  }
}

//particles
class FloatingParticle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.speedX = random(-0.3, 0.3);
    this.speedY = random(-0.3, 0.3);
    this.alpha = random(30, 80);
    this.freqData = fft.analyze();  
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    let bass = fft.getEnergy("bass"); 
    let treble = fft.getEnergy("treble"); 

    //bass and treble
    this.size = map(bass, 0, 255, 2, 6); 
    this.alpha = map(treble, 0, 255, 30, 100); 

    //fft makes particles move faster when treble increases
    this.size = map(treble, 0, 255, 2, 10); 
    this.alpha = map(treble, 0, 255, 50, 255); 
    this.speedX = random(-0.3, 0.3) + map(treble, 0, 255, -0.5, 0.5); 
    this.speedY = random(-0.3, 0.3) + map(treble, 0, 255, -0.5, 0.5); 

    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
    if (this.y > height) this.y = 0;
    if (this.y < 0) this.y = height;
  }

  display() {
    noStroke();
    fill(60, 30, 100, this.alpha); 
    ellipse(this.x, this.y, this.size);
  }
}