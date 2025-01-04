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
  "java",
  "python",
  "sql",
  "html",
  "c",
  "boom",
];
var fruitsImgs = [],
  slicedFruitsImgs = [];
var livesImgs = [],
  livesImgs2 = [];
var boom, spliced, missed, over, start;
let handposeModel;
let video;
let openHandFrames = 0;
let handCache = null;
const requiredOpenFrames = 10;
const opennessThreshold = 0.02;

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
  bg = loadImage("images/background.png");
  foregroundImg = loadImage("images/home-mask.png");
  fruitLogo = loadImage("images/UL_FRI_logo.png");
  ninjaLogo = loadImage("images/ninja.png");
  scoreImg = loadImage("images/score.png");
  newGameImg = loadImage("images/start-game.png");
  fruitImg = loadImage("images/fruitMode.png");
  gameOverImg = loadImage("images/game-over.png");
}

async function setup() {
  cnv = createCanvas(1880, 880); // Updated canvas size
  sword = new Sword(color("#FFFFFF"));
  frameRate(60);
  score = 0;
  lives = 3;

  video = createCapture(VIDEO);
  video.size(1880, 880); // Updated video size
  video.hide();
}

function draw() {
  clear();
  background(bg);

  // Mirror the video feed
  push();
  translate(width, 0);    // Move the origin to the right edge of the canvas
  scale(-1, 1);           // Flip the canvas horizontally
  // image(video, 0, 0, width, height); // Draw the mirrored video
  pop();

  image(this.foregroundImg, 0, 0, 1880, 250);
  image(this.fruitLogo, 600, 30, 300, 144);
  image(this.ninjaLogo, 950, 0, 318, 165);
  image(this.newGameImg, 650, 650, 600, 200);
  // image(this.fruitImg, 365, 415, 90, 90);

  if (!isPlay && detections && detections.multiHandLandmarks) {
    const predictions = detections.multiHandLandmarks;
    // console.log(predictions.length);
    drawHands(predictions);

    // Check if both hands are open
    if (predictions.length === 2 && areBothHandsOpen(predictions)) {
      openHandFrames++; // Increment counter if hands are open
    } else {
      openHandFrames = 0; // Reset counter if hands are not open
    }

    // Trigger game if hands are open for required frames
    if (openHandFrames >= requiredOpenFrames) {
      start.play();
      isPlay = true;
    }
  }

  if (isPlay) {
    game();
  }
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function areBothHandsOpen(predictions) {

  // Helper function to check if a single hand is open
  const isHandOpen = (hand) => {
    const thumbIsOpen = distance(hand[4], hand[3]) > opennessThreshold;
    const indexIsOpen = distance(hand[8], hand[7]) > opennessThreshold;
    const middleIsOpen = distance(hand[12], hand[11]) > opennessThreshold;
    const ringIsOpen = distance(hand[16], hand[15]) > opennessThreshold;
    const pinkyIsOpen = distance(hand[20], hand[19]) > opennessThreshold;

    // Require majority of fingers to be open
    const fingersOpen = [
      thumbIsOpen,
      indexIsOpen,
      middleIsOpen,
      ringIsOpen,
      pinkyIsOpen,
    ].filter(isOpen => isOpen).length;

    // Adjust this threshold if needed
    return fingersOpen >= 4;
  };

  // Check if both hands are open
  return predictions.every(isHandOpen);
}


// function isIndexFingerUp(hand) {
//   // Check if the index finger is extended
//   const indexIsOpen = distance(hand[8], hand[7]) > opennessThreshold;

//   // Check if other fingers are closed
//   // const thumbIsClosed = distance(hand[4], hand[3]) < opennessThreshold;
//   const middleIsClosed = distance(hand[12], hand[10]) < opennessThreshold;
//   const ringIsClosed = distance(hand[16], hand[14]) < opennessThreshold;
//   const pinkyIsClosed = distance(hand[20], hand[18]) < opennessThreshold;

//   return indexIsOpen && middleIsClosed && ringIsClosed && pinkyIsClosed;
// }


function drawHands(predictions) {
  handCache = predictions; // Cache predictions

  // Define hand connections
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  ];

  // Iterate through each hand's predictions
  handCache.forEach((landmarks) => {
    drawConnections(landmarks, connections);
    drawLandmarks(landmarks);
  });
}

// Helper function to draw connections
function drawConnections(landmarks, connections) {
  stroke(0, 255, 0, 150); // Green color with transparency
  strokeWeight(2);

  connections.forEach(([start, end]) => {
    const startLandmark = landmarks[start];
    const endLandmark = landmarks[end];

    if (startLandmark && endLandmark) {
      line(
        (1 - startLandmark.x) * width, // Mirror the x-coordinate
        startLandmark.y * height,
        (1 - endLandmark.x) * width, // Mirror the x-coordinate
        endLandmark.y * height
      );
    }
  });
}

// Helper function to draw landmarks
function drawLandmarks(landmarks) {
  fill(0, 0, 255, 200); // Blue color with transparency
  noStroke();

  landmarks.forEach(({ x, y }) => {
    ellipse((1 - x) * width, y * height, 12, 12); // Mirror the x-coordinate
  });
}


function game() {
  clear();
  background(bg);
  if (detections && detections.multiHandLandmarks) {
    const predictions = detections.multiHandLandmarks;
    drawHands(predictions);

    // Update sword position based on thumb of the first hand
    // if (predictions.length > 0 && isIndexFingerUp(predictions[0])) {
    if (predictions.length > 0) {
      const indexFinger = predictions[0][8];
      sword.swipe((1 - indexFinger.x) * width, indexFinger.y * height); // Mirror the x-coordinate
    }
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
  image(this.gameOverImg, 650, 400, 600, 110);
  lives = 0;
}

function keyPressed() {
  if (lives == 0 && (key === 'r' || key === 'R')) {
    restartGame();
  }
}

function restartGame() {
  score = 0;
  lives = 3;
  isPlay = false;
  fruit = [];
  openHandFrames = 0;
  isGameOver = false; // Reset game over state
  loop(); // Restart the game loop
}