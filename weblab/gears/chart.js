// Chart helper -- students do not need to edit this file.
// Draws a simple line chart on a <canvas> with no outside libraries.
// null values leave a gap in the line instead of dropping to zero.

function drawLineChart(canvas, xs, ys, options) {
  const styles = getComputedStyle(document.documentElement);
  const inkColor = styles.getPropertyValue("--ink-muted").trim();
  const gridColor = styles.getPropertyValue("--grid").trim();
  const lineColor = styles.getPropertyValue(options.colorVar).trim();
  const fontFamily = styles.getPropertyValue("--mono").trim() || "monospace";

  // Match the canvas resolution to the screen so lines stay sharp
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  canvas.width = cssWidth * ratio;
  canvas.height = cssHeight * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const pad = { left: 52, right: 14, top: 14, bottom: 34 };
  const plotW = cssWidth - pad.left - pad.right;
  const plotH = cssHeight - pad.top - pad.bottom;

  const realYs = ys.filter((y) => y !== null);
  if (xs.length === 0 || realYs.length === 0) {
    ctx.fillStyle = inkColor;
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.fillText(options.emptyMessage, cssWidth / 2, cssHeight / 2);
    return;
  }

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  let yMin = Math.min(0, ...realYs);
  let yMax = Math.max(...realYs);
  if (yMax === yMin) {
    yMax = yMin + 1;
  }

  const toX = (x) => pad.left + ((x - xMin) / (xMax - xMin || 1)) * plotW;
  const toY = (y) => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  // Grid lines and y-axis labels
  ctx.font = `12px ${fontFamily}`;
  ctx.lineWidth = 1;
  const yTicks = 4;
  for (let t = 0; t <= yTicks; t++) {
    const value = yMin + ((yMax - yMin) * t) / yTicks;
    const y = toY(value);
    ctx.strokeStyle = gridColor;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + plotW, y);
    ctx.stroke();
    ctx.fillStyle = inkColor;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(formatTick(value), pad.left - 6, y);
  }

  // X-axis labels
  const xTicks = 6;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let t = 0; t <= xTicks; t++) {
    const value = xMin + ((xMax - xMin) * t) / xTicks;
    ctx.fillText(formatTick(value), toX(value), pad.top + plotH + 6);
  }
  ctx.fillText(options.xLabel, pad.left + plotW / 2, pad.top + plotH + 20);

  // The data line, broken wherever a value is null
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  let penDown = false;
  for (let i = 0; i < xs.length; i++) {
    if (ys[i] === null) {
      penDown = false;
      continue;
    }
    if (penDown) {
      ctx.lineTo(toX(xs[i]), toY(ys[i]));
    } else {
      ctx.moveTo(toX(xs[i]), toY(ys[i]));
      penDown = true;
    }
  }
  ctx.stroke();

  // Optional vertical marker, e.g. the steady-state start time
  if (options.markerX !== undefined && options.markerX >= xMin && options.markerX <= xMax) {
    ctx.strokeStyle = inkColor;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(toX(options.markerX), pad.top);
    ctx.lineTo(toX(options.markerX), pad.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function formatTick(value) {
  if (Math.abs(value) < 0.05) {
    return "0";
  }
  if (Math.abs(value) >= 10) {
    return String(Math.round(value));
  }
  return value.toFixed(1);
}
