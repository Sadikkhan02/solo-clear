const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height) {
  // RGBA buffer with dark background (#0a0a0f) and cyan icon pattern (#4facfe)
  const rowSize = width * 4 + 1; // +1 for filter byte
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.35;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark bg: #0a0a0f
      let rVal = 10;
      let gVal = 10;
      let bVal = 15;
      let aVal = 255;

      // Cyan accent: #4facfe (79, 172, 254)
      // Draw outer circle ring
      if (Math.abs(dist - r) < width * 0.015) {
        rVal = 79;
        gVal = 172;
        bVal = 254;
        aVal = 120;
      }

      // Draw central dagger / diamond pattern
      const normX = Math.abs(dx) / (width * 0.12);
      const normYTop = (cy - y) / (height * 0.3);
      const normYBot = (y - cy) / (height * 0.3);

      if (y < cy && normX + normYTop < 1 && normYTop > -0.2) {
        rVal = 79;
        gVal = 172;
        bVal = 254;
        aVal = 240;
      } else if (y >= cy && Math.abs(dx * 1.5) < (height * 0.35 - (y - cy)) && (y - cy) < height * 0.32) {
        // Lower V guard
        if (Math.abs(dx * 1.8 - (y - cy)) < width * 0.03 || Math.abs(-dx * 1.8 - (y - cy)) < width * 0.03) {
          rVal = 79;
          gVal = 172;
          bVal = 254;
          aVal = 240;
        }
      }

      rawData[pixelOffset] = rVal;
      rawData[pixelOffset + 1] = gVal;
      rawData[pixelOffset + 2] = bVal;
      rawData[pixelOffset + 3] = aVal;
    }
  }

  // Compress with deflate
  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression: Deflate
  ihdrData[11] = 0; // Filter: Standard
  ihdrData[12] = 0; // Interlace: None
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.slice(4, 8 + len);
  const crcVal = crc32(typeAndData);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), createPNG(512, 512));
console.log('Successfully generated icon-192x192.png and icon-512x512.png');
