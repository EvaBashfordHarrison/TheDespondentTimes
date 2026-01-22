// -- this shows all headlines on one page and is toggled by the 'show all' button 

function loadAll() {
  // buttons show and hide 
  btnStart.hide();
  btnSingle.show();
  btnAll.hide();
  fltrNeg.show();
  // loadNewHeadline.hide();

  // design settings  
  textSize(fontSize); // 16
  textAlign(LEFT);
  noStroke();
  let lineHeight = 24;
  let startX = 55;
  let startY = mastheadSize * 2.5; 
  let tW = 6; // text Width
  let sW = 6; // space Width

  // Show all headlines from the API (up to 50) 
  for (let i = 0; i < headlines.length; i++) {
    
    let currentLine = headlines[i];
    let splitWords = currentLine.split(" "); // into each word... 

    // Calculate Grid Positions -- monospace font so easier to find X and Y
    let currentY = startY + lineHeight * (i + 1); // 
    let currentX = padding; 

    // for each solo word inside each headline
    for (let word of splitWords) {
      let cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'’“”""]/g, "").toLowerCase();
      let idx = mWords.indexOf(cleanWord); 

      noStroke();
      let score = scores[idx]; // pull score number
      let negSize = map(score,6,10,fontSize * 2,fontSize * 5); // size mapped to score number - 6 is smaller, 10 is bigger 
      let posSize = map(score, 1,5,fontSize * 5,fontSize * 2);  // mapped to score - 1 is big, 5 is smaller 
      
      if (!analyseFilter) { // filter not pressed state: 
        fill(0); // white background, black text 
      } else { // filter pressed -->  WORDS PULL OUT 

        if (foundNegWords.includes(cleanWord)) {
          let negColor = color("#EE162B");
          let cx = idx / 4
          let x =  currentX + cx;
          let y = currentY - fontSize / 3;

          particles.push(new Particle(x,y, negSize, negColor, 60));

          fill("white"); // Highlight TEXT if button was toggled ON

        } else if (foundPosWords.includes(cleanWord)) {
          
          let posColor = color("#9AE422");
          let cx = idx / 4
          let x =  currentX + cx;
          let y = currentY - fontSize / 3;

          particles.push(new Particle(x,y, posSize, posColor, 60));
          fill("white")

        } else {
          noFill();
        } 
      }

      // ---- TEXT HERE 
      textAlign(LEFT);
      text(word, currentX, currentY);
      currentX += textWidth(word) + sW; // 

      // add wrap around logic == reference: Gemini for debugging 
      if (currentX > width) {
        currentX = padding;
        currentY += fontSize * 1.2;
      }
    }
  }

    // ------ LOAD ALL MORAL COMPASS ------- 
  // if filter clicked...  
  // if (analyseFilter) { 
  //   push();
  //   translate(padding * 20, 500);
  //   moralCompass(0, 0, null); // if no negative word detected then compass flickers
  //   pop();
  //   }
}