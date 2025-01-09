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
var fruitsList = ["java", "python", "sql", "html", "c", "js", "boom"];
var fruitsImgs = [],
  slicedFruitsImgs = [];
var livesImgs = [],
  livesImgs2 = [];
var boom, spliced, missed, over, start;
let handposeModel;
let video;
let openHandFrames = 0;
let closedHandFrames = 0;
let handCache = null;
let isGameOver = false;
let instructions = true;
const requiredOpenFrames = 10;
const requiredCloseFrames = 10;
const opennessThreshold = 0.02;

let width_image = 1880;
let height_image = 893;
let aspectRatio = width_image / height_image;

// katera leva, katera desna, restart z rokami

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
  leftHandFruits = loadImage("images/leftHand.png");
  rightHandFruits = loadImage("images/rightHand.png");
  gameOverText = loadImage("images/gameOverText.png");
}

async function setup() {
  let initialWidth = windowWidth;
  let initialHeight = windowWidth / aspectRatio;

  if (initialHeight > windowHeight) {
    initialHeight = windowHeight;
    initialWidth = windowHeight * aspectRatio;
  }

  cnv = createCanvas(initialWidth, initialHeight);
  sword = new Sword(color("#FFFFFF"));
  frameRate(60);
  score = 0;
  lives = 5;

  video = createCapture(VIDEO);
  video.size(initialWidth, initialHeight); // Updated video size
  video.hide();

  width_image = initialWidth;
  height_image = initialHeight;
  // setupDetection(initialWidth, initialHeight);
}

function draw() {
  clear();
  background(bg);

  // Mirror the video feed
  push();
  translate(width, 0); // Move the origin to the right edge of the canvas
  scale(-1, 1); // Flip the canvas horizontally
  // image(video, 0, 0, width, height); // Draw the mirrored video
  pop();

  image(this.foregroundImg, 0, 0, width_image, 250);
  image(this.fruitLogo, (width - 700) / 2, 30, 300, 144);
  image(this.ninjaLogo, width / 2, 0, 318, 165);
  if (instructions) {
    image(this.newGameImg, (width - 600) / 2, height - 250, 600, 200);
  }

  if (!isPlay && detections && detections.multiHandLandmarks) {
    const predictions = detections.multiHandLandmarks;

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

  if (lives == 0) {
    gameOver();
  }

  if (isPlay && lives > 0) {
    game();
  }
}

function areBothHandsOpen(predictions) {
  // Helper function to check if a single hand is open
  const isHandOpen = (hand) => {
    const thumbIsOpen = Math.abs(hand[4].y - hand[3].y) > opennessThreshold;
    const indexIsOpen = Math.abs(hand[8].y - hand[7].y) > opennessThreshold;
    const middleIsOpen = Math.abs(hand[12].y - hand[11].y) > opennessThreshold;
    const ringIsOpen = Math.abs(hand[16].y - hand[15].y) > opennessThreshold;
    const pinkyIsOpen = Math.abs(hand[20].y - hand[19].y) > opennessThreshold;

    // Require majority of fingers to be open
    const fingersOpen = [
      thumbIsOpen,
      indexIsOpen,
      middleIsOpen,
      ringIsOpen,
      pinkyIsOpen,
    ].filter((isOpen) => isOpen).length;

    // Adjust this threshold if needed
    return fingersOpen >= 4;
  };

  // Check if both hands are open
  return predictions.every(isHandOpen);
}

function isIndexFingerUp(hand) {
  // Check if the index finger is extended
  const thumbIsClosed = Math.abs(hand[4].y - hand[3].y) < opennessThreshold;
  // const indexIsOpen = Math.abs(hand[8].y - hand[7].y) > opennessThreshold;
  const middleIsClosed = Math.abs(hand[12].y - hand[11].y) < opennessThreshold;
  const ringIsClosed = Math.abs(hand[16].y - hand[15].y) < opennessThreshold;
  const pinkyIsClosed = Math.abs(hand[20].y - hand[19].y) < opennessThreshold;

  const fingersClosed = [
    thumbIsClosed,
    middleIsClosed,
    ringIsClosed,
    pinkyIsClosed,
  ].filter((isClosed) => isClosed).length;

  return fingersClosed >= 2;
}

function isThumbsUp(predictions) {
  const isThumbUp = (hand) => {
    // Check if the thumb is extended
    const thumbIsOpen = Math.abs(hand[4].y - hand[3].y) > opennessThreshold;
    const indexIsClosed = Math.abs(hand[8].y - hand[7].y) < opennessThreshold;
    const middleIsClosed =
      Math.abs(hand[12].y - hand[11].y) < opennessThreshold;
    const ringIsClosed = Math.abs(hand[16].y - hand[15].y) < opennessThreshold;
    const pinkyIsClosed = Math.abs(hand[20].y - hand[19].y) < opennessThreshold;

    const fingersClosed = [
      indexIsClosed,
      middleIsClosed,
      ringIsClosed,
      pinkyIsClosed,
    ].filter((isClosed) => isClosed).length;

    return thumbIsOpen && fingersClosed >= 2;
  };

  return predictions.every(isThumbUp);
}

function drawHands(predictions) {
  handCache = predictions; // Cache predictions

  // Define hand connections
  const connections = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4], // Thumb
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8], // Index finger
    [0, 9],
    [9, 10],
    [10, 11],
    [11, 12], // Middle finger
    [0, 13],
    [13, 14],
    [14, 15],
    [15, 16], // Ring finger
    [0, 17],
    [17, 18],
    [18, 19],
    [19, 20], // Pinky
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

