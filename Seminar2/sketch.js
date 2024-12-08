// GENERAL VARIABLES
var cnv;
var score,
  points = 0;
var lives,
  x = 0;
var isPlay = false;
var gravity = 0.1;
var sword;
var fruit = [];
var fruitsList = [
  "apple",
  "banana",
  "peach",
  "strawberry",
  "watermelon",
  "boom",
];
var fruitsImgs = [],
  slicedFruitsImgs = [];
var livesImgs = [],
  livesImgs2 = [];
var boom, spliced, missed, over, start;
let handposeModel;
let video;

function preload() {
  // LOAD SOUNDS
  boom = loadSound("sounds/boom.mp3");
  spliced = loadSound("sounds/splatter.mp3");
  missed = loadSound("sounds/missed.mp3");
  start = loadSound("sounds/start.mp3");
  over = loadSound("sounds/over.mp3");

  // LOAD IMAGES
  for (var i = 0; i < fruitsList.length - 1; i++) {
    slicedFruitsImgs[2 * i] = loadImage("images/" + fruitsList[i] + "-1.png");
    slicedFruitsImgs[2 * i + 1] = loadImage(
      "images/" + fruitsList[i] + "-2.png"
    );
  }
  for (var i = 0; i < fruitsList.length; i++) {
    fruitsImgs[i] = loadImage("images/" + fruitsList[i] + ".png");
  }
  for (var i = 0; i < 3; i++) {
    livesImgs[i] = loadImage("images/x" + (i + 1) + ".png");
  }
  for (var i = 0; i < 3; i++) {
    livesImgs2[i] = loadImage("images/xx" + (i + 1) + ".png");
  }
  bg = loadImage("images/background.jpg");
  foregroundImg = loadImage("images/home-mask.png");
  fruitLogo = loadImage("images/fruit.png");
  ninjaLogo = loadImage("images/ninja.png");
  scoreImg = loadImage("images/score.png");
  newGameImg = loadImage("images/new-game.png");
  fruitImg = loadImage("images/fruitMode.png");
  gameOverImg = loadImage("images/game-over.png");
}

async function setup() {
  cnv = createCanvas(800, 635);
  sword = new Sword(color("#FFFFFF"));
  frameRate(60);
  score = 0;
  lives = 3;

  video = createCapture(VIDEO);
  video.size(800, 635);
  video.hide();

  handposeModel = await handpose.load();
}

function draw() {
  clear();
  background(bg);

  image(this.foregroundImg, 0, 0, 800, 350);
  image(this.fruitLogo, 40, 20, 358, 195);
  image(this.ninjaLogo, 420, 50, 318, 165);
  image(this.newGameImg, 310, 360, 200, 200);
  image(this.fruitImg, 365, 415, 90, 90);

  if (detections && detections.multiHandLandmarks) {
    const predictions = detections.multiHandLandmarks;
    console.log(predictions.length);
    drawHands(predictions);
    if (predictions.length === 2 && areBothHandsOpen(predictions)) {
      start.play();
      isPlay = true;
    }
  }

  if (isPlay) {
    game();
  }
}

function areBothHandsOpen(predictions) {
  return predictions.every((hand) => {
    const thumbIsOpen = hand[4].y < hand[3].y;
    const indexIsOpen = hand[8].y < hand[7].y;
    const middleIsOpen = hand[12].y < hand[11].y;
    const ringIsOpen = hand[16].y < hand[15].y;
    const pinkyIsOpen = hand[20].y < hand[19].y;
    return (
      thumbIsOpen && indexIsOpen && middleIsOpen && ringIsOpen && pinkyIsOpen
    );
  });
}

function drawHands(predictions) {
  for (let i = 0; i < predictions.length; i++) {
    const landmarks = predictions[i];

    for (let j = 0; j < landmarks.length; j++) {
      const { x, y } = landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(x * width, y * height, 10, 10);
    }
  }
}

function game() {
  clear();
  background(bg);
  if (mouseIsPressed) {
    // Draw sword
    sword.swipe(mouseX, mouseY);
  }
  if (frameCount % 5 === 0) {
    if (noise(frameCount) > 0.69) {
      fruit.push(randomFruit()); // Display new fruit
    }
  }

  points = 0;
  for (var i = fruit.length - 1; i >= 0; i--) {
    fruit[i].update();
    fruit[i].draw();
    if (!fruit[i].visible) {
      if (!fruit[i].sliced && fruit[i].name != "boom") {
        // Missed fruit
        image(this.livesImgs2[0], fruit[i].x, fruit[i].y - 120, 50, 50);
        missed.play();
        lives--;
        x++;
      }
      if (lives < 1) {
        // Check for lives
        gameOver();
      }
      fruit.splice(i, 1);
    } else {
      if (fruit[i].sliced && fruit[i].name == "boom") {
        // Check for bomb
        boom.play();
        gameOver();
      }
      if (sword.checkSlice(fruit[i]) && fruit[i].name != "boom") {
        // Sliced fruit
        spliced.play();
        points++;
        fruit[i].update();
        fruit[i].draw();
      }
    }
  }
  if (frameCount % 2 === 0) {
    sword.update();
  }
  sword.draw();
  score += points;
  drawScore();
  drawLives();
}

function drawLives() {
  image(
    this.livesImgs[0],
    width - 110,
    20,
    livesImgs[0].width,
    livesImgs[0].height
  );
  image(
    this.livesImgs[1],
    width - 88,
    20,
    livesImgs[1].width,
    livesImgs[1].height
  );
  image(
    this.livesImgs[2],
    width - 60,
    20,
    livesImgs[2].width,
    livesImgs[2].height
  );
  if (lives <= 2) {
    image(
      this.livesImgs2[0],
      width - 110,
      20,
      livesImgs2[0].width,
      livesImgs2[0].height
    );
  }
  if (lives <= 1) {
    image(
      this.livesImgs2[1],
      width - 88,
      20,
      livesImgs2[1].width,
      livesImgs2[1].height
    );
  }
  if (lives === 0) {
    image(
      this.livesImgs2[2],
      width - 60,
      20,
      livesImgs2[2].width,
      livesImgs2[2].height
    );
  }
}

function drawScore() {
  image(this.scoreImg, 10, 10, 40, 40);
  textAlign(LEFT);
  noStroke();
  fill(255, 147, 21);
  textSize(50);
  text(score, 50, 50);
}

function gameOver() {
  noLoop();
  over.play();
  clear();
  background(bg);
  image(this.gameOverImg, 155, 260, 490, 85);
  lives = 0;
  console.log("lost");
}
