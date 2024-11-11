let shots = [];
let clickedShot = null;
let combinedEfficiency = {};
let popup = null;

let width_image = 1352;
let height_image = 1273;
let aspectRatio = width_image / height_image;

function preload() {
  courtImg = loadImage("./images/NBA_court.png");
  shotData = loadTable("./data/shot_data.csv", "csv", "header");
}

function setup() {
  let initialWidth = windowWidth;
  let initialHeight = windowWidth / aspectRatio;

  if (initialHeight > windowHeight) {
    initialHeight = windowHeight;
    initialWidth = windowHeight * aspectRatio;
  }

  let canvas = createCanvas(initialWidth, initialHeight);
  let container = document.getElementById("canvasContainer");
  if (container) {
    container.appendChild(canvas.elt);
  }
  width_image = initialWidth;
  height_image = initialHeight;
}

function draw() {
  background(255);
  image(courtImg, 0, 0, width, height);

  let yearFilter = document.getElementById("yearSlider").value;
  let allYears = document.getElementById("allCheckbox").checked;
  if (allYears) {
    yearFilter = "All";
  } else {
    yearFilter = parseInt(yearFilter);
  }

  let dropdownQuarter = document.getElementById("filterDropdown").value;
  let dropdownTeam = document.getElementById("teamDropdown").value;

  drawShootingChart(yearFilter, dropdownQuarter, dropdownTeam);
  displayShotData(yearFilter, dropdownQuarter, dropdownTeam);
  displayShotCount();
  displayEfficiency();
}

function displayShotCount() {
  let shotCountDisplay = document.getElementById("shotCountDisplay");
  if (shotCountDisplay) {
    shotCountDisplay.innerHTML = `<b>Number of shots:</b> ${shots.length}`;
  }
}

function displayEfficiency() {
  let efficiencyDisplay = document.getElementById("efficiencyDisplay");
  if (efficiencyDisplay) {
    let efficiencyText =
      "<div style='font-size: 18px; font-weight:bold; padding-bottom:5px;'><b>Efficiency:</b></div>";
    let keys = Object.keys(combinedEfficiency).sort();
    for (let key of keys) {
      let efficiency =
        combinedEfficiency[key].made / combinedEfficiency[key].attempted;
      efficiencyText += `<div style="padding: 5px 0;"><b>${key}:</b> ${(
        efficiency * 100
      ).toFixed(2)}%</div>`;
    }
    efficiencyDisplay.innerHTML = efficiencyText;
  }
}

function windowResized() {
  let newWidth = windowWidth;
  let newHeight = windowWidth / aspectRatio;

  if (newHeight > windowHeight) {
    newHeight = windowHeight;
    newWidth = windowHeight * aspectRatio;
  }

  resizeCanvas(newWidth, newHeight);
  width_image = newWidth;
  height_image = newHeight;
}

