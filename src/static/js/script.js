// DOM elements
const canvas = document.getElementById("canvas");
const canvas2 = document.getElementById("canvas2");
const canvas3 = document.getElementById("canvas3");
const ctx = canvas.getContext("2d");
const ctx2 = canvas2.getContext("2d");
const ctx3 = canvas3.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx2.imageSmoothingEnabled = false;
ctx3.imageSmoothingEnabled = false;
const clearBtn = document.getElementById("clear-btn");
const predictBtn = document.getElementById("predict-btn");
const loadingSpinner = document.getElementById("loading-spinner");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");

// State
let isDrawing = false;
let drawingTimer = null;
let isPredicting = false;

// Preprocess digit canvas, normalize and downscale
function preprocess() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixelData = getPixelData(imageData);

  // Get factor to scale digit to 200x200
  const [x0, y0, x1, y1] = getBoundingRectangle(pixelData);
  const scale = 200 / Math.max(x1 - x0, y1 - y0);
  // Get translations to centre digit
  const [x, y] = getCentreOfMass(pixelData);
  const [dx, dy] = [canvas.width / 2 - x, canvas.height / 2 - y];

  // Scale and centre digit
  const transformedDigit = transformImage(canvas, scale, dx, dy);
  // Downscale digit to 28x28
  const downscaledDigit = scaleImage(transformedDigit, 28 / canvas.width);

  // Preview preprocessing
  drawImage(ctx2, canvas2, transformedDigit, canvas.width, canvas.height);
  drawImage(ctx3, canvas3, downscaledDigit, 28, 28);

  // Return pixel data of preprocessed digit
  const downscaledDigitCtx = downscaledDigit.getContext("2d");
  const downscaledDigitImageData = downscaledDigitCtx.getImageData(0, 0, downscaledDigit.width, downscaledDigit.height);
  const sample = getPixelData(downscaledDigitImageData);
  return sample;
}

// Send sample to server for classification
async function classify(sample) {
  const response = await fetch("/", {
    method: "POST",
    body: JSON.stringify({ sample }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status !== 200) throw new Error("Something went wrong, try again later");
  const { prediction } = await response.json();
  return prediction;
}

// Predict user drawn digit
async function predict() {
  if (isPredicting) return;
  isPredicting = true;
  setUI(null, null);
  const sample = preprocess(canvas);
  try {
    const prediction = await classify(sample);
    setUI(prediction, null);
  } catch (err) {
    setUI(null, err.message);
  }
  isPredicting = false;
}

function setUI(result, error) {
  if (!result && !error) {
    predictBtn.disabled = true;
    clearBtn.disabled = true;
    resultEl.innerText = "";
    errorEl.innerText = "";
    canvas.classList.remove("cursor-crosshair");
    loadingSpinner.classList.remove("hidden");
  } else {
    predictBtn.disabled = false;
    clearBtn.disabled = false;
    if (error) {
      errorEl.innerText = error;
    } else {
      resultEl.innerText = result;
    }
    canvas.classList.add("cursor-crosshair");
    loadingSpinner.classList.add("hidden");
  }
}

function resetUI() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
  resultEl.innerText = "";
}

function startDrawing(e) {
  if (isPredicting) return;
  if (drawingTimer) clearTimeout(drawingTimer);
  isDrawing = true;
  draw(e);
}

function endDrawing() {
  isDrawing = false;
  ctx.beginPath();
  drawingTimer = setTimeout(() => {
    predict();
  }, 500);
}

function draw(e) {
  if (!isDrawing) return;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  const bounds = canvas.getBoundingClientRect();
  let clientX, clientY;
  if (!e.touches) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }
  ctx.lineTo(clientX - bounds.left, clientY - bounds.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(clientX - bounds.left, clientY - bounds.top);
}

canvas.addEventListener("mousedown", (e) => startDrawing(e));
canvas.addEventListener("mouseup", () => endDrawing());
canvas.addEventListener("mousemove", (e) => draw(e));
canvas.addEventListener("touchstart", (e) => startDrawing(e));
canvas.addEventListener("touchend", () => endDrawing());
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  draw(e);
});
clearBtn.addEventListener("click", () => {
  if (isPredicting) return;
  resetUI();
});
predictBtn.addEventListener("click", () => predict());
