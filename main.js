import * as THREE from "three";

// ── Scene setup ──────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.035);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ── Lights ───────────────────────────────────────────────────
const ambient = new THREE.AmbientLight(0x404060, 1.2);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffeedd, 2.0);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

const pointLight = new THREE.PointLight(0xff6633, 1.5, 20);
pointLight.position.set(-3, 4, -2);
scene.add(pointLight);

const rimLight = new THREE.PointLight(0x4488ff, 1, 15);
rimLight.position.set(3, 2, -5);
scene.add(rimLight);

// ── Materials ────────────────────────────────────────────────
const bodyMat = new THREE.MeshStandardMaterial({
  color: 0x2e7d32,
  roughness: 0.55,
  metalness: 0.3,
});
const bellyMat = new THREE.MeshStandardMaterial({
  color: 0xa5d6a7,
  roughness: 0.7,
  metalness: 0.1,
});
const eyeMat = new THREE.MeshStandardMaterial({
  color: 0xffeb3b,
  emissive: 0xffeb3b,
  emissiveIntensity: 0.6,
});
const pupilMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
const wingMembraneMat = new THREE.MeshStandardMaterial({
  color: 0x388e3c,
  roughness: 0.6,
  metalness: 0.15,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.75,
});
const hornMat = new THREE.MeshStandardMaterial({
  color: 0x8d6e63,
  roughness: 0.4,
  metalness: 0.5,
});
const clawMat = new THREE.MeshStandardMaterial({
  color: 0x5d4037,
  roughness: 0.3,
  metalness: 0.6,
});

// ── Dragon group ─────────────────────────────────────────────
const dragon = new THREE.Group();

// ── Body ─────────────────────────────────────────────────────
const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
bodyGeo.scale(1, 0.85, 1.25);
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true;
dragon.add(body);

// Belly
const bellyGeo = new THREE.SphereGeometry(0.72, 32, 32);
bellyGeo.scale(0.8, 0.7, 1.1);
const belly = new THREE.Mesh(bellyGeo, bellyMat);
belly.position.set(0, -0.25, 0.05);
dragon.add(belly);

// ── Head ─────────────────────────────────────────────────────
const headGroup = new THREE.Group();
headGroup.position.set(0, 0.7, 1.15);

const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
headGeo.scale(0.9, 0.85, 1.1);
const head = new THREE.Mesh(headGeo, bodyMat);
head.castShadow = true;
headGroup.add(head);

// Snout
const snoutGeo = new THREE.SphereGeometry(0.3, 24, 24);
snoutGeo.scale(0.7, 0.55, 1.2);
const snout = new THREE.Mesh(snoutGeo, bodyMat);
snout.position.set(0, -0.1, 0.45);
headGroup.add(snout);

// Nostrils
for (const side of [-1, 1]) {
  const nostrilGeo = new THREE.SphereGeometry(0.04, 12, 12);
  const nostril = new THREE.Mesh(nostrilGeo, pupilMat);
  nostril.position.set(side * 0.12, -0.02, 0.75);
  headGroup.add(nostril);
}

// Eyes
for (const side of [-1, 1]) {
  const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.position.set(side * 0.32, 0.12, 0.28);
  headGroup.add(eye);

  const pupilGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const pupil = new THREE.Mesh(pupilGeo, pupilMat);
  pupil.position.set(side * 0.36, 0.12, 0.36);
  headGroup.add(pupil);
}

// Horns
for (const side of [-1, 1]) {
  const hornGeo = new THREE.ConeGeometry(0.08, 0.45, 8);
  const horn = new THREE.Mesh(hornGeo, hornMat);
  horn.position.set(side * 0.25, 0.4, -0.15);
  horn.rotation.x = -0.4;
  horn.rotation.z = side * 0.3;
  headGroup.add(horn);
}

// Ears / small horns
for (const side of [-1, 1]) {
  const earGeo = new THREE.ConeGeometry(0.06, 0.25, 6);
  const ear = new THREE.Mesh(earGeo, bodyMat);
  ear.position.set(side * 0.4, 0.25, 0.0);
  ear.rotation.z = side * 0.6;
  headGroup.add(ear);
}

dragon.add(headGroup);

// ── Neck ─────────────────────────────────────────────────────
const neckGeo = new THREE.CylinderGeometry(0.3, 0.45, 0.7, 16);
const neck = new THREE.Mesh(neckGeo, bodyMat);
neck.position.set(0, 0.35, 0.9);
neck.rotation.x = 0.5;
neck.castShadow = true;
dragon.add(neck);

