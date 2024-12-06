let detections = {};

const videoElement = document.getElementById("video");
videoElement.width = 1200; // Set the width of the video element
videoElement.height = 820; // Set the height of the video element

function gotHands(results) {
  detections = results;
  // console.log(detections);
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
hands.onResults(gotHands);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1200, // Adjust the width here
  height: 820, // Adjust the height here
});
camera.start();
