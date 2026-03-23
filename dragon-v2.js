import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ══════════════════════════════════════════════════════════════
//  Mini Dragon v2 — Fairy Dragon (idle → run → takeoff → orbit)
// ══════════════════════════════════════════════════════════════

// ── Procedural scale texture ─────────────────────────────────
function createScaleTexture(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#3a9e3a";
  ctx.fillRect(0, 0, size, size);

  const rows = 22, cols = 18;
  const sw = size / cols, sh = size / rows;

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const ox = row % 2 === 0 ? 0 : sw * 0.5;
      const cx = col * sw + ox, cy = row * sh;

      const g = ctx.createRadialGradient(cx, cy - sh * 0.15, 0, cx, cy, sh * 0.55);
      g.addColorStop(0, "#4db84d");
      g.addColorStop(0.45, "#3a9e3a");
      g.addColorStop(0.8, "#2d852d");
      g.addColorStop(1, "#257025");

      ctx.beginPath();
      ctx.ellipse(cx, cy, sw * 0.47, sh * 0.53, 0, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx, cy, sw * 0.47, sh * 0.53, 0, Math.PI * 1.15, Math.PI * 1.85);
      ctx.strokeStyle = "rgba(120, 210, 120, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createScaleBump(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  const rows = 22, cols = 18;
  const sw = size / cols, sh = size / rows;

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const ox = row % 2 === 0 ? 0 : sw * 0.5;
      const cx = col * sw + ox, cy = row * sh;
      const g = ctx.createRadialGradient(cx, cy - sh * 0.12, 0, cx, cy + sh * 0.08, sh * 0.5);
      g.addColorStop(0, "#d8d8d8");
      g.addColorStop(0.5, "#a0a0a0");
      g.addColorStop(1, "#686868");
      ctx.beginPath();
      ctx.ellipse(cx, cy, sw * 0.45, sh * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createBellyTexture(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#8cd48c";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 16; i++) {
    const y = (i / 16) * size;
    ctx.strokeStyle = `rgba(100, 185, 100, ${0.35 + Math.sin(i * 0.8) * 0.1})`;
    ctx.lineWidth = size / 16 * 0.12;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke();
    ctx.strokeStyle = "rgba(160, 230, 160, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y + 2); ctx.lineTo(size, y + 2); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createWingTexture(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, "#45b845");
  g.addColorStop(0.5, "#38a038");
  g.addColorStop(1, "#2d8a2d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // Subtle veins
  ctx.strokeStyle = "rgba(30, 90, 30, 0.35)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    const sy = size * (0.12 + i * 0.11);
    ctx.moveTo(size * 0.05, sy);
    for (let j = 1; j <= 5; j++) {
      ctx.lineTo(size * 0.05 + (size * 0.88 * j) / 5, sy + Math.sin(j * 1.3 + i) * 12 + j * 6);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ── Scene ────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1e30);
scene.fog = new THREE.FogExp2(0x0f1e30, 0.02);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(3.5, 2.5, 4.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);

// ── OrbitControls ────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.3, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate = false;
controls.maxPolarAngle = Math.PI * 0.75;
controls.minPolarAngle = Math.PI * 0.05;
controls.minDistance = 2.0;
controls.maxDistance = 20;
controls.update();

// Stop auto-rotate on user interaction, resume after idle
let userInteractTimeout;
function onUserInteract() {
  controls.autoRotate = false;
  clearTimeout(userInteractTimeout);
  userInteractTimeout = setTimeout(() => { controls.autoRotate = true; }, 5000);
}
renderer.domElement.addEventListener("pointerdown", onUserInteract);
renderer.domElement.addEventListener("wheel", onUserInteract);
renderer.domElement.addEventListener("touchstart", onUserInteract, { passive: true });

// ── Lights (brighter, warmer) ────────────────────────────────
scene.add(new THREE.AmbientLight(0x556688, 2.5));

const key = new THREE.DirectionalLight(0xfffaf0, 3.0);
key.position.set(4, 8, 6);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 25;
key.shadow.camera.left = -5;
key.shadow.camera.right = 5;
key.shadow.camera.top = 5;
key.shadow.camera.bottom = -5;
key.shadow.bias = -0.0004;
scene.add(key);

const fill = new THREE.DirectionalLight(0x99bbdd, 1.2);
fill.position.set(-5, 3, -3);
scene.add(fill);

const rim = new THREE.PointLight(0x7799dd, 1.8, 18);
rim.position.set(-3, 4, -4);
scene.add(rim);

const under = new THREE.PointLight(0x446666, 0.8, 10);
under.position.set(0, -0.5, 3);
scene.add(under);

// ── Textures ─────────────────────────────────────────────────
const scaleTex = createScaleTexture();
const scaleBmp = createScaleBump();
const bellyTex = createBellyTexture();
const wingTex = createWingTexture();

// ── Materials (fairy dragon — iridescent purples, blues, pinks) ──
const bodyMat = new THREE.MeshStandardMaterial({
  map: scaleTex, bumpMap: scaleBmp, bumpScale: 0.3,
  color: 0x7744cc, roughness: 0.45, metalness: 0.2,
});
const bellyMat = new THREE.MeshStandardMaterial({
  map: bellyTex, color: 0xccaaee, roughness: 0.6, metalness: 0.1,
});
const darkMat = new THREE.MeshStandardMaterial({
  map: scaleTex, bumpMap: scaleBmp, bumpScale: 0.2,
  color: 0x5533aa, roughness: 0.45, metalness: 0.2,
});
const eyeOuterMat = new THREE.MeshStandardMaterial({
  color: 0x88ddff, emissive: 0x44aadd, emissiveIntensity: 0.55,
  roughness: 0.1, metalness: 0.15,
});
const irisMat = new THREE.MeshStandardMaterial({
  color: 0x66eeff, emissive: 0x44ccdd, emissiveIntensity: 0.65,
  roughness: 0.1, metalness: 0.15,
});
const pupilMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
const glossMat = new THREE.MeshStandardMaterial({
  color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0,
  roughness: 0.0, metalness: 0.0,
});
const wingMemMat = new THREE.MeshStandardMaterial({
  map: wingTex, color: 0xaa66ee, roughness: 0.3, metalness: 0.15,
  side: THREE.DoubleSide, transparent: true, opacity: 0.65,
  emissive: 0x6633aa, emissiveIntensity: 0.15,
});
const hornMat = new THREE.MeshStandardMaterial({ color: 0xddccff, roughness: 0.3, metalness: 0.4 });
const clawMat = new THREE.MeshStandardMaterial({ color: 0xccbbee, roughness: 0.3, metalness: 0.4 });
const spineMat = new THREE.MeshStandardMaterial({ color: 0x9966dd, roughness: 0.4, metalness: 0.2 });
const nostrilMat = new THREE.MeshStandardMaterial({ color: 0x2a1155, roughness: 0.9 });

// ── Helper ───────────────────────────────────────────────────
function noise2(a, b) {
  return (Math.sin(a * 5.7 + b * 3.1) * 0.5 + Math.sin(a * 11.3 - b * 7.9) * 0.25 + Math.sin(b * 13.7 + a * 2.3) * 0.15) * 0.012;
}

// ══════════════════════════════════════════════════════════════
const dragon = new THREE.Group();

// ── Body (round, plump) ──────────────────────────────────────
const bodyGeo = new THREE.SphereGeometry(1, 48, 48);
const bp = bodyGeo.attributes.position;
for (let i = 0; i < bp.count; i++) {
  let x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i);
  x *= 1.12; y *= 0.75; z *= 1.25;
  if (y < 0) { const e = 1 + (-y) * 0.2; x *= e; z *= e; }
  const d = noise2(Math.atan2(z, x), Math.acos(y / (Math.sqrt(x*x+y*y+z*z) || 1)));
  const r = Math.sqrt(x*x+y*y+z*z) || 1;
  x += x/r*d; y += y/r*d; z += z/r*d;
  bp.setXYZ(i, x, y, z);
}
bodyGeo.computeVertexNormals();
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true; body.receiveShadow = true;
dragon.add(body);

// Belly
const bellyGeo = new THREE.SphereGeometry(0.76, 40, 40);
const blp = bellyGeo.attributes.position;
for (let i = 0; i < blp.count; i++) {
  let x = blp.getX(i), y = blp.getY(i), z = blp.getZ(i);
  x *= 0.82; y *= 0.52; z *= 1.1;
  blp.setXYZ(i, x, y, z);
}
bellyGeo.computeVertexNormals();
const belly = new THREE.Mesh(bellyGeo, bellyMat);
belly.position.set(0, -0.26, 0.06);
dragon.add(belly);

// ── Neck ─────────────────────────────────────────────────────
const neckGeo = new THREE.CylinderGeometry(0.34, 0.48, 0.6, 24, 6);
const np = neckGeo.attributes.position;
for (let i = 0; i < np.count; i++) {
  let x = np.getX(i), y = np.getY(i), z = np.getZ(i);
  const t = (y + 0.3) / 0.6;
  const b = 1 + Math.sin(t * Math.PI) * 0.1;
  x *= b; z *= b * 1.08;
  np.setXYZ(i, x, y, z);
}
neckGeo.computeVertexNormals();
const neck = new THREE.Mesh(neckGeo, bodyMat);
neck.position.set(0, 0.28, 0.95);
neck.rotation.x = 0.5;
neck.castShadow = true;
dragon.add(neck);

// ── Head ─────────────────────────────────────────────────────
const headGroup = new THREE.Group();
headGroup.position.set(0, 0.65, 1.2);

// Cranium (big, round like ref)
const cranGeo = new THREE.SphereGeometry(0.6, 48, 48);
const cp = cranGeo.attributes.position;
for (let i = 0; i < cp.count; i++) {
  let x = cp.getX(i), y = cp.getY(i), z = cp.getZ(i);
  x *= 1.08; y *= 0.92; z *= 1.0;
  if (y < -0.08) y *= 0.78;
  if (y < 0.15 && y > -0.22) x *= 1.08 + (0.15 - Math.abs(y)) * 0.25;
  const d = noise2(Math.atan2(z, x) * 2, y * 4) * 0.5;
  const r = Math.sqrt(x*x+y*y+z*z) || 1;
  x += x/r*d; y += y/r*d; z += z/r*d;
  cp.setXYZ(i, x, y, z);
}
cranGeo.computeVertexNormals();
const cranium = new THREE.Mesh(cranGeo, bodyMat);
cranium.castShadow = true;
headGroup.add(cranium);

// Snout
const snoutGeo = new THREE.SphereGeometry(0.36, 36, 36);
const sp = snoutGeo.attributes.position;
for (let i = 0; i < sp.count; i++) {
  let x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i);
  x *= 0.88; y *= 0.58; z *= 1.12;
  if (z > 0.1) y *= 0.88;
  sp.setXYZ(i, x, y, z);
}
snoutGeo.computeVertexNormals();
const snout = new THREE.Mesh(snoutGeo, bodyMat);
snout.position.set(0, -0.12, 0.46);
snout.castShadow = true;
headGroup.add(snout);

// Brow ridges
for (const s of [-1, 1]) {
  const bg = new THREE.SphereGeometry(0.17, 20, 20);
  bg.scale(1.25, 0.5, 0.8);
  const brow = new THREE.Mesh(bg, darkMat);
  brow.position.set(s * 0.34, 0.22, 0.26);
  headGroup.add(brow);
}

// ── Eyes (big, prominent) ────────────────────────────────────
for (const s of [-1, 1]) {
  const eg = new THREE.Group();
  eg.position.set(s * 0.37, 0.12, 0.3);
  eg.rotation.y = s * 0.3;

  const outerG = new THREE.SphereGeometry(0.16, 24, 24);
  outerG.scale(1, 1, 0.65);
  eg.add(new THREE.Mesh(outerG, eyeOuterMat));

  const irisG = new THREE.SphereGeometry(0.12, 20, 20);
  irisG.scale(1, 1, 0.45);
  const iris = new THREE.Mesh(irisG, irisMat);
  iris.position.z = 0.055;
  eg.add(iris);

  const pupG = new THREE.SphereGeometry(0.06, 16, 16);
  pupG.scale(0.45, 1.05, 0.35);
  const pup = new THREE.Mesh(pupG, pupilMat);
  pup.position.z = 0.09;
  eg.add(pup);

  const glG = new THREE.SphereGeometry(0.032, 10, 10);
  const gls = new THREE.Mesh(glG, glossMat);
  gls.position.set(s * 0.04, 0.045, 0.1);
  eg.add(gls);

  headGroup.add(eg);
}

// Nostrils
for (const s of [-1, 1]) {
  const ng = new THREE.SphereGeometry(0.045, 12, 12);
  ng.scale(1.1, 0.65, 1);
  const nos = new THREE.Mesh(ng, nostrilMat);
  nos.position.set(s * 0.13, -0.1, 0.78);
  headGroup.add(nos);
}

// Mouth
const mouthGeo = new THREE.TorusGeometry(0.26, 0.012, 8, 24, Math.PI);
const mouth = new THREE.Mesh(mouthGeo, new THREE.MeshStandardMaterial({ color: 0x0e350e, roughness: 0.9 }));
mouth.position.set(0, -0.19, 0.5);
mouth.rotation.x = -0.15;
mouth.rotation.z = Math.PI;
headGroup.add(mouth);

// ── Head spines/horns ────────────────────────────────────────
const headSpines = [
  { x: -0.24, y: 0.44, z: -0.14, rx: -0.5, rz: -0.3, h: 0.26 },
  { x: 0.24, y: 0.44, z: -0.14, rx: -0.5, rz: 0.3, h: 0.26 },
  { x: -0.38, y: 0.31, z: -0.1, rx: -0.3, rz: -0.5, h: 0.2 },
  { x: 0.38, y: 0.31, z: -0.1, rx: -0.3, rz: 0.5, h: 0.2 },
  { x: -0.46, y: 0.17, z: -0.12, rx: -0.2, rz: -0.7, h: 0.16 },
  { x: 0.46, y: 0.17, z: -0.12, rx: -0.2, rz: 0.7, h: 0.16 },
  { x: 0, y: 0.5, z: -0.18, rx: -0.55, rz: 0, h: 0.18 },
];
for (const h of headSpines) {
  const hg = new THREE.ConeGeometry(0.038, h.h, 8);
  const horn = new THREE.Mesh(hg, hornMat);
  horn.position.set(h.x, h.y, h.z);
  horn.rotation.set(h.rx, 0, h.rz);
  horn.castShadow = true;
  headGroup.add(horn);
}

dragon.add(headGroup);

// ── Back spines ──────────────────────────────────────────────
for (let i = 0; i < 13; i++) {
  const t = i / 12;
  const z = THREE.MathUtils.lerp(0.65, -1.25, t);
  const y = 0.72 - t * 0.22 - Math.sin(t * Math.PI) * 0.04;
  const hm = 1 - Math.abs(t - 0.3) * 1.1;
  const h = THREE.MathUtils.clamp(0.1 + hm * 0.18, 0.06, 0.3);
  const sg = new THREE.ConeGeometry(0.022 + hm * 0.018, h, 6);
  const spine = new THREE.Mesh(sg, spineMat);
  spine.position.set(0, y, z);
  spine.rotation.x = THREE.MathUtils.lerp(-0.12, -0.32, t);
  spine.castShadow = true;
  dragon.add(spine);
}

// ── Tail ─────────────────────────────────────────────────────
const tailGroup = new THREE.Group();
const tailSegs = 11;
let tx = 0, ty = -0.08, tz = -1.15;
for (let i = 0; i < tailSegs; i++) {
  const t = i / tailSegs;
  const r = THREE.MathUtils.lerp(0.26, 0.04, t * t);
  const sg = new THREE.SphereGeometry(r, 16, 16);
  sg.scale(1, 0.88, 1.18);
  const seg = new THREE.Mesh(sg, bodyMat);
  seg.castShadow = true;
  tx += Math.sin(t * 2.8) * 0.1;
  ty -= t * 0.055;
  tz -= 0.3 + t * 0.07;
  seg.position.set(tx, ty, tz);
  tailGroup.add(seg);

  if (i > 1 && i < tailSegs - 2) {
    const tsg = new THREE.ConeGeometry(0.018, 0.09 * (1 - t), 5);
    const ts = new THREE.Mesh(tsg, spineMat);
    ts.position.set(tx, ty + r + 0.015, tz);
    ts.rotation.x = -0.25;
    tailGroup.add(ts);
  }
}
// Tail tip
const tipG = new THREE.ConeGeometry(0.05, 0.18, 6);
const tip = new THREE.Mesh(tipG, spineMat);
tip.position.set(tx, ty, tz - 0.1);
tip.rotation.x = -Math.PI * 0.42;
tailGroup.add(tip);
dragon.add(tailGroup);

// ── Wings (clean membrane, no exposed bones) ─────────────────
function createWing(side) {
  const wing = new THREE.Group();
  const s = side;

  // Large bat-like membrane shape
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(s * 0.3, 0.4, s * 0.9, 1.3, s * 1.8, 1.15);
  shape.bezierCurveTo(s * 2.1, 0.95, s * 2.25, 0.55, s * 2.15, 0.25);
  shape.bezierCurveTo(s * 2.2, 0.0, s * 2.05, -0.3, s * 1.85, -0.42);
  shape.bezierCurveTo(s * 1.65, -0.28, s * 1.45, -0.48, s * 1.2, -0.38);
  shape.bezierCurveTo(s * 0.85, -0.4, s * 0.4, -0.32, 0, -0.25);
  shape.lineTo(0, 0);

  const memGeo = new THREE.ShapeGeometry(shape, 28);
  const membrane = new THREE.Mesh(memGeo, wingMemMat);
  membrane.castShadow = true;
  wing.add(membrane);

  // Thin leading-edge bone (integrated, same color as wing)
  const edgeGeo = new THREE.CylinderGeometry(0.022, 0.012, 2.0, 8);
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x2d8a2d, roughness: 0.5, metalness: 0.1,
  });
  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.position.set(s * 0.95, 0.5, 0.005);
  edge.rotation.z = s * -1.05;
  wing.add(edge);

  // Subtle finger ridges (very thin, blending with membrane)
  const ridgeMat = new THREE.MeshStandardMaterial({
    color: 0x2f8f2f, roughness: 0.5, metalness: 0.08, transparent: true, opacity: 0.6,
  });
  const ridges = [
    { a: 0.5,  l: 1.5 },
    { a: 0.78, l: 1.8 },
    { a: 1.05, l: 1.95 },
  ];
  for (const r of ridges) {
    const a = s * r.a;
    const rg = new THREE.CylinderGeometry(0.008, 0.005, r.l, 6);
    const ridge = new THREE.Mesh(rg, ridgeMat);
    ridge.position.set((s * Math.cos(a) * r.l) / 2, (Math.sin(a) * r.l) / 2, 0.005);
    ridge.rotation.z = Math.PI / 2 - a;
    wing.add(ridge);
  }

  // Tiny wrist claw
  const wcg = new THREE.ConeGeometry(0.028, 0.14, 6);
  const wc = new THREE.Mesh(wcg, clawMat);
  wc.position.set(s * 0.25, 0.48, 0.01);
  wc.rotation.z = s * -0.55;
  wing.add(wc);

  wing.position.set(0, 0.52, -0.08);
  return wing;
}