// ── Tail ─────────────────────────────────────────────────────
const tailSegments = 8;
const tailGroup = new THREE.Group();
let prevPos = new THREE.Vector3(0, -0.15, -1.15);
for (let i = 0; i < tailSegments; i++) {
  const t = i / tailSegments;
  const radius = THREE.MathUtils.lerp(0.3, 0.06, t);
  const segGeo = new THREE.SphereGeometry(radius, 12, 12);
  segGeo.scale(1, 0.9, 1.3);
  const seg = new THREE.Mesh(segGeo, bodyMat);
  seg.castShadow = true;
  const offset = new THREE.Vector3(
    Math.sin(t * 2.5) * 0.3,
    -t * 0.5,
    -0.45
  );
  prevPos.add(offset);
  seg.position.copy(prevPos);
  tailGroup.add(seg);
}

// Tail spike
const spikeGeo = new THREE.ConeGeometry(0.08, 0.3, 6);
const spike = new THREE.Mesh(spikeGeo, hornMat);
spike.position.copy(prevPos);
spike.position.z -= 0.2;
spike.rotation.x = -Math.PI / 2;
tailGroup.add(spike);

dragon.add(tailGroup);

// ── Spines along back ────────────────────────────────────────
for (let i = 0; i < 7; i++) {
  const t = i / 6;
  const spineGeo = new THREE.ConeGeometry(
    0.04,
    THREE.MathUtils.lerp(0.25, 0.1, Math.abs(t - 0.3) * 2),
    6
  );
  const spine = new THREE.Mesh(spineGeo, hornMat);
  spine.position.set(0, 0.75 - t * 0.3, 0.8 - t * 1.8);
  spine.rotation.x = -0.2;
  dragon.add(spine);
}

// ── Wings ────────────────────────────────────────────────────
function createWing(side) {
  const wing = new THREE.Group();

  // Upper arm bone
  const boneGeo = new THREE.CylinderGeometry(0.05, 0.03, 1.4, 8);
  const bone = new THREE.Mesh(boneGeo, bodyMat);
  bone.position.set(side * 0.7, 0, 0);
  bone.rotation.z = side * -1.1;
  wing.add(bone);

  // Membrane – a custom shape using a flat extruded geometry
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(side * 1.6, 0.9);
  shape.quadraticCurveTo(side * 1.8, 0.2, side * 1.5, -0.4);
  shape.quadraticCurveTo(side * 0.9, -0.2, 0, -0.35);
  shape.lineTo(0, 0);

  const membraneGeo = new THREE.ShapeGeometry(shape, 16);
  const membrane = new THREE.Mesh(membraneGeo, wingMembraneMat);
  membrane.castShadow = true;
  wing.add(membrane);

  // Finger bones
  for (let i = 0; i < 3; i++) {
    const angle = side * (0.5 + i * 0.35);
    const len = 1.0 + i * 0.25;
    const fingerGeo = new THREE.CylinderGeometry(0.02, 0.015, len, 6);
    const finger = new THREE.Mesh(fingerGeo, bodyMat);
    finger.position.set(
      (side * Math.cos(angle) * len) / 2,
      (Math.sin(angle) * len) / 2,
      0
    );
    finger.rotation.z = Math.PI / 2 - angle;
    wing.add(finger);
  }

  // Wing claw
  const wClawGeo = new THREE.ConeGeometry(0.03, 0.15, 5);
  const wClaw = new THREE.Mesh(wClawGeo, clawMat);
  wClaw.position.set(side * 0.35, 0.65, 0);
  wClaw.rotation.z = side * -0.8;
  wing.add(wClaw);

  wing.position.set(0, 0.55, 0.0);
  return wing;
}

const leftWing = createWing(-1);
const rightWing = createWing(1);
dragon.add(leftWing, rightWing);

