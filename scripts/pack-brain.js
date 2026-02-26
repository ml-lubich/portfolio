#!/usr/bin/env node
/**
 * Reads complete-brain-wireframe.js, decimates edges to ~10%,
 * and writes a compact binary file: public/brain.bin
 *
 * Binary format:
 *   [4 bytes] uint32 vertexCount
 *   [4 bytes] uint32 edgeCount
 *   [vertexCount * 3 * 4 bytes] float32 positions (x,y,z per vertex, centered & normalized to [-1,1])
 *   [edgeCount * 2 * 4 bytes] uint32 edge pairs (v1, v2)
 */

const fs = require("fs");
const path = require("path");

const SRC = path.resolve(
    __dirname,
    "../../neural-brain-3d/complete-brain-wireframe.js"
);

console.log("Reading source:", SRC);
const src = fs.readFileSync(SRC, "utf-8");

// --- Parse vertices ---
const vertMatch = src.match(
    /COMPLETE_BRAIN_VERTICES\s*=\s*\[([\s\S]*?)\];\s*(?:\/\/|const)/
);
if (!vertMatch) throw new Error("Could not find COMPLETE_BRAIN_VERTICES");

const vertLines = vertMatch[1].trim().split("\n");
const verts = [];
for (const line of vertLines) {
    const m = line.match(/\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/);
    if (m) verts.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
}
console.log(`Parsed ${verts.length} vertices`);

// --- Parse edges ---
const edgeStart = src.indexOf("COMPLETE_BRAIN_EDGES");
const edgeBracket = src.indexOf("[", edgeStart);
// Read edge data in chunks to handle the massive array
const edgeLines = [];
let pos = edgeBracket + 1;
const edgeEndSearch = src.indexOf("];\n", edgeBracket);
const edgeBlock = src.slice(pos, edgeEndSearch);
const allEdges = [];
const edgeRe = /\[\s*(\d+)\s*,\s*(\d+)\s*\]/g;
let em;
while ((em = edgeRe.exec(edgeBlock)) !== null) {
    allEdges.push([parseInt(em[1]), parseInt(em[2])]);
}
console.log(`Parsed ${allEdges.length} edges`);

// --- Decimate: keep every Nth edge to get ~10% ---
const TARGET_FRACTION = 0.1;
const step = Math.max(1, Math.round(1 / TARGET_FRACTION));
const decimated = [];
for (let i = 0; i < allEdges.length; i += step) {
    decimated.push(allEdges[i]);
}
console.log(`Decimated to ${decimated.length} edges (step=${step})`);

// --- Find which vertices are actually used ---
const usedSet = new Set();
for (const [a, b] of decimated) {
    usedSet.add(a);
    usedSet.add(b);
}
const usedArr = Array.from(usedSet).sort((a, b) => a - b);
const oldToNew = new Map();
usedArr.forEach((old, idx) => oldToNew.set(old, idx));
console.log(`Used vertices: ${usedArr.length} (of ${verts.length})`);

// --- Center and normalize ---
let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;
let minZ = Infinity, maxZ = -Infinity;
for (const idx of usedArr) {
    const [x, y, z] = verts[idx];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
}
const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;
const cz = (minZ + maxZ) / 2;
const range = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
const scale = 2.0 / range; // normalize to [-1, 1]

// --- Write binary ---
const vertCount = usedArr.length;
const edgeCount = decimated.length;

const headerSize = 8; // 2 x uint32
const vertSize = vertCount * 3 * 4; // float32
const edgeSize = edgeCount * 2 * 4; // uint32
const buf = Buffer.alloc(headerSize + vertSize + edgeSize);

buf.writeUInt32LE(vertCount, 0);
buf.writeUInt32LE(edgeCount, 4);

let off = 8;
for (const idx of usedArr) {
    const [x, y, z] = verts[idx];
    buf.writeFloatLE((x - cx) * scale, off); off += 4;
    buf.writeFloatLE((y - cy) * scale, off); off += 4;
    buf.writeFloatLE((z - cz) * scale, off); off += 4;
}

for (const [a, b] of decimated) {
    buf.writeUInt32LE(oldToNew.get(a), off); off += 4;
    buf.writeUInt32LE(oldToNew.get(b), off); off += 4;
}

const outPath = path.resolve(__dirname, "../public/brain.bin");
fs.writeFileSync(outPath, buf);
console.log(`Written ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