const leftWing = createWing(-1);
const rightWing = createWing(1);
dragon.add(leftWing, rightWing);

// ── Legs ─────────────────────────────────────────────────────
function createLeg(x, z, isFront, splay) {
  const leg = new THREE.Group();

  const ug = new THREE.CylinderGeometry(0.17, 0.14, 0.48, 16, 4);
  const up = ug.attributes.position;
  for (let i = 0; i < up.count; i++) {
    let lx = up.getX(i), ly = up.getY(i), lz = up.getZ(i);
    const b = 1 + Math.sin(((ly + 0.24) / 0.48) * Math.PI) * 0.12;
    lx *= b; lz *= b;
    up.setXYZ(i, lx, ly, lz);
  }
  ug.computeVertexNormals();
  const upper = new THREE.Mesh(ug, bodyMat);
  upper.castShadow = true;
  leg.add(upper);

  const lg = new THREE.CylinderGeometry(0.12, 0.09, 0.38, 14);
  const lower = new THREE.Mesh(lg, bodyMat);
  lower.position.y = -0.38;
  lower.castShadow = true;
  leg.add(lower);

  const fg = new THREE.SphereGeometry(0.13, 16, 16);
  fg.scale(1.35, 0.5, 1.5);
  const foot = new THREE.Mesh(fg, bodyMat);
  foot.position.set(0, -0.55, 0.05);
  foot.castShadow = true;
  leg.add(foot);

  const toeCount = isFront ? 3 : 4;
  for (let t = 0; t < toeCount; t++) {
    const tg = new THREE.SphereGeometry(0.04, 10, 10);
    tg.scale(0.8, 0.5, 1.3);
    const toe = new THREE.Mesh(tg, bodyMat);
    if (t < 3) toe.position.set((t - 1) * 0.09, -0.57, 0.16);
    else toe.position.set(0, -0.57, -0.07);
    leg.add(toe);

    const cg = new THREE.ConeGeometry(0.018, 0.09, 5);
    const claw = new THREE.Mesh(cg, clawMat);
    if (t < 3) { claw.position.set((t - 1) * 0.09, -0.59, 0.23); claw.rotation.x = 0.55; }
    else { claw.position.set(0, -0.59, -0.13); claw.rotation.x = -0.55; }
    leg.add(claw);
  }

  leg.position.set(x, -0.48, z);
  leg.rotation.x = isFront ? 0.18 : -0.18;
  leg.rotation.z = splay;
  return leg;
}

