let shots = [];
let clickedShot = null;

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
}

function drawShootingChart() {
  // Define colors for each combination of SHOT_ZONE_BASIC and SHOT_ZONE_AREA
  let zoneColors = {
    "Above the Break 3": [255, 0, 0], // Red
    Backcourt: [0, 255, 0], // Green
    "In The Paint (Non-RA)": [0, 0, 255], // Blue
    "Left Corner 3": [255, 255, 0], // Yellow
    "Mid-Range": [255, 0, 255], // Magenta
    "Restricted Area": [0, 255, 255], // Cyan
    "Right Corner 3": [128, 0, 128], // Purple
  };

  // Define colors for each SHOT_ZONE_AREA
  let areaColors = {
    "Center(C)": [255, 0, 0], // Red
    "Right Side Center(RC)": [0, 255, 0], // Green
    "Left Side Center(LC)": [0, 0, 255], // Blue
    "Left Side(L)": [255, 255, 0], // Yellow
    "Right Side(R)": [255, 0, 255], // Magenta
    "Back Court(BC)": [0, 255, 255], // Cyan
  };

  // Clear the shots array
  shots = [];

  // Loop through each row in the CSV file
  for (let i = 0; i < shotData.getRowCount(); i++) {
    // Get the LOC_X and LOC_Y values
    let locX = shotData.getNum(i, "LOC_X");
    let locY = shotData.getNum(i, "LOC_Y");
    let shotZoneBasic = shotData.getString(i, "SHOT_ZONE_BASIC");
    let shotZoneArea = shotData.getString(i, "SHOT_ZONE_AREA");

    // Map the LOC_X and LOC_Y values to the canvas size
    let x = map(locX, -250, 250, 0, width);
    let y = map(locY, -50, 470, height, 0);

    // Set the color based on the zone and area
    let color = zoneColors[shotZoneBasic] ||
      areaColors[shotZoneArea] || [0, 0, 0]; // Default to black if no match
    fill(color[0], color[1], color[2], 255); // Set opacity to 255 (fully opaque)

    // Draw a circle at the mapped location
    noStroke();
    ellipse(x, y, 5, 5);

    // Store the shot data and position
    shots.push({
      x: x,
      y: y,
      data: {
        locX: locX,
        locY: locY,
        shotZoneBasic: shotZoneBasic,
        shotZoneArea: shotZoneArea,
        eventType: shotData.getString(i, "EVENT_TYPE"),
      },
    });
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
