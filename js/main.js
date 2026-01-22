// ---- WELCOME TO THE DESPONDENT TIMES. PLEASE VIEW IN THE LIVE SERVER FOR THE API TO WORK. 
// PLEASE EXPERIMENT WITH THE TWO VIEWERS: SOLO AND ALL. 
// PLEASE TOGGLE THE ANALYSE BUTTON. 

// this is the main.js root == particle.js is a class, load single and load all are two functions for different viewing modes, and moralCompass.js is the moral compass function
let serial;
let latestSerial = ""; 
let port;
let writer;
let serialConnected = false;
let reader;
let latestData = "";
let lastSentCatIndex = null;
let readBuffer = "";

// category titles relating to the Moral Foundations theory (Haidt, 2012)
let mode = "loading"; // Options: 'loading', 'single', 'all'

let particles = []; // empty array for particle class 

// settings for moral compass dial 
let CATEGORIES_Titles = ["HARM", "CHEATING", "BETRAYAL", "SUBVERSION", "DEGRADATION", "OPPRESSION", "CARE", "FAIRNESS", "LOYALTY", "AUTHORITY", "SANCTITY", "LIBERTY"];
let shortCats = ["H", "C", "B", "S", "D", "O", "C", "F", "L", "A", "S", "L"];
let chosenPoints = []; 

// API FEED -- reference: 
let currentHeadline = ""; // push new 

let headlines = []; // load headlines as list  
let currentIndex = 0; // starting at the top 

// JSONS -------------
let wordData; //refers to the json call 
// inside wordData.moralWords... 
let mWords = []; // mWords = wordData.moralWords.map((c) => c.word); 
let categories = [];
let scores = [];
let newsData; // sample news data for testing without API key

// buttons
let btnSingle;
let btnStart;
let btnAll;
let fltrPos;
let fltrNeg;
let analyseFilter = false; // Toggle state 

// // arduino button 
// let btnConnect;


// design elements
let fontSize;
let mastheadFont;
let backgroundColor;
let highlightColor;
let darkColor;
let padding; // divide screen into 24 columns
let mastheadSize;
let dialP;
let dialN;

// animation elements
let currentAngle = 0; //(top)
let targetAngle = 0; // starter target angle (top)
let easing = 0.05; // animation easing 
let lastSwitchTime = 0;
let holdDuration = 2000; // hold on jitter

let savedTime; 
let totalTimer = 60; // 30 seconds per headline

function preload() {
  wordData = loadJSON("wordData.json");  // load JSON data 
  newsData = loadJSON("newsData.json"); // load sample news data for testing without API key
  mastheadFont = loadFont("assets/engravers-old-english-bt.ttf"); // preload font 
}

// console.log(p5.WebSerial);


