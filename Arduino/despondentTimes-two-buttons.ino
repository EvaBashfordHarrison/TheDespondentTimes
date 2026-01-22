#include <Stepper.h>

const int BTN_MODE = 2;
const int BTN_ANALYSE = 3;

// 28BYJ-48
const int STEPS_PER_REV = 2048;
const int STEPS_PER_CATEGORY = STEPS_PER_REV / 12;

Stepper myStepper(STEPS_PER_REV, 8, 10, 9, 11);

bool idleMode = true;
int currentStepPos = 0;

bool wildSpin = false;
int wildSpinSpeed = 20; // RPM (twice your normal 10)

bool lastModeState = HIGH;
bool lastAnalyseState = HIGH;

String incoming = "";

void setup() {
  pinMode(BTN_MODE, INPUT_PULLUP);
  pinMode(BTN_ANALYSE, INPUT_PULLUP);

  Serial.begin(9600);
  myStepper.setSpeed(10); // RPM
}

void loop() {
  // -------- BUTTONS --------
  bool modeState = digitalRead(BTN_MODE);
  bool analyseState = digitalRead(BTN_ANALYSE);

  if (modeState == LOW && lastModeState == HIGH) {
    Serial.println("TOGGLE_MODE");
    delay(50);
  }

  if (analyseState == LOW && lastAnalyseState == HIGH) {
    Serial.println("TOGGLE_ANALYSE");
    delay(50);
  }

  lastModeState = modeState;
  lastAnalyseState = analyseState;

  // -------- SERIAL READ --------
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      handleMessage(incoming);
      incoming = "";
    } else {
      incoming += c;
    }
  }

  // -------- MOTOR --------
  // if (idleMode) {
  //   myStepper.step(1);
  // }

  if (wildSpin) {
    myStepper.setSpeed(wildSpinSpeed);
    myStepper.step(2); // faster + continuous
  }
  
}

// ============================
// FUNCTIONS
// ============================

void handleMessage(String msg) {
  msg.trim();

  // ---------- MODE CONTROL ----------
  if (msg == "MODE:ALL") {
    wildSpin = true;
    idleMode = false;
    return;
  }

  if (msg == "MODE:SINGLE") {
    wildSpin = false;
    idleMode = false;
    return;
  }

  // ---------- CATEGORY ----------
  if (msg.startsWith("CAT:")) {
    int category = msg.substring(4).toInt();
    if (category >= 0 && category <= 11) {
      wildSpin = false;
      idleMode = false;
      moveToCategory(category);
    }
  }
}

void moveToCategory(int index) {
  int targetStepPos = index * STEPS_PER_CATEGORY;
  int stepsToMove = targetStepPos - currentStepPos;

  // shortest-path correction (optional but recommended)
  if (stepsToMove > STEPS_PER_REV / 2) {
    stepsToMove -= STEPS_PER_REV;
  }
  if (stepsToMove < -STEPS_PER_REV / 2) {
    stepsToMove += STEPS_PER_REV;
  }

  myStepper.step(stepsToMove);
  currentStepPos = targetStepPos;
}