const legFL = createLeg(-0.68, 0.68, true, 0.18);
const legFR = createLeg(0.68, 0.68, true, -0.18);
const legBL = createLeg(-0.62, -0.72, false, 0.14);
const legBR = createLeg(0.62, -0.72, false, -0.14);
dragon.add(legFL, legFR, legBL, legBR);

// ── Place dragon ─────────────────────────────────────────────
dragon.position.y = 0.2;
scene.add(dragon);

// ── Ground ───────────────────────────────────────────────────
const gGeo = new THREE.PlaneGeometry(30, 30, 48, 48);
const gp = gGeo.attributes.position;
for (let i = 0; i < gp.count; i++) {
  const x = gp.getX(i), y = gp.getY(i);
  gp.setZ(i, (Math.sin(x * 0.5) * Math.cos(y * 0.3) + Math.sin(x * 1.2 + y * 0.8) * 0.3) * 0.12);
}
gGeo.computeVertexNormals();
const grd = new THREE.Mesh(gGeo, new THREE.MeshStandardMaterial({ color: 0x1a1c3a, roughness: 0.85, metalness: 0.12 }));
grd.rotation.x = -Math.PI / 2;
grd.position.y = -1.05;
grd.receiveShadow = true;
scene.add(grd);

// ── Stars ────────────────────────────────────────────────────
const stC = 280;
const stP = new Float32Array(stC * 3);
for (let i = 0; i < stC; i++) {
  const th = Math.random() * Math.PI * 2;
  const ph = Math.random() * Math.PI * 0.4;
  const r = 22 + Math.random() * 16;
  stP[i*3] = r * Math.sin(ph) * Math.cos(th);
  stP[i*3+1] = r * Math.cos(ph) + 4;
  stP[i*3+2] = r * Math.sin(ph) * Math.sin(th);
}
const stGeo = new THREE.BufferGeometry();
stGeo.setAttribute("position", new THREE.BufferAttribute(stP, 3));
const stMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.8, sizeAttenuation: true });
scene.add(new THREE.Points(stGeo, stMat));