function setup() {
  createCanvas(windowWidth, 1500); // 50 headlines at 24px each, plus padding (ability to scroll to see all)
  angleMode(DEGREES); 
  
  // ARDUINO 
  serial = new p5.SerialPort();
  //serial.list();
  //serial.open('/dev/tty.usbmodem1101');
  // serial.on("data", gotSerialData);
  serial.on('list', gotList);
  serial.on('open', gotOpen);
  serial.on('connected', serverConnected);
  serial.on('data', gotData);
  serial.on('error', gotError);
  serial.on('close', gotClose);

  serial.list(); // <-- only list first, open later


  // design global settings  
  backgroundColor = color("#0B0E1E"); 
  highlightColor = color("#007BFF");
  darkColor = color("#003772");
  fill(highlightColor);
  noStroke();
  background(backgroundColor);
  padding = width / 24;
  mastheadSize = width * 0.08;
  textAlign(CENTER);
  fontSize = 16;

  // JSON data inside 'moral-words' 
  mWords = wordData.moralWords.map((c) => c.word);
  categories = wordData.moralWords.map((c) => c.category);
  scores = wordData.moralWords.map((c) => c.score);
  currentHeadline = newsData.headlines[0]; // load first headline from sample data

  // load sample headlines from newsData.json for testing without API key
  headlines = newsData.headlines;
  analyseData(); // analyse sample data 

  // The Guardian API loads here ---  
  // loadJSON(API_URL, (data) => {
  //   // API structure is data -> response -> results
  //   headlines = data.response.results.map(item => item.webTitle);
  //   analyseData(); // analyse 
  // });
  
  headerDesign(); // header elements, masthead, date and time 
  mode = "loading"; // starter screen 

  // --------------BUTTONS -------------------
  // START BUTTON 
  btnStart = createButton("START");
  btnStart.position(padding, mastheadSize * 6); // near bottom 
  btnStart.mousePressed(() => {
    mode = "single"; // go to 'draw single headline' page 
  });
  //  SINGLE HEADLINE BUTTON
  btnSingle = createButton("SOLO HEADLINE");
  btnSingle.position(width / 2, mastheadSize * 2);
  btnSingle.mousePressed(() => {
    mode = "single"; // to go single headline page 
  });

  // SHOW ALL BUTTON
  btnAll = createButton("ALL HEADLINES");
  btnAll.position(width / 2, mastheadSize * 2);
  btnAll.mousePressed(() => {
  mode = "all";
  });


  fltrNeg = createButton("/ ANALYSE");
  fltrNeg.position(padding, mastheadSize * 2);
  fltrNeg.mousePressed(() => {
    analyseFilter = !analyseFilter; // switch the false to true on click
    if (!analyseFilter) {
      background(255);
    } else {
      background(backgroundColor);
    }
  });

  // COMPASS PUSH POINTS 
  for (let i = 0; i < CATEGORIES_Titles.length; i++) {
    chosenPoints.push({
      catHeading: CATEGORIES_Titles[i],
      shortCatHeading: shortCats[i],
      angle: (360 / CATEGORIES_Titles.length) * i, // 360 / 12 = 30° 
    });
  }
 
  targetAngle = random(chosenPoints).angle;  // Set initial target for compass (random)

  let savedTime = millis();

} 

// --------START TO ANALYSE DATA 
let foundPosWords = [];
let foundNegWords = [];
let foundCategories = [];


// function gotSerialData() {
//   let data = serial.readLine(); // reads until \n
//   if (!data) return;

//   console.log("From Arduino:", data); // should print TOGGLE_MODE / TOGGLE_ANALYSE
// }
function serverConnected() {
 print("Connected to Server");
}

function gotList(ports) {
 print("List of Serial Ports:");
  console.log("Available ports:", ports);
  serial.open('/dev/tty.usbmodem1101'); // replace with correct one from the list
}



function gotOpen() {
 print("Serial Port is Open");
}

function gotClose(){
 print("Serial Port is Closed");
 latestData = "Serial Port is Closed";
}

function gotError(theerror) {
 print(theerror);
}

function gotData() {
  let currentString = serial.readLine();
  if (!currentString) return;

  currentString = currentString.trim();
  console.log("From Arduino:", currentString);
  latestData = currentString;

  // Toggle variables based on Arduino input
  if (currentString === "TOGGLE_ANALYSE") {
    analyseFilter = !analyseFilter; // now your page will react
  }
  if (currentString === "TOGGLE_MODE") {
    mode = mode === "single" ? "all" : "single";
  }
  if (currentString === "REQUEST_CATEGORY") {
    // _category should be the current moral compass category
    // fallback if nothing selected
    //let categoryIndex = CATEGORIES_Titles.indexOf(_category);
    if (categoryIndex === -1) categoryIndex = 0; // default to 0 if none
    serial.write(categoryIndex + "\n");  // send 0-11 to Arduino
    console.log("Sent category index:", categoryIndex);
  }
}

function analyseData() {
  foundNegWords = [];
  foundPosWords = [];
  foundCategories = [];

  headlines.forEach((headline) => {
    // reference: google Gemini for JSON debugging  
    let wordsInHeadline = headline.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'’“”""]/g, "").split(" ");

    wordsInHeadline.forEach((hWord) => {
      let wordIndex = mWords.indexOf(hWord); 

      if (wordIndex !== -1) {  
        let wordScore = scores[wordIndex]; // load scores from JSON
        let allCategories = categories[wordIndex]; // load categories from JSON

        if (wordScore >= 6) { // only work with the negative words
          foundNegWords.push(hWord);
          foundCategories.push(allCategories); 
        } else {
          foundPosWords.push(hWord); // push positive words if i want later on
          foundCategories.push(allCategories);
        }
      } else {
        // if there are no headlines available -- first failsafe 
        text(
          "External issue: \nno headlines available.",
          mastheadSize * 3,
          padding, 
        );
      }
    });
  });
  //console.log("Analysis Complete. Found:", foundPosWords);
  //console.log("categories found:", foundCategories);
}



