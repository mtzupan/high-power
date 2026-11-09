// ============================================================
// High Power: Turbine Data Lab
//
// Edit ONLY this file. Each step tells you which lines to
// uncomment (delete the // at the start of the line).
// After each step, run the project and look at the page.
//
// The turbine readings are in data.js, in a list called `readings`.
// Each reading looks like:
//   { time_s: 12, current_mA: 41.705, voltage_V: 0, Hz: 1.5, notes: "" }
// ============================================================


// ---------- Step 1: Build lists from the readings ----------
// The four empty lists below will hold one column of data each.
// Uncomment the four lines inside the for loop.

const timeVals = [];
const ampVals = [];
const voltVals = [];
const hertzVals = [];

for (let i = 0; i < readings.length; i++) {
  // timeVals.push(readings[i].time_s);
  // ampVals.push(readings[i].current_mA);
  // voltVals.push(readings[i].voltage_V);
  // hertzVals.push(readings[i].Hz);
}


// ---------- Step 2: Calculate power ----------
// Power (mW) = current (mA) x voltage (V).
// Some readings are null (the meter could not be read), so we
// skip the math for those. Uncomment the five lines in the loop.

const powerVals = [];

for (let i = 0; i < ampVals.length; i++) {
  // if (ampVals[i] === null || voltVals[i] === null) {
  //   powerVals.push(null);
  // } else {
  //   powerVals.push(ampVals[i] * voltVals[i]);
  // }
}


// ---------- Step 3: When did the turbine start spinning? ----------
// A while loop keeps going until its condition is false.
// This one walks forward through hertzVals while the turbine is
// still stopped (0 Hz). Uncomment all three lines together.
// Careful: without the middle line, startIndex never changes, the
// loop never ends, and the page freezes. If that happens, reload.

let startIndex = 0;

// while (startIndex < hertzVals.length && hertzVals[startIndex] === 0) {
//   startIndex = startIndex + 1;
// }


// ---------- Step 4: Average current at steady state ----------
// Look at the current chart. After the turbine spins up, the
// current levels off. Change steadyStartTime to the second where
// it levels off, then uncomment the four lines inside the loop.

const steadyStartTime = 16; // seconds

let total = 0;
let count = 0;

for (let i = 0; i < timeVals.length; i++) {
  // if (timeVals[i] >= steadyStartTime && ampVals[i] !== null) {
  //   total = total + ampVals[i];
  //   count = count + 1;
  // }
}

let averageCurrent = null;
if (count > 0) {
  averageCurrent = total / count;
}


// ---------- Ask the AI Tutor ----------
// Try copying one of these questions into the AI Tutor:
//   "What is the difference between a for loop and a while loop?"
//   "Why do we check for null before multiplying in Step 2?"
//   "What would happen in Step 3 if the turbine never started spinning?"
