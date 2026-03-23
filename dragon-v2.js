import * as THREE from "three";

// ══════════════════════════════════════════════════════════════
//  Mini Dragon v2 — Realistic
// ══════════════════════════════════════════════════════════════

// ── Procedural texture helpers ───────────────────────────────
function createScaleTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Base green
  ctx.fillStyle = "#2a6e2a";
  ctx.fillRect(0, 0, size, size);

  // Draw overlapping scales
  const scaleRows = 24;
  const scaleCols = 20;
  const sw = size / scaleCols;
  const sh = size / scaleRows;

  for (let row = 0; row < scaleRows + 1; row++) {
    for (let col = 0; col < scaleCols + 1; col++) {
      const offsetX = row % 2 === 0 ? 0 : sw * 0.5;
      const cx = col * sw + offsetX;
      const cy = row * sh;

      // Scale shape
      const grad = ctx.createRadialGradient(cx, cy - sh * 0.2, 0, cx, cy, sh * 0.6);
      grad.addColorStop(0, "#3a8a3a");
      grad.addColorStop(0.5, "#2d7a2d");
      grad.addColorStop(0.85, "#1f5f1f");
      grad.addColorStop(1, "#1a521a");

      ctx.beginPath();
      ctx.ellipse(cx, cy, sw * 0.48, sh * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Scale edge highlight
      ctx.beginPath();
      ctx.ellipse(cx, cy, sw * 0.48, sh * 0.55, 0, Math.PI * 1.1, Math.PI * 1.9);
      ctx.strokeStyle = "rgba(100, 180, 100, 0.3)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createScaleBumpMap(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  const scaleRows = 24;
  const scaleCols = 20;
  const sw = size / scaleCols;
  const sh = size / scaleRows;

  for (let row = 0; row < scaleRows + 1; row++) {
    for (let col = 0; col < scaleCols + 1; col++) {
      const offsetX = row % 2 === 0 ? 0 : sw * 0.5;
      const cx = col * sw + offsetX;
      const cy = row * sh;

      const grad = ctx.createRadialGradient(cx, cy - sh * 0.15, 0, cx, cy + sh * 0.1, sh * 0.55);
      grad.addColorStop(0, "#e0e0e0");
      grad.addColorStop(0.6, "#a0a0a0");
      grad.addColorStop(1, "#606060");

      ctx.beginPath();
      ctx.ellipse(cx, cy, sw * 0.46, sh * 0.52, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createBellyTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#7ab87a";
  ctx.fillRect(0, 0, size, size);

  // Horizontal belly ridges
  const ridges = 18;
  for (let i = 0; i < ridges; i++) {
    const y = (i / ridges) * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.strokeStyle = `rgba(90, 160, 90, ${0.4 + Math.sin(i * 0.7) * 0.15})`;
    ctx.lineWidth = size / ridges * 0.15;
    ctx.stroke();

    // Ridge highlight
    ctx.beginPath();
    ctx.moveTo(0, y + 2);
    ctx.lineTo(size, y + 2);
    ctx.strokeStyle = "rgba(140, 210, 140, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createWingMembraneTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Translucent green base
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#3ca03c");
  grad.addColorStop(0.5, "#2d8a2d");
  grad.addColorStop(1, "#208020");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Veins
  ctx.strokeStyle = "rgba(30, 80, 30, 0.5)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    const sx = size * 0.05;
    const sy = size * (0.1 + i * 0.1);
    ctx.moveTo(sx, sy);
    for (let j = 1; j <= 6; j++) {
      ctx.lineTo(
        sx + (size * 0.9 * j) / 6,
        sy + Math.sin(j * 1.2 + i) * 15 + (j * 8)
      );
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ── Scene setup ──────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1b2a);
scene.fog = new THREE.FogExp2(0x0d1b2a, 0.025);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

// ── Lights ───────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x303850, 1.8));

const keyLight = new THREE.DirectionalLight(0xfff0dd, 2.5);
keyLight.position.set(4, 8, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 30;
keyLight.shadow.camera.left = -5;
keyLight.shadow.camera.right = 5;
keyLight.shadow.camera.top = 5;
keyLight.shadow.camera.bottom = -5;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x88aacc, 0.8);
fillLight.position.set(-4, 3, -2);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0x6699ff, 1.5, 18);
rimLight.position.set(-3, 3, -5);
scene.add(rimLight);

const underLight = new THREE.PointLight(0x335566, 0.6, 10);
underLight.position.set(0, -1, 2);
scene.add(underLight);

// ── Generate textures ────────────────────────────────────────
const scaleTex = createScaleTexture();
const scaleBump = createScaleBumpMap();
const bellyTex = createBellyTexture();
const wingTex = createWingMembraneTexture();

// ── Materials ────────────────────────────────────────────────
const bodyMat = new THREE.MeshStandardMaterial({
  map: scaleTex,
  bumpMap: scaleBump,
  bumpScale: 0.35,
  color: 0x2e8b2e,
  roughness: 0.6,
  metalness: 0.15,
});

const bellyMat = new THREE.MeshStandardMaterial({
  map: bellyTex,
  color: 0x8ecf8e,
  roughness: 0.75,
  metalness: 0.05,
});

const darkGreenMat = new THREE.MeshStandardMaterial({
  map: scaleTex,
  bumpMap: scaleBump,
  bumpScale: 0.25,
  color: 0x1a5e1a,
  roughness: 0.55,
  metalness: 0.2,
});

const eyeWhiteMat = new THREE.MeshStandardMaterial({
  color: 0xccdd44,
  emissive: 0x99aa22,
  emissiveIntensity: 0.3,
  roughness: 0.2,
  metalness: 0.1,
});

const irisMat = new THREE.MeshStandardMaterial({
  color: 0xddcc00,
  emissive: 0xbbaa00,
  emissiveIntensity: 0.5,
  roughness: 0.15,
  metalness: 0.2,
});

const pupilMat = new THREE.MeshStandardMaterial({
  color: 0x050505,
  roughness: 0.9,
  metalness: 0.0,
});

const eyeGlossMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 1.0,
  roughness: 0.0,
  metalness: 0.0,
});

const wingMembraneMat = new THREE.MeshStandardMaterial({
  map: wingTex,
  color: 0x30a030,
  roughness: 0.5,
  metalness: 0.1,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.82,
});

const hornMat = new THREE.MeshStandardMaterial({
  color: 0xd4c5a9,
  roughness: 0.35,
  metalness: 0.4,
});

const clawMat = new THREE.MeshStandardMaterial({
  color: 0xc8b890,
  roughness: 0.3,
  metalness: 0.5,
});

const spineMat = new THREE.MeshStandardMaterial({
  color: 0x1a6e1a,
  roughness: 0.5,
  metalness: 0.2,
});

const nostrilMat = new THREE.MeshStandardMaterial({
  color: 0x0a2a0a,
  roughness: 0.9,
});

// ── Helpers ──────────────────────────────────────────────────
function deformSphere(geo, noiseFn) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.sqrt(x * x + y * y + z * z);
    const theta = Math.atan2(z, x);
    const phi = Math.acos(y / (r || 1));
    const d = noiseFn(theta, phi, r);
    pos.setXYZ(i, x + x / r * d, y + y / r * d, z + z / r * d);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

function simpleNoise(t1, t2) {
  return (Math.sin(t1 * 5.7 + t2 * 3.1) * 0.5 +
          Math.sin(t1 * 11.3 - t2 * 7.9) * 0.25 +
          Math.sin(t2 * 13.7 + t1 * 2.3) * 0.15) * 0.015;
}

// ══════════════════════════════════════════════════════════════
//  BUILD THE DRAGON
// ══════════════════════════════════════════════════════════════
const dragon = new THREE.Group();

// ── Body ─────────────────────────────────────────────────────
// Main torso: wide, low, slightly elongated — like a toad
const bodyGeo = new THREE.SphereGeometry(1, 48, 48);
// Flatten and widen
const bPos = bodyGeo.attributes.position;
for (let i = 0; i < bPos.count; i++) {
  let x = bPos.getX(i);
  let y = bPos.getY(i);
  let z = bPos.getZ(i);
  // Widen sides, flatten top/bottom, elongate front-back
  x *= 1.15;
  y *= 0.72;
  z *= 1.3;
  // Puff out the belly (lower hemisphere wider)
  if (y < 0) {
    const expand = 1 + (-y) * 0.25;
    x *= expand;
    z *= expand;
  }
  // Add organic undulation
  const d = simpleNoise(Math.atan2(z, x), Math.acos(y / (Math.sqrt(x*x+y*y+z*z) || 1)));
  const r = Math.sqrt(x*x + y*y + z*z) || 1;
  x += (x / r) * d;
  y += (y / r) * d;
  z += (z / r) * d;
  bPos.setXYZ(i, x, y, z);
}
bodyGeo.computeVertexNormals();
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true;
body.receiveShadow = true;
dragon.add(body);

// Belly plate
const bellyGeo = new THREE.SphereGeometry(0.78, 40, 40);
const bellyPos = bellyGeo.attributes.position;
for (let i = 0; i < bellyPos.count; i++) {
  let x = bellyPos.getX(i);
  let y = bellyPos.getY(i);
  let z = bellyPos.getZ(i);
  x *= 0.85;
  y *= 0.55;
  z *= 1.15;
  bellyPos.setXYZ(i, x, y, z);
}
bellyGeo.computeVertexNormals();
const belly = new THREE.Mesh(bellyGeo, bellyMat);
belly.position.set(0, -0.28, 0.08);
dragon.add(belly);

// ── Neck ─────────────────────────────────────────────────────
const neckGeo = new THREE.CylinderGeometry(0.35, 0.52, 0.65, 24, 8);
const nPos = neckGeo.attributes.position;
for (let i = 0; i < nPos.count; i++) {
  let x = nPos.getX(i);
  let y = nPos.getY(i);
  let z = nPos.getZ(i);
  // Taper toward top
  const t = (y + 0.325) / 0.65;
  const bulge = 1 + Math.sin(t * Math.PI) * 0.12;
  x *= bulge;
  z *= bulge * 1.1;
  nPos.setXYZ(i, x, y, z);
}
neckGeo.computeVertexNormals();
const neck = new THREE.Mesh(neckGeo, bodyMat);
neck.position.set(0, 0.3, 1.0);
neck.rotation.x = 0.55;
neck.castShadow = true;
dragon.add(neck);

// ── Head ─────────────────────────────────────────────────────
const headGroup = new THREE.Group();
headGroup.position.set(0, 0.68, 1.25);

// Cranium — big, round
const craniGeo = new THREE.SphereGeometry(0.62, 48, 48);
const cPos = craniGeo.attributes.position;
for (let i = 0; i < cPos.count; i++) {
  let x = cPos.getX(i);
  let y = cPos.getY(i);
  let z = cPos.getZ(i);
  x *= 1.05;
  y *= 0.9;
  z *= 1.0;
  // Flatten bottom of head
  if (y < -0.1) y *= 0.75;
  // Broaden cheeks
  if (y < 0.15 && y > -0.25) {
    x *= 1.1 + (0.15 - Math.abs(y)) * 0.3;
  }
  const d = simpleNoise(Math.atan2(z, x) * 2, y * 4) * 0.6;
  const r = Math.sqrt(x*x+y*y+z*z) || 1;
  x += (x/r) * d; y += (y/r) * d; z += (z/r) * d;
  cPos.setXYZ(i, x, y, z);
}
craniGeo.computeVertexNormals();
const cranium = new THREE.Mesh(craniGeo, bodyMat);
cranium.castShadow = true;
headGroup.add(cranium);

// Snout — wide, flat, like a bulldog
const snoutGeo = new THREE.SphereGeometry(0.38, 36, 36);
const sPos = snoutGeo.attributes.position;
for (let i = 0; i < sPos.count; i++) {
  let x = sPos.getX(i);
  let y = sPos.getY(i);
  let z = sPos.getZ(i);
  x *= 0.85;
  y *= 0.6;
  z *= 1.15;
  // Flatten the front
  if (z > 0.1) y *= 0.85;
  sPos.setXYZ(i, x, y, z);
}
snoutGeo.computeVertexNormals();
const snout = new THREE.Mesh(snoutGeo, bodyMat);
snout.position.set(0, -0.12, 0.48);
snout.castShadow = true;
headGroup.add(snout);

// Brow ridges
for (const side of [-1, 1]) {
  const browGeo = new THREE.SphereGeometry(0.18, 20, 20);
  browGeo.scale(1.3, 0.5, 0.8);
  const brow = new THREE.Mesh(browGeo, darkGreenMat);
  brow.position.set(side * 0.35, 0.22, 0.28);
  headGroup.add(brow);
}

// ── Eyes (large, expressive like in ref) ─────────────────────
for (const side of [-1, 1]) {
  const eyeGroup = new THREE.Group();
  eyeGroup.position.set(side * 0.38, 0.12, 0.32);
  eyeGroup.rotation.y = side * 0.3;

  // Eye white / outer sphere
  const eyeOuterGeo = new THREE.SphereGeometry(0.16, 24, 24);
  eyeOuterGeo.scale(1, 1, 0.7);
  const eyeOuter = new THREE.Mesh(eyeOuterGeo, eyeWhiteMat);
  eyeGroup.add(eyeOuter);

  // Iris
  const irisGeo = new THREE.SphereGeometry(0.12, 20, 20);
  irisGeo.scale(1, 1, 0.5);
  const iris = new THREE.Mesh(irisGeo, irisMat);
  iris.position.z = 0.06;
  eyeGroup.add(iris);

  // Pupil (vertical slit)
  const pupilGeo = new THREE.SphereGeometry(0.065, 16, 16);
  pupilGeo.scale(0.5, 1.1, 0.4);
  const pupil = new THREE.Mesh(pupilGeo, pupilMat);
  pupil.position.z = 0.1;
  eyeGroup.add(pupil);

  // Gloss highlight
  const glossGeo = new THREE.SphereGeometry(0.035, 10, 10);
  const gloss = new THREE.Mesh(glossGeo, eyeGlossMat);
  gloss.position.set(side * 0.04, 0.05, 0.11);
  eyeGroup.add(gloss);

  headGroup.add(eyeGroup);
}

// Nostrils
for (const side of [-1, 1]) {
  const nGeo = new THREE.SphereGeometry(0.05, 12, 12);
  nGeo.scale(1.2, 0.7, 1);
  const nostril = new THREE.Mesh(nGeo, nostrilMat);
  nostril.position.set(side * 0.14, -0.1, 0.8);
  headGroup.add(nostril);
}

// Mouth line (subtle)
const mouthGeo = new THREE.TorusGeometry(0.28, 0.015, 8, 24, Math.PI);
const mouthMat = new THREE.MeshStandardMaterial({ color: 0x0a2a0a, roughness: 0.9 });
const mouth = new THREE.Mesh(mouthGeo, mouthMat);
mouth.position.set(0, -0.2, 0.52);
mouth.rotation.x = -0.2;
mouth.rotation.z = Math.PI;
headGroup.add(mouth);

// ── Head horns / spikes (multiple small ones like ref) ───────
const headSpinePositions = [
  { x: -0.25, y: 0.45, z: -0.15, rx: -0.5, rz: -0.3, h: 0.28 },
  { x: 0.25, y: 0.45, z: -0.15, rx: -0.5, rz: 0.3, h: 0.28 },
  { x: -0.4, y: 0.32, z: -0.1, rx: -0.3, rz: -0.5, h: 0.22 },
  { x: 0.4, y: 0.32, z: -0.1, rx: -0.3, rz: 0.5, h: 0.22 },
  { x: -0.48, y: 0.18, z: -0.12, rx: -0.2, rz: -0.7, h: 0.18 },
  { x: 0.48, y: 0.18, z: -0.12, rx: -0.2, rz: 0.7, h: 0.18 },
  { x: 0, y: 0.52, z: -0.2, rx: -0.6, rz: 0, h: 0.2 },
];

for (const sp of headSpinePositions) {
  const hGeo = new THREE.ConeGeometry(0.04, sp.h, 8);
  const horn = new THREE.Mesh(hGeo, hornMat);
  horn.position.set(sp.x, sp.y, sp.z);
  horn.rotation.set(sp.rx, 0, sp.rz);
  horn.castShadow = true;
  headGroup.add(horn);
}

dragon.add(headGroup);

// ── Back spines (row down the back) ──────────────────────────
const spineCount = 14;
for (let i = 0; i < spineCount; i++) {
  const t = i / (spineCount - 1);
  // Path from upper back to tail base
  const z = THREE.MathUtils.lerp(0.7, -1.3, t);
  const y = 0.72 - t * 0.25 - Math.sin(t * Math.PI) * 0.05;
  const heightMult = 1 - Math.abs(t - 0.3) * 1.1;
  const h = THREE.MathUtils.clamp(0.12 + heightMult * 0.2, 0.08, 0.35);
  const r = 0.025 + heightMult * 0.02;

  const spGeo = new THREE.ConeGeometry(r, h, 6);
  const spine = new THREE.Mesh(spGeo, spineMat);
  spine.position.set(0, y, z);
  spine.rotation.x = THREE.MathUtils.lerp(-0.15, -0.35, t);
  spine.castShadow = true;
  dragon.add(spine);
}

// ── Tail ─────────────────────────────────────────────────────
const tailGroup = new THREE.Group();
const tailSegs = 12;
const tailPath = [];
let tx = 0, ty = -0.1, tz = -1.2;

for (let i = 0; i < tailSegs; i++) {
  const t = i / tailSegs;
  const radius = THREE.MathUtils.lerp(0.28, 0.05, t * t);
  const segGeo = new THREE.SphereGeometry(radius, 16, 16);

  // Make segments slightly elliptical
  const sP = segGeo.attributes.position;
  for (let j = 0; j < sP.count; j++) {
    let sx = sP.getX(j), sy = sP.getY(j), sz = sP.getZ(j);
    sx *= 1.0;
    sy *= 0.85;
    sz *= 1.2;
    sP.setXYZ(j, sx, sy, sz);
  }
  segGeo.computeVertexNormals();

  const seg = new THREE.Mesh(segGeo, bodyMat);
  seg.castShadow = true;

  tx += Math.sin(t * 3.0) * 0.12;
  ty -= t * 0.06;
  tz -= 0.32 + t * 0.08;

  seg.position.set(tx, ty, tz);
  tailPath.push(seg.position.clone());
  tailGroup.add(seg);

  // Tail spines
  if (i < tailSegs - 2 && i > 1) {
    const tsGeo = new THREE.ConeGeometry(0.02, 0.1 * (1 - t), 5);
    const tSpine = new THREE.Mesh(tsGeo, spineMat);
    tSpine.position.set(tx, ty + radius + 0.02, tz);
    tSpine.rotation.x = -0.3;
    tailGroup.add(tSpine);
  }
}

// Tail tip spike
const tipGeo = new THREE.ConeGeometry(0.06, 0.2, 6);
const tip = new THREE.Mesh(tipGeo, spineMat);
const lastTP = tailPath[tailPath.length - 1];
tip.position.set(lastTP.x, lastTP.y, lastTP.z - 0.12);
tip.rotation.x = -Math.PI * 0.45;
tailGroup.add(tip);

dragon.add(tailGroup);

// ── Wings ────────────────────────────────────────────────────
function createWing(side) {
  const wing = new THREE.Group();

  // Main arm bone
  const armGeo = new THREE.CylinderGeometry(0.06, 0.04, 1.8, 12);
  const arm = new THREE.Mesh(armGeo, darkGreenMat);
  arm.position.set(side * 0.9, 0.0, 0);
  arm.rotation.z = side * -1.0;
  arm.castShadow = true;
  wing.add(arm);

  // ── Membrane shape (large, bat-like) ───────────────────────
  const shape = new THREE.Shape();
  const s = side;
  shape.moveTo(0, 0);
  // Top edge sweeping up and out
  shape.bezierCurveTo(s * 0.4, 0.5, s * 1.2, 1.4, s * 2.0, 1.2);
  // Outer scalloped edge
  shape.bezierCurveTo(s * 2.3, 0.9, s * 2.4, 0.5, s * 2.2, 0.2);
  shape.bezierCurveTo(s * 2.3, -0.1, s * 2.1, -0.4, s * 1.9, -0.5);
  shape.bezierCurveTo(s * 1.7, -0.3, s * 1.5, -0.55, s * 1.3, -0.4);
  // Bottom edge back to body
  shape.bezierCurveTo(s * 0.9, -0.45, s * 0.4, -0.35, 0, -0.3);
  shape.lineTo(0, 0);

  const memGeo = new THREE.ShapeGeometry(shape, 24);
  const membrane = new THREE.Mesh(memGeo, wingMembraneMat);
  membrane.castShadow = true;
  wing.add(membrane);

  // Finger bones (3 main + 1 short thumb)
  const fingerData = [
    { angle: 0.45, len: 1.6 },
    { angle: 0.75, len: 1.9 },
    { angle: 1.05, len: 2.1 },
  ];
  for (const f of fingerData) {
    const a = s * f.angle;
    const fGeo = new THREE.CylinderGeometry(0.025, 0.015, f.len, 8);
    const finger = new THREE.Mesh(fGeo, darkGreenMat);
    finger.position.set(
      (s * Math.cos(a) * f.len) / 2,
      (Math.sin(a) * f.len) / 2,
      0.01
    );
    finger.rotation.z = Math.PI / 2 - a;
    finger.castShadow = true;
    wing.add(finger);
  }

  // Wing claw at the wrist
  const wcGeo = new THREE.ConeGeometry(0.035, 0.18, 6);
  const wClaw = new THREE.Mesh(wcGeo, clawMat);
  wClaw.position.set(s * 0.3, 0.55, 0.02);
  wClaw.rotation.z = s * -0.6;
  wing.add(wClaw);

  wing.position.set(0, 0.55, -0.05);
  return wing;
}

const leftWing = createWing(-1);
const rightWing = createWing(1);
dragon.add(leftWing, rightWing);

// ── Legs (chunky, splayed outward like ref) ──────────────────
function createLeg(x, z, isFront, splayAngle) {
  const leg = new THREE.Group();

  // Upper leg — thick
  const upGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.5, 16, 4);
  const upPos = upGeo.attributes.position;
  for (let i = 0; i < upPos.count; i++) {
    let lx = upPos.getX(i), ly = upPos.getY(i), lz = upPos.getZ(i);
    const bulge = 1 + Math.sin(((ly + 0.25) / 0.5) * Math.PI) * 0.15;
    lx *= bulge;
    lz *= bulge;
    upPos.setXYZ(i, lx, ly, lz);
  }
  upGeo.computeVertexNormals();
  const upper = new THREE.Mesh(upGeo, bodyMat);
  upper.castShadow = true;
  leg.add(upper);

  // Lower leg
  const loGeo = new THREE.CylinderGeometry(0.13, 0.1, 0.4, 14);
  const lower = new THREE.Mesh(loGeo, bodyMat);
  lower.position.y = -0.4;
  lower.castShadow = true;
  leg.add(lower);

  // Foot pad
  const footGeo = new THREE.SphereGeometry(0.14, 16, 16);
  footGeo.scale(1.4, 0.5, 1.6);
  const foot = new THREE.Mesh(footGeo, bodyMat);
  foot.position.set(0, -0.58, 0.06);
  foot.castShadow = true;
  leg.add(foot);

  // Toes (3 front + 1 back if rear leg)
  const toeCount = isFront ? 3 : 4;
  for (let t = 0; t < toeCount; t++) {
    const toeGeo = new THREE.SphereGeometry(0.045, 10, 10);
    toeGeo.scale(0.8, 0.5, 1.4);
    const toe = new THREE.Mesh(toeGeo, bodyMat);
    if (t < 3) {
      const spread = (t - 1) * 0.1;
      toe.position.set(spread, -0.6, 0.18);
    } else {
      toe.position.set(0, -0.6, -0.08);
    }
    leg.add(toe);

    // Claw on each toe
    const cGeo = new THREE.ConeGeometry(0.02, 0.1, 5);
    const claw = new THREE.Mesh(cGeo, clawMat);
    if (t < 3) {
      claw.position.set((t - 1) * 0.1, -0.62, 0.25);
      claw.rotation.x = 0.6;
    } else {
      claw.position.set(0, -0.62, -0.14);
      claw.rotation.x = -0.6;
    }
    leg.add(claw);
  }

  leg.position.set(x, -0.5, z);
  leg.rotation.x = isFront ? 0.2 : -0.2;
  leg.rotation.z = splayAngle;
  return leg;
}

const legFL = createLeg(-0.7, 0.7, true, 0.2);
const legFR = createLeg(0.7, 0.7, true, -0.2);
const legBL = createLeg(-0.65, -0.75, false, 0.15);
const legBR = createLeg(0.65, -0.75, false, -0.15);
dragon.add(legFL, legFR, legBL, legBR);

// ── Position dragon ──────────────────────────────────────────
dragon.position.y = 0.2;
scene.add(dragon);

// ── Ground ───────────────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(30, 30, 64, 64);
// Add slight undulation to ground
const gPos = groundGeo.attributes.position;
for (let i = 0; i < gPos.count; i++) {
  const x = gPos.getX(i);
  const y = gPos.getY(i);
  gPos.setZ(i, (Math.sin(x * 0.5) * Math.cos(y * 0.3) + Math.sin(x * 1.2 + y * 0.8) * 0.3) * 0.15);
}
groundGeo.computeVertexNormals();

const groundMat = new THREE.MeshStandardMaterial({
  color: 0x1e2a3a,
  roughness: 0.85,
  metalness: 0.15,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.1;
ground.receiveShadow = true;
scene.add(ground);

// ── Stars ────────────────────────────────────────────────────
const starCount = 300;
const starPositions = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);
for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI * 0.45; // upper hemisphere
  const r = 25 + Math.random() * 15;
  starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = r * Math.cos(phi) + 3;
  starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  starSizes[i] = Math.random() * 0.08 + 0.02;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.08,
  transparent: true,
  opacity: 0.85,
  sizeAttenuation: true,
});
scene.add(new THREE.Points(starGeo, starMat));

// ── Floating embers ──────────────────────────────────────────
const particleCount = 80;
const pPositions = new Float32Array(particleCount * 3);
const pVelocities = [];
for (let i = 0; i < particleCount; i++) {
  pPositions[i * 3] = (Math.random() - 0.5) * 12;
  pPositions[i * 3 + 1] = Math.random() * 6 - 1;
  pPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
  pVelocities.push(new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    Math.random() * 0.005 + 0.002,
    (Math.random() - 0.5) * 0.002
  ));
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
const pMat = new THREE.PointsMaterial({
  color: 0xffaa44,
  size: 0.04,
  transparent: true,
  opacity: 0.6,
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// ── Camera ───────────────────────────────────────────────────
let cameraAngle = 0.5;
const cameraRadius = 5.5;
const cameraHeight = 2.0;

// ── Animation ────────────────────────────────────────────────
const clock = new THREE.Clock();

let animId;
function animate() {
  if (window.__dragonStop) { cancelAnimationFrame(animId); return; }
  animId = requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Slow orbit
  cameraAngle += 0.002;
  camera.position.set(
    Math.cos(cameraAngle) * cameraRadius,
    cameraHeight + Math.sin(t * 0.25) * 0.25,
    Math.sin(cameraAngle) * cameraRadius
  );
  camera.lookAt(0, 0.3, 0);

  // Breathing
  const breathe = Math.sin(t * 1.2) * 0.02;
  body.scale.set(1 + breathe, 1 + breathe * 0.5, 1 + breathe);
  belly.scale.set(1 + breathe * 0.7, 1 + breathe * 0.4, 1 + breathe * 0.7);

  // Head bob
  headGroup.rotation.x = Math.sin(t * 0.9) * 0.04;
  headGroup.rotation.y = Math.sin(t * 0.6) * 0.06;
  headGroup.position.y = 0.68 + Math.sin(t * 1.2) * 0.015;

  // Wing flap (slower, more majestic)
  const flapBase = Math.sin(t * 1.6) * 0.2 + 0.1;
  leftWing.rotation.z = -flapBase;
  rightWing.rotation.z = flapBase;
  leftWing.rotation.x = Math.sin(t * 1.6 + 0.4) * 0.08;
  rightWing.rotation.x = Math.sin(t * 1.6 + 0.4) * 0.08;

  // Tail sway (wave propagation)
  tailGroup.children.forEach((seg, i) => {
    if (seg.isMesh) {
      const phase = t * 1.2 + i * 0.45;
      seg.position.x += Math.sin(phase) * 0.001;
    }
  });

  // Leg idle
  [legFL, legFR, legBL, legBR].forEach((leg, i) => {
    leg.rotation.x = (i < 2 ? 0.2 : -0.2) + Math.sin(t * 0.7 + i * 1.2) * 0.025;
  });

  // Ember particles
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] += pVelocities[i].x;
    positions[i * 3 + 1] += pVelocities[i].y;
    positions[i * 3 + 2] += pVelocities[i].z;
    if (positions[i * 3 + 1] > 7) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = -1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;

  // Star twinkle
  starMat.opacity = 0.7 + Math.sin(t * 0.5) * 0.15;

  renderer.render(scene, camera);
}

animate();

// ── Resize ───────────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