// ── Fairy Sparkles ───────────────────────────────────────────
const eC = 100;
const eP = new Float32Array(eC * 3);
const eV = [];
const eColors = new Float32Array(eC * 3);
for (let i = 0; i < eC; i++) {
  eP[i*3] = (Math.random()-0.5)*8;
  eP[i*3+1] = Math.random()*4-0.5;
  eP[i*3+2] = (Math.random()-0.5)*8;
  eV.push(new THREE.Vector3((Math.random()-0.5)*0.003, Math.random()*0.005+0.003, (Math.random()-0.5)*0.003));
  // Random pastel colors: pink, blue, purple, gold
  const palette = [[1,0.6,0.9],[0.6,0.8,1],[0.8,0.6,1],[1,0.9,0.5]];
  const pc = palette[Math.floor(Math.random()*palette.length)];
  eColors[i*3] = pc[0]; eColors[i*3+1] = pc[1]; eColors[i*3+2] = pc[2];
}
const eGeo = new THREE.BufferGeometry();
eGeo.setAttribute("position", new THREE.BufferAttribute(eP, 3));
eGeo.setAttribute("color", new THREE.BufferAttribute(eColors, 3));
const eMat = new THREE.PointsMaterial({ size: 0.045, transparent: true, opacity: 0.7, vertexColors: true });
const sparkles = new THREE.Points(eGeo, eMat);
scene.add(sparkles);

