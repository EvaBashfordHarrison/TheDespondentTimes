// -- this shows one headline at a time and is toggled by the 'single' button 

function loadSingle() {
  // buttons show and hide 
  //loadNewHeadline.show();
  btnStart.hide();
  btnAll.show();
  btnSingle.hide();
  fltrNeg.show();

  // design settings 
  let singleHeadlineFontSize = fontSize * 4; // 64
  noStroke();
  textAlign(LEFT);
  let currentX = padding;
  let currentY = mastheadSize * 2.75;

  // logic settings 
  let newHeadline = headlines[currentIndex]; // press '+ new' again for new headline 
  let splitWords = newHeadline.split(" "); // split each word.... 
  let detectedCatName = null; // reference: gemini debug for category index 

  // for each solo word inside each headline 
  for (let word of splitWords) {
    //  'cleanword' is no punctuation, lowercase, then find the index number of it in moralwords 
    let cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'’“”""]/g, "").toLowerCase(); 
    let idx = mWords.indexOf(cleanWord); // find index in 'cleanword' 

    // if it is in the index... 
    if (idx !== -1) {
      // find the index number of the detected category for the moral compass 
      detectedCatName = categories[idx]; 
      let catNum = CATEGORIES_Titles.indexOf(detectedCatName)
      console.log(`Category: ${detectedCatName} (index: ${catNum})`)
    }

    let posColor;
    let negColor;

    let splitLetter = word.split(""); // split each letter in each split words to be able to assign a particle class to each letter in a found pos or neg word - feels like a more intense aniamtion 

    // filter pressed -->  NEGATIVE WORDS PULL OUT
    if (!analyseFilter) { // if unpressed 
      fill(0); // fill everything with highlight 
    } else { // filter pressed -->  WORDS PULL OUT 

      if (foundNegWords.includes(cleanWord)) {
        // CIRCLES 
        for (let i = 0; i < splitLetter.length; i++) {
          negColor = color("#EE162B");
          let tW = singleHeadlineFontSize * 0.6; // 40px
          let x = currentX + (i * tW); 
          let cx = x + (tW / 2); // center x
          let cyVal = currentY + (tW * 0.8); // center Y value 
          particles.push(new Particle(cx,cyVal, 20, negColor, 40));
        } 
        fill("white"); // Highlight TEXT if button was toggled ON
      } else if (foundPosWords.includes(cleanWord)) {
          // CIRCLES
          for (let i = 0; i < splitLetter.length; i++) {
            posColor = color("#9AE422");
            let tW = singleHeadlineFontSize * 0.6; // 40px
            let x = currentX + (i * tW); //padding + textWidth * each iteration 
            let cx = x + (tW / 2); // center x
            let cyVal = currentY + (tW * 0.8); // center Y value 
            particles.push(new Particle(cx,cyVal, 20, posColor, 40));
          }  
          fill("white"); // Highlight TEXT if button was toggled ON
      } else {  
        fill(darkColor); // if not, fill everything else with darker color
      }
    }
    // ----- TEXT HERE 
    textSize(singleHeadlineFontSize); // 16*4 = 64 
    text(word, currentX, currentY, width - padding * 8);

    currentX += textWidth(word + " ");
    // add wrap around logic == reference: Gemini for debugging 
    if (currentX > width - padding * 14) {
      currentX = padding;
      currentY += singleHeadlineFontSize * 1.2;
    }
  }
  
  // ------ LOAD SINGLE MORAL COMPASS ------- 
  // if filter clicked...  
  if (analyseFilter) { 
    push();
    translate(padding * 20, mastheadSize * 3.5);
    // if it detects something, align it to the number in the array 
    if (detectedCatName !== null) { 
      moralCompass(0, 0, detectedCatName); // assign to detected category 
    } else {  
      moralCompass(0, 0, null); // if no negative word detected then compass flickers
    }
    pop();
  }

    // if (detectedCatName !== null) {
    //   serial.write(`CAT:${categoryIndex}\n`);
    // } else {
    //   serial.write("IDLE\n");
    // }
  }