function isLeftHand(hand) {
  if (hand.label === "Left") {
    return true;
  }
  return false;
}

function game() {
  clear();
  background(bg);
  let leftHand = null;
  if (detections && detections.multiHandLandmarks) {
    const predictions = detections.multiHandLandmarks;
    drawHands(predictions);

    // Update sword position based on thumb of the first hand
    // if (predictions.length > 0 && isIndexFingerUp(predictions[0])) {
    if (predictions.length > 0 && isIndexFingerUp(predictions[0])) {
      leftHand = isLeftHand(detections.multiHandedness[0]);
      const indexFinger = predictions[0][8];
      sword.swipe((1 - indexFinger.x) * width, indexFinger.y * height); // Mirror the x-coordinate
    }
  }
  if (frameCount % 5 === 0) {
    if (noise(frameCount) > 0.69 && fruit.length < 4) {
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
      if (sword.checkSlice(fruit[i], leftHand) && fruit[i].name != "boom") {
        // Sliced fruit
        spliced.play();
        textSize(80);
        fill(255);
        text("+" + sword.score, fruit[i].x, fruit[i].y - 50);
        points = points + sword.score;
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
  if (instructions) {
    image(this.leftHandFruits, 5, 80, 140, 260);
    image(this.rightHandFruits, width - 150, 90, 150, 260);
  }
  drawScore();
  drawLives();
}

function drawLives() {
  image(
    this.livesImgs[0],
    width - 200,
    20,
    livesImgs[0].width + 5,
    livesImgs[0].height + 5
  );
  image(
    this.livesImgs[1],
    width - 170,
    20,
    livesImgs[1].width + 5,
    livesImgs[1].height + 5
  );
  image(
    this.livesImgs[1],
    width - 135,
    25,
    livesImgs[1].width + 5,
    livesImgs[1].height + 5
  );
  image(
    this.livesImgs[2],
    width - 95,
    30,
    livesImgs[2].width + 5,
    livesImgs[2].height + 5
  );
  image(
    this.livesImgs[2],
    width - 55,
    40,
    livesImgs[2].width + 5,
    livesImgs[2].height + 5
  );
  if (lives <= 4) {
    image(
      this.livesImgs2[0],
      width - 200,
      20,
      livesImgs2[0].width + 5,
      livesImgs2[0].height + 5
    );
  }
  if (lives <= 3) {
    image(
      this.livesImgs2[1],
      width - 170,
      20,
      livesImgs2[1].width + 5,
      livesImgs2[1].height + 5
    );
  }
  if (lives <= 2) {
    image(
      this.livesImgs2[1],
      width - 135,
      25,
      livesImgs2[1].width + 5,
      livesImgs2[1].height + 5
    );
  }
  if (lives <= 1) {
    image(
      this.livesImgs2[2],
      width - 95,
      30,
      livesImgs2[2].width + 5,
      livesImgs2[2].height + 5
    );
  }
  if (lives === 0) {
    image(
      this.livesImgs2[2],
      width - 55,
      40,
      livesImgs2[2].width + 5,
      livesImgs2[2].height + 5
    );
  }
}

function drawScore() {
  image(this.scoreImg, 10, 10, 40, 40);
  textAlign(LEFT);
  noStroke();
  fill(255);
  textSize(50);
  text("score: " + score, 50, 50);
}

function gameOver() {
  // noLoop();
  if (!isGameOver) {
    lives = 0;
    over.play();
  }
  isGameOver = true;
  clear();
  background(bg);
  image(this.gameOverImg, (width - 600) / 2, (height - 250) / 2, 600, 110);
  if (instructions) {
    image(this.gameOverText, (width - 600) / 2, height - 300, 600, 200);
  }
  if (detections && detections.multiHandLandmarks) {
    const predictions = detections.multiHandLandmarks;
    drawHands(predictions);

    // Check if both hands are open
    if (predictions.length === 2 && isThumbsUp(predictions)) {
      closedHandFrames++; // Increment counter if hands are open
    } else {
      closedHandFrames = 0; // Reset counter if hands are not open
    }

    // Trigger game if hands are open for required frames
    if (closedHandFrames >= requiredCloseFrames) {
      restartGame();
    }
  }
}

function keyPressed() {
  if (lives == 0 && (key === "r" || key === "R")) {
    restartGame();
  } else if (key === "i" || key === "I") {
    instructions = !instructions;
  }
}

function restartGame() {
  score = 0;
  lives = 5;
  isPlay = false;
  fruit = [];
  openHandFrames = 0;
  closedHandFrames = 0;
  isGameOver = false; // Reset game over state
  loop(); // Restart the game loop
}