// ── Animation phases ─────────────────────────────────────────
// Phase 0: Idle (0–3s) — breathing, looking around
// Phase 1: Running (3–6s) — legs pumping, moving forward, wings start
// Phase 2: Takeoff (6–8s) — rising off ground, wings flapping hard
// Phase 3: Flight (8s+) — steady circular orbit

const clock = new THREE.Clock();
const IDLE_END = 3.0;
const RUN_END = 6.0;
const TAKEOFF_END = 8.0;
const ORBIT_RADIUS = 5.0;
const ORBIT_HEIGHT = 3.5;
const ORBIT_SPEED = 0.4;

// Store initial dragon position
const startPos = dragon.position.clone();
const startY = startPos.y;

let animId;
function animate() {
  if (window.__dragonStop) { cancelAnimationFrame(animId); return; }
  animId = requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Breathing (always active)
  const br = Math.sin(t * 1.2) * 0.018;
  body.scale.set(1 + br, 1 + br * 0.5, 1 + br);
  belly.scale.set(1 + br * 0.6, 1 + br * 0.35, 1 + br * 0.6);

  // ── Phase 0: Idle ──
  if (t < IDLE_END) {
    // Gentle head movement
    headGroup.rotation.x = Math.sin(t * 0.9) * 0.04;
    headGroup.rotation.y = Math.sin(t * 0.55) * 0.06;
    headGroup.position.y = 0.65 + Math.sin(t * 1.2) * 0.012;

    // Gentle wing fold
    const flap = Math.sin(t * 1.5) * 0.12 + 0.05;
    leftWing.rotation.z = -flap;
    rightWing.rotation.z = flap;

    // Tail sway
    tailGroup.children.forEach((seg, i) => {
      if (seg.isMesh) seg.position.x += Math.sin(t * 1.1 + i * 0.42) * 0.0008;
    });

    // Legs idle
    [legFL, legFR, legBL, legBR].forEach((l, i) => {
      l.rotation.x = (i < 2 ? 0.18 : -0.18) + Math.sin(t * 0.65 + i * 1.1) * 0.02;
    });
  }

  // ── Phase 1: Running ──
  else if (t < RUN_END) {
    const rt = t - IDLE_END;
    const runSpeed = 8.0;
    const stride = 0.35;

    // Legs running — alternating gait
    legFL.rotation.x = 0.18 + Math.sin(rt * runSpeed) * stride;
    legFR.rotation.x = 0.18 + Math.sin(rt * runSpeed + Math.PI) * stride;
    legBL.rotation.x = -0.18 + Math.sin(rt * runSpeed + Math.PI) * stride;
    legBR.rotation.x = -0.18 + Math.sin(rt * runSpeed) * stride;

    // Body bob while running
    dragon.position.y = startY + Math.abs(Math.sin(rt * runSpeed)) * 0.05;

    // Move forward (along +z)
    const runDist = rt * 0.8;
    dragon.position.z = startPos.z + runDist;

    // Head bobs
    headGroup.rotation.x = Math.sin(rt * runSpeed * 0.5) * 0.06;
    headGroup.position.y = 0.65 + Math.sin(rt * runSpeed) * 0.02;

    // Wings start flapping faster as running progresses
    const flapIntensity = 0.15 + rt / (RUN_END - IDLE_END) * 0.35;
    const flapSpeed = 3 + rt / (RUN_END - IDLE_END) * 5;
    const flap = Math.sin(rt * flapSpeed) * flapIntensity + 0.1;
    leftWing.rotation.z = -flap;
    rightWing.rotation.z = flap;

    // Tail streams behind
    tailGroup.children.forEach((seg, i) => {
      if (seg.isMesh) seg.position.x += Math.sin(rt * 2 + i * 0.5) * 0.001;
    });
  }

  // ── Phase 2: Takeoff ──
  else if (t < TAKEOFF_END) {
    const tt = t - RUN_END;
    const takeoffDuration = TAKEOFF_END - RUN_END;
    const progress = tt / takeoffDuration; // 0 → 1

    // Ease-in-out for smooth rise
    const eased = progress * progress * (3 - 2 * progress);

    // Position: rise up and start curving into orbit
    const runEndZ = startPos.z + (RUN_END - IDLE_END) * 0.8;
    const orbitAngleStart = Math.atan2(runEndZ, 0); // angle from center
    const targetAngle = orbitAngleStart + progress * 0.5;

    dragon.position.x = THREE.MathUtils.lerp(startPos.x, Math.sin(targetAngle) * ORBIT_RADIUS, eased);
    dragon.position.y = THREE.MathUtils.lerp(startY, startY + ORBIT_HEIGHT, eased);
    dragon.position.z = THREE.MathUtils.lerp(runEndZ, Math.cos(targetAngle) * ORBIT_RADIUS, eased);

    // Dragon faces flight direction
    dragon.rotation.y = THREE.MathUtils.lerp(0, targetAngle + Math.PI / 2, eased);

    // Wings flapping hard
    const flap = Math.sin(tt * 10) * 0.55 + 0.15;
    leftWing.rotation.z = -flap;
    rightWing.rotation.z = flap;
    leftWing.rotation.x = Math.sin(tt * 10 + 0.4) * 0.1;
    rightWing.rotation.x = Math.sin(tt * 10 + 0.4) * 0.1;

    // Legs tuck
    const tuck = eased * 0.4;
    legFL.rotation.x = 0.18 - tuck;
    legFR.rotation.x = 0.18 - tuck;
    legBL.rotation.x = -0.18 + tuck;
    legBR.rotation.x = -0.18 + tuck;

    // Head looks forward/up
    headGroup.rotation.x = -0.1 * eased;
    headGroup.position.y = 0.65;

    // Tail straight
    tailGroup.children.forEach((seg, i) => {
      if (seg.isMesh) seg.position.x *= 0.98;
    });
  }

  // ── Phase 3: Circular flight orbit ──
  else {
    const ft = t - TAKEOFF_END;
    const angle = ft * ORBIT_SPEED;

    // Circular path
    dragon.position.x = Math.sin(angle) * ORBIT_RADIUS;
    dragon.position.z = Math.cos(angle) * ORBIT_RADIUS;
    dragon.position.y = startY + ORBIT_HEIGHT + Math.sin(ft * 1.5) * 0.15; // gentle bob

    // Face tangent direction (perpendicular to radius)
    dragon.rotation.y = angle + Math.PI / 2;

    // Slight bank into turn
    dragon.rotation.z = Math.sin(ft * 0.8) * 0.05 + 0.08;

    // Steady wing flapping
    const flap = Math.sin(ft * 6) * 0.4 + 0.15;
    leftWing.rotation.z = -flap;
    rightWing.rotation.z = flap;
    leftWing.rotation.x = Math.sin(ft * 6 + 0.4) * 0.08;
    rightWing.rotation.x = Math.sin(ft * 6 + 0.4) * 0.08;

    // Legs tucked
    legFL.rotation.x = -0.1;
    legFR.rotation.x = -0.1;
    legBL.rotation.x = 0.1;
    legBR.rotation.x = 0.1;

    // Head looking forward
    headGroup.rotation.x = -0.06;
    headGroup.rotation.y = Math.sin(ft * 0.4) * 0.04;
    headGroup.position.y = 0.65;

    // Tail flows behind
    tailGroup.children.forEach((seg, i) => {
      if (seg.isMesh) seg.position.x = Math.sin(ft * 2 + i * 0.5) * 0.015 * (i + 1);
    });
  }

  // ── Camera follows dragon (update OrbitControls target) ──
  if (t > IDLE_END) {
    const smoothing = 0.05;
    controls.target.lerp(dragon.position, smoothing);
  }
  controls.update();

  // ── Sparkles follow dragon ──
  const ep = sparkles.geometry.attributes.position.array;
  for (let i = 0; i < eC; i++) {
    ep[i*3] += eV[i].x;
    ep[i*3+1] += eV[i].y;
    ep[i*3+2] += eV[i].z;
    if (ep[i*3+1] > 6 || Math.random() < 0.003) {
      // Respawn near dragon
      ep[i*3] = dragon.position.x + (Math.random()-0.5)*2;
      ep[i*3+1] = dragon.position.y + (Math.random()-0.5)*1.5;
      ep[i*3+2] = dragon.position.z + (Math.random()-0.5)*2;
    }
  }
  sparkles.geometry.attributes.position.needsUpdate = true;
  eMat.opacity = 0.5 + Math.sin(t * 2) * 0.2;

  stMat.opacity = 0.65 + Math.sin(t * 0.45) * 0.15;

  renderer.render(scene, camera);
}

animate();

// ── Resize ───────────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