function draw() {
  // website design changes if we're in analyse mode or normal mode 
  btnStart.class("ps-button-classic");
  if (!analyseFilter) {
    background(255);
    btnAll.class("p5-button-classic");
    btnSingle.class("p5-button-classic");
    fltrNeg.class("p5-button-classic");
    // loadNewHeadline.class("p5-button-classic");

  } else {
    background(backgroundColor);
    btnAll.class("p5-button");
    btnSingle.class("p5-button");
    fltrNeg.class("p5-button");
    // loadNewHeadline.class("p5-button");
  }

  // reference: gemini
  //  the partiles are always at the bottom, and removes invisible circles so it doesn't lag 
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    
  // Remove dead particles so the list doesn't grow forever
  if (particles[i].alpha <= 0) {
    particles.splice(i, 1);
    }
  }

  headerDesign();
  textAlign(LEFT);
  fill(highlightColor);
  
  textFont("Geist Mono"); // load mono font from google link in index.html 

    // Switch based on mode
    if (mode === "loading") { // on start 
      textSize(fontSize);
      loadingScreen(); // run loading function 
    } else if (mode === "single") {
      loadSingle(); // load single viewer
      serial.write("MODE:SINGLE\n");

    } else if (mode === "all") {
      loadAll(); // load all viewer 
      serial.write("MODE:ALL\n");

    }
}


function keyPressed() {
  if (key === "A" || key === "a") {
    analyseFilter = !analyseFilter; // toggle analyse mode with 'A' key
  }
  if (key === "L" || key === "l") {
    mode = "all"; // toggle all headlines with 'L' key
  } else if (key === "K" || key === "k") {
    mode = "single"; // toggle single headline with 'S' key
  }
}

function loadingScreen() {
  background(255);

  // show and hide relevent buttons 
  btnStart.show();
  btnSingle.hide();
  btnAll.hide();
  fltrNeg.hide();

  // starter text 
  fill(0);
  text('welcome to The Despondent Times, a global moral compass based on world news. \nClick "show all" to see all headlines or "single" to view solo headlines. \nToggle "analyse" to assess the worlds morality based on the moral foundatios theory.', padding, mastheadSize * 4, width - padding * 8);
}

// this returns todays date so users know the headlines are correct and up to date
function headerDesign() {
  let now = new Date(); 
  let dayIDx = now.getDay(); 
  let d = day();
  let m = month();
  let h = hour();
  let min = minute();

  let daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let dayName = daysOfWeek[dayIDx];

  let monthsOfYear = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let monthName = monthsOfYear[month() - 1];
  // colours changing depending on the mode... 
  if (!analyseFilter) {
    fill(0);
    stroke(0);
  } else {
    fill(highlightColor);
    stroke(highlightColor);
  }
  textSize(fontSize * 0.8);
  noStroke();
  textAlign(LEFT);
  // if the time is 15:09, don't print 15:9 -- add a 0
  if (min <= 9) {
    text(`last loaded: ${h}:0${min}`, padding, mastheadSize * 0.3);
  } else {
    text(`last loaded: ${h}:${min}`, padding, 40);
  }
  textAlign(RIGHT);
  text(
    dayName + ` ${d}` + " " + monthName,
    width - padding,
    mastheadSize * 0.3
  );
  
  if (frameCount % 300 === 0) { // every 5 seconds new headline on SINGLE mode 
    currentIndex++;
    if (currentIndex >= headlines.length) {
      currentIndex = 0; // loop back to start
    }
  }

  // MASTHEAD LOGO - responsive 
  textAlign(CENTER);
  textSize(mastheadSize);
  noStroke();
  textFont(mastheadFont);
  text("The Despondent Times", width / 2, mastheadSize * 1.4);
}