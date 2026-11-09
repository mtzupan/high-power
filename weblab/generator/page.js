// Page helper -- students do not need to edit this file.
// Reads the lists that script.js built and shows the results.

function setStep(id, done, message) {
  const card = document.getElementById(id);
  card.classList.toggle("done", done);
  card.querySelector(".status").textContent = done ? "Done" : "Not yet";
  card.querySelector(".result").textContent = message;
}

function round(value, places) {
  return Number(value.toFixed(places));
}

function renderTable() {
  const body = document.getElementById("table-body");
  body.innerHTML = "";
  for (let i = 0; i < timeVals.length; i++) {
    const row = document.createElement("tr");
    const cells = [timeVals[i], ampVals[i], voltVals[i], hertzVals[i], powerVals[i]];
    for (const value of cells) {
      const cell = document.createElement("td");
      cell.textContent = value === null || value === undefined ? "--" : value;
      row.appendChild(cell);
    }
    body.appendChild(row);
  }
}

function renderCharts() {
  drawLineChart(document.getElementById("chart-current"), timeVals, ampVals, {
    xLabel: "time (s)",
    colorVar: "--series-1",
    emptyMessage: "Finish Step 1 to see current",
    markerX: steadyStartTime,
  });
  drawLineChart(document.getElementById("chart-hz"), timeVals, hertzVals, {
    xLabel: "time (s)",
    colorVar: "--series-2",
    emptyMessage: "Finish Step 1 to see rotation speed",
  });
  drawLineChart(document.getElementById("chart-power"), timeVals, powerVals, {
    xLabel: "time (s)",
    colorVar: "--series-3",
    emptyMessage: "Finish Step 2 to see power",
  });
}

function render() {
  if (typeof averageCurrent === "undefined") {
    document.getElementById("error").hidden = false;
    return;
  }

  setStep(
    "step-1",
    timeVals.length > 0,
    timeVals.length > 0
      ? `Loaded ${timeVals.length} of ${readings.length} readings into the lists.`
      : `The lists are empty. There are ${readings.length} readings waiting in data.js.`
  );

  const allVoltsZero = voltVals.length > 0 && voltVals.every((v) => v === 0 || v === null);
  let powerMessage = `Calculated ${powerVals.length} power values.`;
  if (powerVals.length > 0 && allVoltsZero) {
    powerMessage += " Every voltage in this dataset is 0 (the meter was measuring current), so power is 0 too.";
  }
  setStep(
    "step-2",
    powerVals.length > 0,
    powerVals.length > 0 ? powerMessage : "powerVals is empty."
  );

  const started = startIndex > 0 && startIndex < hertzVals.length;
  setStep(
    "step-3",
    started,
    started
      ? `The turbine started spinning at ${timeVals[startIndex]} s (reading #${startIndex}).`
      : "startIndex is still 0."
  );

  setStep(
    "step-4",
    averageCurrent !== null,
    averageCurrent !== null
      ? `Average current after ${steadyStartTime} s: ${round(averageCurrent, 2)} mA (from ${count} readings).`
      : "averageCurrent is null."
  );

  renderTable();
  renderCharts();
}

window.addEventListener("load", render);
window.addEventListener("resize", () => {
  if (typeof averageCurrent !== "undefined") {
    renderCharts();
  }
});
