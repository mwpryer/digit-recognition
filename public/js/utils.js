// Convert canvas image data to array of pixel intensities in range 0-1
function getPixelData(imageData) {
  const rows = imageData.height;
  const cols = imageData.height;
  const pixels = [];
  for (let i = 0; i < rows; i++) {
    pixels.push([]);
    for (let j = 0; j < cols; j++) {
      // Get index for pixel block
      const blockIdx = (i * rows + j) * 4;

      const alpha = imageData.data[blockIdx + 3];
      if (alpha === 0) {
        // Transparent block, set to 0
        pixels[i][j] = 0;
      } else {
        const red = imageData.data[blockIdx];
        const green = imageData.data[blockIdx + 1];
        const blue = imageData.data[blockIdx + 2];
        // Average colour channels and normalize to range 0-1
        const mean = (red + green + blue) / 3;
        const intensity = (255 - mean) / 255;
        pixels[i][j] = intensity;
      }
    }
  }
  return pixels;
}

// Get estimate for centre of image from pixel intensities
function getCentreOfMass(pixelData) {
  const rows = pixelData.length;
  const cols = pixelData[0].length;
  // Get average weights of pixels
  let meanX = 0;
  let meanY = 0;
  let total = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const pixel = pixelData[i][j];
      meanX += j * pixel;
      meanY += i * pixel;
      total += pixel;
    }
  }
  meanX /= total;
  meanY /= total;
  return [meanX, meanY];
}

// Get bounding rectangle of image from pixel intensities
function getBoundingRectangle(pixelData) {
  const rows = pixelData.length;
  const cols = pixelData[0].length;
  let x0 = cols;
  let x1 = 0;
  let y0 = rows;
  let y1 = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (pixelData[i][j] > 0.01) {
        if (x0 > j) x0 = j;
        if (x1 < j) x1 = j;
        if (y0 > i) y0 = i;
        if (y1 < i) y1 = i;
      }
    }
  }
  return [x0, y0, x1, y1];
}

// Scale image by factor k and translate by x and y
function transformImage(canvas, k, x, y) {
  // Create offscreen canvas for transformations
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.height = canvas.height;
  offscreenCanvas.width = canvas.width;
  const offscreenCtx = offscreenCanvas.getContext("2d");

  // Scale image
  offscreenCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
  offscreenCtx.scale(k, k);
  offscreenCtx.translate(
    -offscreenCanvas.width / 2,
    -offscreenCanvas.height / 2
  );

  // Translate image
  offscreenCtx.translate(x, y);

  // Transfer image to transformed canvas and return it
  offscreenCtx.drawImage(canvas, 0, 0);
  return offscreenCanvas;
}

// Scale image by factor k
function scaleImage(canvas, k) {
  // Create offscreen canvas for transformations
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.height = 28;
  offscreenCanvas.width = 28;
  const offscreenCtx = offscreenCanvas.getContext("2d");

  // Scale image
  offscreenCtx.scale(k, k);

  // Transfer image to transformed canvas and return it
  offscreenCtx.drawImage(canvas, 0, 0);
  return offscreenCanvas;
}

// Put image into the DOM with defined width and height
function drawImage(ctx, canvas, image, width, height) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
}
