let shots = [];
let clickedShot = null;
let combinedEfficiency = {};

function preload() {
  courtImg = loadImage("./images/NBA_court.png");
  shotData = loadTable("./data/shot_data.csv", "csv", "header");
}

function setup() {
  createCanvas(1352, 1273);
}

function draw() {
  background(255);
  image(courtImg, 0, 0, width, height);

  drawShootingChart();
  // displayEfficiency();
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
    let y = map(locY, -50, 470, height, 0);

    let color = zoneColors[shotZoneBasic] ||
      areaColors[shotZoneArea] || [0, 0, 0];
    fill(color[0], color[1], color[2], 255);

    noStroke();
    ellipse(x, y, 5, 5);

    shots.push({
      x: x,
      y: y,
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

  // Calculate and display efficiency at each shot location
  let shot_before_key = new Set();
  for (let shot of shots) {
    let combinedKey = `${shot.data.shotZoneBasic} - ${shot.data.shotZoneArea}`;
    let efficiency =
      (combinedEfficiency[combinedKey].made /
        combinedEfficiency[combinedKey].attempted) *
      100;
    if (shot_before_key.has(combinedKey)) {
      continue;
    }
    fill(0);
    textSize(30);
    text(`${efficiency.toFixed(2)}%`, shot.x + 5, shot.y - 5);
    shot_before_key.add(combinedKey);
  }
}

function displayEfficiency() {
  fill(0);
  textSize(12);
  let y = 20;

  text("Combined Zone and Area Efficiency:", 10, y);
  y += 20;
  for (let key in combinedEfficiency) {
    let efficiency =
      (combinedEfficiency[key].made / combinedEfficiency[key].attempted) * 100;
    text(`${key}: ${efficiency.toFixed(2)}%`, 10, y);
    y += 20;
  }
}

function drawBackgroundAreas(zoneColors, areaColors) {
  // Draw semi-transparent background areas for each zone
  for (let zone in zoneColors) {
    let color = zoneColors[zone];
    fill(color[0], color[1], color[2], color[3]);

    // Example: Drawing rectangles for different zones
    if (zone === "Above the Break 3") {
      rect(0, 0, width, height / 3);
    } else if (zone === "Backcourt") {
      rect(0, height / 3, width, height / 3);
    } else if (zone === "In The Paint (Non-RA)") {
      rect(0, (2 * height) / 3, width, height / 3);
    } else if (zone === "Left Corner 3") {
      rect(0, 0, width / 3, height);
    } else if (zone === "Mid-Range") {
      rect(width / 3, 0, width / 3, height);
    } else if (zone === "Restricted Area") {
      rect((2 * width) / 3, 0, width / 3, height);
    } else if (zone === "Right Corner 3") {
      rect((2 * width) / 3, 0, width / 3, height);
    }
  }

  // Draw semi-transparent background areas for each area
  for (let area in areaColors) {
    let color = areaColors[area];
    fill(color[0], color[1], color[2], color[3]);

    // Example: Drawing rectangles for different areas
    if (area === "Center(C)") {
      rect(width / 3, height / 3, width / 3, height / 3);
    } else if (area === "Right Side Center(RC)") {
      rect((2 * width) / 3, height / 3, width / 3, height / 3);
    } else if (area === "Left Side Center(LC)") {
      rect(0, height / 3, width / 3, height / 3);
    } else if (area === "Left Side(L)") {
      rect(0, 0, width / 3, height);
    } else if (area === "Right Side(R)") {
      rect((2 * width) / 3, 0, width / 3, height);
    }
  }
}