// ── Legs ─────────────────────────────────────────────────────
function createLeg(x, z, isFront) {
  const leg = new THREE.Group();

  // Upper leg
  const upperGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.55, 10);
  const upper = new THREE.Mesh(upperGeo, bodyMat);
  upper.castShadow = true;
  leg.add(upper);

  // Lower leg
  const lowerGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.45, 10);
  const lower = new THREE.Mesh(lowerGeo, bodyMat);
  lower.position.y = -0.45;
  lower.castShadow = true;
  leg.add(lower);

  // Foot
  const footGeo = new THREE.SphereGeometry(0.12, 12, 12);
  footGeo.scale(1.2, 0.6, 1.4);
  const foot = new THREE.Mesh(footGeo, bodyMat);
  foot.position.set(0, -0.65, 0.05);
  foot.castShadow = true;
  leg.add(foot);

  // Claws
  for (let c = -1; c <= 1; c++) {
    const cGeo = new THREE.ConeGeometry(0.025, 0.12, 5);
    const claw = new THREE.Mesh(cGeo, clawMat);
    claw.position.set(c * 0.06, -0.7, 0.14);
    claw.rotation.x = 0.5;
    leg.add(claw);
  }

  leg.position.set(x, -0.65, z);
  leg.rotation.x = isFront ? 0.15 : -0.15;
  return leg;
}

const legFL = createLeg(-0.55, 0.65, true);
const legFR = createLeg(0.55, 0.65, true);
const legBL = createLeg(-0.5, -0.7, false);
const legBR = createLeg(0.5, -0.7, false);
dragon.add(legFL, legFR, legBL, legBR);

// ── Add dragon to scene ──────────────────────────────────────
dragon.position.y = 0.3;
scene.add(dragon);

// ── Ground ───────────────────────────────────────────────────
const groundGeo = new THREE.CircleGeometry(12, 64);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x2c2c3a,
  roughness: 0.9,
  metalness: 0.1,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.05;
ground.receiveShadow = true;
scene.add(ground);

// ── Particles (floating embers) ──────────────────────────────
const particleCount = 120;
const pPositions = new Float32Array(particleCount * 3);
const pVelocities = [];
for (let i = 0; i < particleCount; i++) {
  pPositions[i * 3] = (Math.random() - 0.5) * 14;
  pPositions[i * 3 + 1] = Math.random() * 8 - 1;
  pPositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
  pVelocities.push(
    new THREE.Vector3(
      (Math.random() - 0.5) * 0.003,
      Math.random() * 0.008 + 0.002,
      (Math.random() - 0.5) * 0.003
    )
  );
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
const pMat = new THREE.PointsMaterial({
  color: 0xff8844,
  size: 0.06,
  transparent: true,
  opacity: 0.7,
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// ── Camera ───────────────────────────────────────────────────
let cameraAngle = 0;
const cameraRadius = 6;
const cameraHeight = 2.5;

// ── Animation ────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Camera orbits slowly
  cameraAngle += 0.003;
  camera.position.set(
    Math.cos(cameraAngle) * cameraRadius,
    cameraHeight + Math.sin(t * 0.3) * 0.3,
    Math.sin(cameraAngle) * cameraRadius
  );
  camera.lookAt(0, 0.5, 0);

  // Dragon breathing (body scale)
  const breathe = Math.sin(t * 1.5) * 0.03;
  body.scale.set(1 + breathe, 0.85 + breathe * 0.5, 1.25 + breathe);
  belly.scale.set(
    0.8 + breathe * 0.8,
    0.7 + breathe * 0.5,
    1.1 + breathe * 0.8
  );

  // Head gentle bob
  headGroup.rotation.x = Math.sin(t * 1.2) * 0.06;
  headGroup.rotation.y = Math.sin(t * 0.8) * 0.08;

  // Wing flap
  const flapAngle = Math.sin(t * 2.2) * 0.25 + 0.15;
  leftWing.rotation.z = -flapAngle;
  rightWing.rotation.z = flapAngle;
  leftWing.rotation.x = Math.sin(t * 2.2 + 0.5) * 0.1;
  rightWing.rotation.x = Math.sin(t * 2.2 + 0.5) * 0.1;

  // Tail sway
  tailGroup.children.forEach((seg, i) => {
    const phase = t * 1.5 + i * 0.4;
    seg.position.x += Math.sin(phase) * 0.002;
  });

  // Leg idle animation
  [legFL, legFR, legBL, legBR].forEach((leg, i) => {
    leg.rotation.x =
      (i < 2 ? 0.15 : -0.15) + Math.sin(t * 1.0 + i * 1.5) * 0.04;
  });

  // Particles
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] += pVelocities[i].x;
    positions[i * 3 + 1] += pVelocities[i].y;
    positions[i * 3 + 2] += pVelocities[i].z;
    if (positions[i * 3 + 1] > 8) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = -1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();

// ── Resize ───────────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
