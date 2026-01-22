function moralCompass(xPos, yPos, _category) {
  // for index reference == 0-11
  // ["HARM", "CHEATING", "BETRAYAL", "SUBVERSION", "DEGRADATION", "OPPRESSION", "CARE", "FAIRNESS", "LOYALTY", "AUTHORITY", "SANCTITY", "LIBERTY"];

  let dialP = color("#9AE422");
  let dialN = color("#EE162B");

  let categoryIndex = CATEGORIES_Titles.indexOf(_category);  // returns 0-11 

  if (categoryIndex !== -1) { // if picked up word: 
    let mappedAngle = categoryIndex * 30; // Each step is 30 degrees 
    serial.write(`CAT:${categoryIndex}\n`);
    // make sure it points the right color at pos and neg 
    if (categoryIndex <= 5) { // neg 
      targetAngle = mappedAngle;    
    } else { //pos 
      targetAngle = mappedAngle - 180;    
    }
    } else if (categoryIndex === -1) { // if null / no word is picked up 
    targetAngle = noise(frameCount * 0.1) * 360;
    serial.write("IDLE\n");
  } else { // if two words picked up -- spin fast 
    targetAngle = sin(frameCount * 2) * 180;
  }

  // if (categoryIndex !== -1) {
  //   serial.write(`CAT:${categoryIndex}\n`);
  // } else {
  //   serial.write("IDLE\n");
  // }

  textSize(12); // header text size 

  // CIRCLE 
  noFill();
  stroke(highlightColor);
  circle(xPos, xPos, 300);

  // Draw Headings, arrows, design elements 
  for (let p of chosenPoints) { // categories.length (12)
    push();
    rotate(p.angle);
    fill("#003772");
    noStroke();

    // dials
    beginShape();
    vertex(xPos, 12);
    vertex(8, yPos);
    vertex(xPos, -110);
    vertex(-8, yPos);
    vertex(xPos, 12);
    endShape();

    // TEXT
    fill(highlightColor);
    textAlign(CENTER);
    text(p.catHeading, xPos, -165);
    textSize(30);
    text(p.shortCatHeading, xPos, -120);

    // 30° lines
    rotate(15);
    stroke("#003772");
    line(xPos, 60, xPos, 180); // 120 height

    pop();
  }

  // Move currentAngle towards targetAngle 
  currentAngle += (targetAngle - currentAngle) * easing;

  // Draw Dial
  push();
  let dialW = 5;
  let dialH = 130;

  rotate(currentAngle);
  fill(dialN);
  noStroke();
  // neg dial 
  beginShape();
  vertex(dialW, yPos); // 
  vertex(xPos, -dialH);// 
  vertex(-dialW, yPos);// 
  vertex(dialW, yPos); // 
  endShape();
  // pos dial 
  fill(dialP);
  noStroke();
  beginShape();
  vertex(xPos, yPos);
  vertex(dialW, yPos);
  vertex(xPos, dialH);
  vertex(-dialW, yPos);
  vertex(xPos, yPos);
  endShape();

  pop();
}