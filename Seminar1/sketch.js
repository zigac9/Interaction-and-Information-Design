let shots = [];
let clickedShot = null;
let combinedEfficiency = {};
let popup = null;

let width_image = 1352;
let height_image = 1273;

function preload() {
  courtImg = loadImage("./images/NBA_court.png");
  shotData = loadTable("./data/shot_data.csv", "csv", "header");
}

function setup() {
  createCanvas(width_image, height_image);
}

function draw() {
  background(255);
  image(courtImg, 0, 0, width, height);

  drawShootingChart();
  displayShotData();
}

function windowResized() {
  let aspectRatio = width_image / height_image;
  let newWidth = windowWidth;
  let newHeight = windowWidth / aspectRatio;

  if (newHeight > windowHeight) {
    newHeight = windowHeight;
    newWidth = windowHeight * aspectRatio;
  }

  resizeCanvas(newWidth, newHeight);
}

function drawShootingChart() {
  let zoneColors = {
    "Above the Break 3": [255, 0, 0],
    Backcourt: [0, 255, 0],
    "In The Paint (Non-RA)": [0, 0, 255],
    "Left Corner 3": [255, 255, 0],
    "Mid-Range": [255, 0, 255],
    "Restricted Area": [0, 255, 255],
    "Right Corner 3": [128, 0, 128],
  };

  let areaColors = {
    "Center(C)": [255, 0, 0],
    "Right Side Center(RC)": [0, 255, 0],
    "Left Side Center(LC)": [0, 0, 255],
    "Left Side(L)": [255, 255, 0],
    "Right Side(R)": [255, 0, 255],
    "Back Court(BC)": [0, 255, 255],
  };

  shots = [];
  combinedEfficiency = {};

  for (let i = 0; i < shotData.getRowCount(); i++) {
    let locX = shotData.getNum(i, "LOC_X");
    let locY = shotData.getNum(i, "LOC_Y");
    let shotZoneBasic = shotData.getString(i, "SHOT_ZONE_BASIC");
    let shotZoneArea = shotData.getString(i, "SHOT_ZONE_AREA");
    let eventType = shotData.getString(i, "EVENT_TYPE");

    let x = map(locX, -250, 250, 0, width);
    let y = map(locY, -50, 418, height, 0);
    strokeWeight(1);

    let color = zoneColors[shotZoneBasic] ||
      areaColors[shotZoneArea] || [0, 0, 0];

    if (shotData.getString(i, "EVENT_TYPE") === "Made Shot") {
      fill(color[0], color[1], color[2], 255);
      noStroke();
    } else {
      noFill();
      stroke(color[0], color[1], color[2], 255);
    }
    let ellipseSize = min(width_image, height_image) * 0.009; // 2% of the smaller dimension
    ellipse(x, y, ellipseSize, ellipseSize);

    shots.push({
      x: round(x),
      y: round(y),
      data: {
        locX: locX,
        locY: locY,
        shotZoneBasic: shotZoneBasic,
        shotZoneArea: shotZoneArea,
        eventType: eventType,
      },
    });

    let combinedKey = `${shotZoneBasic} - ${shotZoneArea}`;

    if (!combinedEfficiency[combinedKey]) {
      combinedEfficiency[combinedKey] = { made: 0, attempted: 0 };
    }

    combinedEfficiency[combinedKey].attempted++;

    if (eventType === "Made Shot") {
      combinedEfficiency[combinedKey].made++;
    }
  }
}

function mousePressed() {
  for (let shot of shots) {
    let d = dist(mouseX, mouseY, shot.x, shot.y);
    if (d < 8) {
      clickedShot = shot;
      break;
    } else {
      clickedShot = null;
    }
  }
}

function displayShotData() {
  if (clickedShot) {
    let tooltipX = clickedShot.x + 15;
    let tooltipY = clickedShot.y - 15;
    let tooltipWidth = 200;
    let tooltipHeight = 140;

    // Adjust position if tooltip goes off the canvas
    if (tooltipX + tooltipWidth > width) {
      tooltipX = clickedShot.x - tooltipWidth - 15;
    }
    if (tooltipY + tooltipHeight > height) {
      tooltipY = clickedShot.y - tooltipHeight - 15;
    }

    fill(0, 0, 0, 200); // Black background with some transparency
    rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 10); // Rounded corners

    fill(255); // White text
    textSize(12);

    text(`Location X: ${clickedShot.x}`, tooltipX + 10, tooltipY + 20);
    text(`Location Y: ${clickedShot.y}`, tooltipX + 10, tooltipY + 40);
    text(
      `Zone Basic: ${clickedShot.data.shotZoneBasic}`,
      tooltipX + 10,
      tooltipY + 60
    );
    text(
      `Zone Area: ${clickedShot.data.shotZoneArea}`,
      tooltipX + 10,
      tooltipY + 80
    );
    text(
      `Event Type: ${clickedShot.data.eventType}`,
      tooltipX + 10,
      tooltipY + 100
    );

    // Search for efficiency
    let combinedKey = `${clickedShot.data.shotZoneBasic} - ${clickedShot.data.shotZoneArea}`;
    let efficiency = combinedEfficiency[combinedKey]
      ? (combinedEfficiency[combinedKey].made /
          combinedEfficiency[combinedKey].attempted) *
        100
      : 0;
    text(
      `Efficiency: ${efficiency.toFixed(2)}%`,
      tooltipX + 10,
      tooltipY + 120
    );

    noFill();
    stroke(0);
    strokeWeight(2);
    let ellipseSize = min(width_image, height_image) * 0.009; // 2% of the smaller dimension
    ellipse(clickedShot.x, clickedShot.y, ellipseSize, ellipseSize);
  }
}
