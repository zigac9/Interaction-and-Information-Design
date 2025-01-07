function Sword(color) {
  this.swipes = [];
  this.color = color;
  this.leftHandFruits = ["sql", "html", "c"];
  this.rightHandFruits = ["java", "python", "js"];
  this.score = 0; // Add a score tracker
}

Sword.prototype.draw = function () {
  var l = this.swipes.length;
  for (var i = 0; i < this.swipes.length; i++) {
    var size = map(i, 0, this.swipes.length, 2, 27);
    noStroke();
    fill(this.color);
    ellipse(this.swipes[i].x, this.swipes[i].y, size);
  }
  if (l < 1) {
    return;
  }
  fill(255);
  textSize(20);
};

Sword.prototype.update = function () {
  if (this.swipes.length > 30) {
    this.swipes.splice(0, 1);
  }
  if (this.swipes.length > 0) {
    this.swipes.splice(0, 1);
  }
};

Sword.prototype.checkSlice = function (fruit, leftHand) {
  this.score = 0; // Reset the score
  if (fruit.sliced || this.swipes.length < 2 || leftHand == null) {
    return false;
  }

  if (
    (this.rightHandFruits.includes(fruit.name) && !leftHand) ||
    (this.leftHandFruits.includes(fruit.name) && leftHand)
  ) {
    return false;
  }

  var length = this.swipes.length;
  var stroke1 = this.swipes[length - 1]; // Latest stroke
  var stroke2 = this.swipes[length - 2]; // Second last stroke
  var timeDiff = millis() - this.swipes[length - 2].time; // Time difference
  var distance = dist(stroke1.x, stroke1.y, stroke2.x, stroke2.y); // Distance between strokes
  var speed = distance / timeDiff; // Calculate speed
  // console.log(speed);
  // console.log(distance);

  // draw speed
  // console.log(speed);
  // Distance checks
  var d1 = dist(stroke1.x, stroke1.y, fruit.x, fruit.y);
  var d2 = dist(stroke2.x, stroke2.y, fruit.x, fruit.y);
  var d3 = dist(stroke1.x, stroke1.y, stroke2.x, stroke2.y);
  var sliced = d1 < fruit.size || (d1 < d3 && d2 < d3 && d3 < width / 4);

  if (sliced) {
    if (speed < 1) {
      sliced = false; // Too slow, don't slice
    } else if (speed < 3) {
      this.score += 1; // Ideal speed, high points
    } else if (speed < 5) {
      this.score += 5; // Moderate speed, moderate points
    } else {
      this.score += 10; // Too fast, minimal points
    }
  }

  fruit.sliced = sliced;
  return sliced;
};

Sword.prototype.swipe = function (x, y) {
  // sword
  this.swipes.push({ x: x, y: y, time: millis() });
};