function drawShootingChart(yearFilter, dropdownQuarter, dropdownTeam) {
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
    let actionType = shotData.getString(i, "ACTION_TYPE");
    let shotType = shotData.getString(i, "SHOT_TYPE");
    let shotZoneRange = shotData.getString(i, "SHOT_ZONE_RANGE");
    let gameDate = shotData.getString(i, "GAME_DATE");
    let gameDateYear = gameDate.toString().substring(0, 4);
    let gameDateMonth = gameDate.toString().substring(4, 6);
    let period = shotData.getString(i, "PERIOD");
    let teamVTM = shotData.getString(i, "HTM");
    let teamHTM = shotData.getString(i, "VTM");

    if (
      !(
        (int(gameDateYear) == yearFilter && int(gameDateMonth) >= 10) ||
        (int(gameDateYear) == yearFilter + 1 && int(gameDateMonth) <= 8) ||
        yearFilter == "All"
      )
    ) {
      continue;
    }

    if (dropdownQuarter != "All") {
      let quarter =
        dropdownQuarter == "Overtime 1"
          ? 5
          : dropdownQuarter == "Overtime 2"
          ? 6
          : parseInt(dropdownQuarter, 10);

      if (quarter != period) {
        continue;
      }
    }

    if (dropdownTeam != "All") {
      if (dropdownTeam != teamVTM && dropdownTeam != teamHTM) {
        continue;
      }
    }

    let x = map(locX, -250, 250, 0, width);
    let y = map(locY, -50, 418, height, 0);
    strokeWeight(2);

    let color = zoneColors[shotZoneBasic] ||
      areaColors[shotZoneArea] || [0, 0, 0];

    if (shotData.getString(i, "EVENT_TYPE") === "Made Shot") {
      fill(color[0], color[1], color[2], 255);
      noStroke();
    } else {
      noFill();
      stroke(color[0], color[1], color[2], 255);
    }
    let ellipseSize;
    if (
      yearFilter == "All" &&
      dropdownQuarter == "All" &&
      dropdownTeam == "All"
    ) {
      ellipseSize = min(width_image, height_image) * 0.01;
    } else {
      ellipseSize = min(width_image, height_image) * 0.02;
    }
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
        actionType: actionType,
        shotType: shotType,
        shotZoneRange: shotZoneRange,
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

function displayShotData(yearFilter, dropdownQuarter, dropdownTeam) {
  if (clickedShot) {
    let tooltipX = clickedShot.x + 15;
    let tooltipY = clickedShot.y - 15;
    let tooltipWidth = 250;
    let tooltipHeight = 160;

    if (tooltipX + tooltipWidth > width) {
      tooltipX = clickedShot.x - tooltipWidth - 15;
    }
    if (tooltipY + tooltipHeight > height) {
      tooltipY = clickedShot.y - tooltipHeight - 15;
    }
    fill(0, 0, 0, 200);
    rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 10);

    fill(255);
    textSize(12);

    text(
      `Shoot zone basic: ${clickedShot.data.shotZoneBasic}`,
      tooltipX + 10,
      tooltipY + 20
    );
    text(
      `Shoot Zone Area: ${clickedShot.data.shotZoneArea}`,
      tooltipX + 10,
      tooltipY + 40
    );
    text(
      `Shot zone range: ${clickedShot.data.shotZoneRange}`,
      tooltipX + 10,
      tooltipY + 60
    );
    text(
      `Action type: ${clickedShot.data.actionType}`,
      tooltipX + 10,
      tooltipY + 80
    );
    text(
      `Shot type: ${clickedShot.data.shotType}`,
      tooltipX + 10,
      tooltipY + 100
    );
    text(
      `Event Type: ${clickedShot.data.eventType}`,
      tooltipX + 10,
      tooltipY + 120
    );

    let combinedKey = `${clickedShot.data.shotZoneBasic} - ${clickedShot.data.shotZoneArea}`;
    let efficiency = combinedEfficiency[combinedKey]
      ? (combinedEfficiency[combinedKey].made /
          combinedEfficiency[combinedKey].attempted) *
        100
      : 0;
    text(
      `Area Efficiency: ${efficiency.toFixed(2)}%`,
      tooltipX + 10,
      tooltipY + 140
    );

    noFill();
    stroke(0);
    strokeWeight(3);
    if (
      yearFilter == "All" &&
      dropdownQuarter == "All" &&
      dropdownTeam == "All"
    ) {
      ellipseSize = min(width_image, height_image) * 0.01;
    } else {
      ellipseSize = min(width_image, height_image) * 0.02;
    }
    ellipse(clickedShot.x, clickedShot.y, ellipseSize, ellipseSize);
  }
}

function updateYearLabel(value) {
  let startYear = value;
  let endYear = parseInt(value) + 1;
  document.getElementById(
    "selectedYear"
  ).textContent = `${startYear}/${endYear}`;
  redraw();
}

function toggleAllYearFilter(checkbox) {
  if (checkbox.checked) {
    document.getElementById("yearSlider").disabled = true;
    document.getElementById("selectedYear").textContent = "All Years";
  } else {
    document.getElementById("yearSlider").disabled = false;
    updateYearLabel(document.getElementById("yearSlider").value);
  }
}
