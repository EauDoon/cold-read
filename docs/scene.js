// The cold-read scene: one finished artifact inside a cold glass chamber,
// read by isolated readers that never saw it being made.
// Shared by docs/index.html (live, driven by scroll) and the offline renderer
// that makes the README banner and the profile tile (looped, driven by t).

const TAU = Math.PI * 2;
export const COLORS = { BG: 0x0b0d10, ICE: 0x8fd8ff, CYAN: 0x4cc9f0, RED: 0xff6b5e, GREEN: 0x3ecf8e, PAPER: 0xa9b6c3, INK: 0x2a323c };
const { BG, ICE, CYAN, RED, GREEN, PAPER, INK } = COLORS;

// Rows of "text" on the artifact. Row FLAW is the line one reader catches.
const ROWS = [0.92, 0.66, 0.84, 0.0, 0.88, 0.74, 0.9, 0.52, 0.0, 0.86, 0.8, 0.62];
export const FLAW = 6;
export const LENS_NAMES = ['Evidence', 'Consistency', 'Brief', 'Names', 'Hostile reader'];

function radial(THREE, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const h = size / 2;
  const gr = g.createRadialGradient(h, h, 0, h, h, h);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function roundedSlab(THREE, w, h, d, r) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 3, curveSegments: 12 });
  g.translate(0, 0, -d / 2);
  return g;
}

const VIEWS = {
  hero: { fov: 26, pos: [0.0, 1.7, 10.6], look: [0, -0.15, 0] },
  tile: { fov: 30, pos: [0.0, 1.9, 10.2], look: [0, -0.55, 0] },
  wide: { fov: 24, pos: [0.0, 1.0, 11.5], look: [0, 0.1, 0] },
  close: { fov: 22, pos: [1.6, 0.6, 5.6], look: [0, 0.15, 0] },
  top: { fov: 30, pos: [0.0, 6.4, 5.2], look: [0, -0.2, 0] },
};
export { VIEWS };

export function coldRead(THREE, ctx) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  if (ctx.env) { scene.environment = ctx.env; scene.environmentIntensity = 0.35; }
  const view = VIEWS[ctx.view || 'hero'];
  const camera = new THREE.PerspectiveCamera(view.fov, ctx.w / ctx.h, 0.1, 80);
  camera.position.set(...view.pos); camera.lookAt(...view.look);
  if (ctx.shiftX) camera.setViewOffset(ctx.w, ctx.h, -ctx.shiftX * ctx.w, 0, ctx.w, ctx.h);

  const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(3, 7, 5);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.bias = -0.0005;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 24 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(ICE, 1.6); rim.position.set(-4, 2.5, -5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x6c8cff, 0.3); fill.position.set(-5, -1, 3); scene.add(fill);
  scene.add(new THREE.AmbientLight(0x9fb4c8, 0.12));

  const FLOOR_Y = -1.75;
  const shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.5 }));
  shadowFloor.rotation.x = -Math.PI / 2; shadowFloor.position.y = FLOOR_Y; shadowFloor.receiveShadow = true; scene.add(shadowFloor);
  const glowTex = radial(THREE);
  const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 6.5), new THREE.MeshBasicMaterial({ map: glowTex, color: ICE, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false }));
  floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.y = FLOOR_Y + 0.003; scene.add(floorGlow);

  // ---------------------------------------------------------------- the artifact
  const artifact = new THREE.Group(); scene.add(artifact);
  const W = 1.5, H = 2.0;
  const paper = new THREE.Mesh(roundedSlab(THREE, W, H, 0.05, 0.06),
    new THREE.MeshPhysicalMaterial({ color: PAPER, roughness: 0.62, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.5 }));
  paper.castShadow = true; artifact.add(paper);
  const rows = [];
  const rowY = i => H / 2 - 0.26 - i * 0.135;
  const inkMat = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.8 });
  // title bar
  const title = new THREE.Mesh(new THREE.BoxGeometry(W * 0.5, 0.07, 0.012), inkMat);
  title.position.set(-W / 2 + 0.16 + W * 0.25, H / 2 - 0.15, 0.033); artifact.add(title);
  ROWS.forEach((f, i) => {
    if (!f) { rows.push(null); return; }
    const len = (W - 0.32) * f;
    const m = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.8, emissive: RED, emissiveIntensity: 0 });
    const r = new THREE.Mesh(new THREE.BoxGeometry(len, 0.045, 0.01), m);
    r.position.set(-W / 2 + 0.16 + len / 2, rowY(i + 1), 0.031);
    artifact.add(r); rows.push(r);
  });
  // the fail pin: a quote marker that appears beside the flaw line
  const pin = new THREE.Group();
  const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: RED, emissiveIntensity: 3 }));
  const pinStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: RED, emissiveIntensity: 2 }));
  pinStem.rotation.z = Math.PI / 2; pinStem.position.x = -0.14;
  pin.add(pinHead, pinStem); pin.position.set(W / 2 + 0.2, rowY(FLAW + 1), 0.04); artifact.add(pin);
  // the pass seal: a green ring stamped on the corner once every lens agrees
  const seal = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 8, 64), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: GREEN, emissiveIntensity: 2.6 }));
  seal.position.set(W / 2 - 0.22, -H / 2 + 0.22, 0.04); artifact.add(seal);

  // ---------------------------------------------------------------- the chamber: isolation made visible
  const chamber = new THREE.Group(); scene.add(chamber);
  const CW = 2.3, CH = 2.9, CD = 1.4;
  const box = new THREE.BoxGeometry(CW, CH, CD);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: ICE, transparent: true, opacity: 0.85 }));
  chamber.add(edges);
  const pane = new THREE.Mesh(box, new THREE.MeshPhysicalMaterial({ color: 0xbfe9ff, roughness: 0.15, metalness: 0, transparent: true, opacity: 0.045, side: THREE.DoubleSide, depthWrite: false }));
  chamber.add(pane);
  // corner frost caps
  const capMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: ICE, emissiveIntensity: 1.6 });
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 8), capMat);
    c.position.set(x * CW / 2, y * CH / 2, z * CD / 2); chamber.add(c);
  }
  chamber.position.y = 0.0;

  // frost: slow particles inside the chamber
  const N = 220; const pts = new Float32Array(N * 3); const seeds = new Float32Array(N);
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < N; i++) { pts[i * 3] = (rnd() - 0.5) * CW * 0.95; pts[i * 3 + 1] = (rnd() - 0.5) * CH * 0.95; pts[i * 3 + 2] = (rnd() - 0.5) * CD * 0.95; seeds[i] = rnd(); }
  const frostGeo = new THREE.BufferGeometry(); frostGeo.setAttribute('position', new THREE.BufferAttribute(pts.slice(), 3));
  const frost = new THREE.Points(frostGeo, new THREE.PointsMaterial({ color: ICE, size: 0.022, map: glowTex, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
  chamber.add(frost);

  // gate rings on the floor: leaves the building, bar statable, wrong costs
  const gates = [1.75, 2.05, 2.35].map(r => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.01, 8, 200), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: ICE, emissiveIntensity: 0.12, transparent: true, opacity: 1 }));
    m.rotation.x = Math.PI / 2; m.position.y = FLOOR_Y + 0.01; scene.add(m); return m;
  });

  // ---------------------------------------------------------------- the readers
  const lensGlass = new THREE.MeshPhysicalMaterial({ color: 0xdff4ff, metalness: 0, roughness: 0.05, transmission: 0.92, thickness: 0.3, ior: 1.4, clearcoat: 1, transparent: true });
  const rimMat = () => new THREE.MeshPhysicalMaterial({ color: 0xaeb8c4, metalness: 1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 });
  const lenses = LENS_NAMES.map((name, i) => {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 20, 72), rimMat());
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 48), lensGlass);
    disc.rotation.x = Math.PI / 2;
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: CYAN, emissiveIntensity: 3 }));
    g.add(ring, disc, eye);
    g.traverse(m => { if (m.isMesh) m.castShadow = true; });
    scene.add(g);
    // beam: a thin cone from the lens to the line it is reading
    const beamMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const beamGeo = new THREE.CylinderGeometry(0.004, 0.06, 1, 24, 1, true); beamGeo.translate(0, 0.5, 0);
    const beam = new THREE.Mesh(beamGeo, beamMat); scene.add(beam);
    const spot = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ map: glowTex, color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    artifact.add(spot);
    return { name, g, eye, beam, spot, vis: 1, phase: i / LENS_NAMES.length };
  });

  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion();
  const camTarget = new THREE.Vector3(...view.look);
  const cur = { lenses: 3, scan: 1, gate: 3, caught: 0, seal: 0, frost: 1, catcher: 2, mute: [0, 0, 0, 0, 0], spread: 1 };

  // state: { lenses, scan, gate, caught, seal, catcher, mute[], view, spread }
  // Without a state the scene runs its own loop for the offline renders.
  function update(t, state) {
    const loop = !state;
    const st = state || {
      lenses: ctx.lensCount ?? 3, scan: 1, gate: 3, spread: 1,
      caught: Math.max(0, Math.sin(t * TAU * 2 - 1.2)) ** 3, seal: 0, catcher: 1, mute: [0, 0, 0, 0, 0],
    };
    const k = loop ? 1 : 0.08; // easing toward the target state when live
    for (const key of ['lenses', 'scan', 'gate', 'caught', 'seal', 'spread']) cur[key] += ((st[key] ?? cur[key]) - cur[key]) * k;
    st.mute?.forEach((m, i) => { cur.mute[i] += (m - cur.mute[i]) * (loop ? 1 : 0.16); });

    // the artifact turns slowly and floats
    artifact.rotation.y = Math.sin(t * TAU) * 0.32 - 0.12;
    artifact.rotation.x = -0.05;
    artifact.position.y = 0.08 + Math.sin(t * TAU * 2) * 0.03;

    // frost drifts upward and wraps
    const p = frostGeo.attributes.position;
    for (let i = 0; i < N; i++) {
      const y0 = pts[i * 3 + 1];
      let y = y0 + ((t + seeds[i]) % 1) * 0.6 - 0.3;
      if (y > CH / 2) y -= CH; if (y < -CH / 2) y += CH;
      p.setY(i, y);
    }
    p.needsUpdate = true;

    gates.forEach((m, i) => { const on = Math.min(1, Math.max(0, cur.gate - i)); m.material.emissiveIntensity = 0.1 + on * 0.75; });

    // readers orbit outside the chamber, each reading its own line
    const R = (ctx.orbit ?? 2.05) + 0.35 * cur.spread;
    lenses.forEach((L, i) => {
      const present = Math.min(1, Math.max(0, cur.lenses - i)) * (1 - cur.mute[i]);
      L.vis = present;
      const ang = loop ? (L.phase + t) * TAU - Math.PI / 2 : L.phase * TAU + t * TAU * 0.25 - Math.PI / 2;
      L.g.position.set(Math.cos(ang) * R, 0.35 + Math.sin(ang * 2 + i) * 0.35, Math.sin(ang) * R * 0.7 + 0.25);
      L.g.scale.setScalar(Math.max(0.0001, present));
      L.g.visible = present > 0.01;
      L.g.lookAt(artifact.position);
      // which row this reader is on: it sweeps top to bottom over the loop
      const sweep = ((t * (loop ? 2 : 0.5)) + i * 0.37) % 1;
      const rowIdx = Math.floor(sweep * ROWS.length) % ROWS.length;
      const local = new THREE.Vector3(-0.1 + Math.sin((t + i) * TAU) * 0.35, rowY(rowIdx + 1) * cur.scan + (1 - cur.scan) * 0, 0.06);
      L.spot.position.copy(local);
      tmpB.copy(local); artifact.localToWorld(tmpB);
      L.eye.getWorldPosition(tmpA);
      const d = tmpB.clone().sub(tmpA); const len = d.length();
      L.beam.position.copy(tmpA); L.beam.scale.set(1, len, 1);
      q.setFromUnitVectors(up, d.normalize()); L.beam.quaternion.copy(q);
      const catching = i === (st.catcher ?? 1) ? cur.caught : 0;
      const col = new THREE.Color(CYAN).lerp(new THREE.Color(RED), catching);
      L.beam.material.color.copy(col); L.spot.material.color.copy(col); L.eye.material.emissive.copy(col);
      L.beam.material.opacity = 0.32 * present * cur.scan;
      L.spot.material.opacity = 0.55 * present * cur.scan;
      if (i === (st.catcher ?? 1)) {
        L.spot.position.y = rowY(FLAW + 1) * catching + L.spot.position.y * (1 - catching);
        L.beam.visible = present > 0.01;
      }
    });

    // a fail is shown only while the catching reader is present
    const catcherVis = lenses[st.catcher ?? 1].vis;
    const fail = cur.caught * catcherVis;
    const flawRow = rows[FLAW];
    flawRow.material.emissiveIntensity = fail * 4;
    pin.scale.setScalar(Math.max(0.0001, fail)); pin.visible = fail > 0.02;
    seal.scale.setScalar(Math.max(0.0001, cur.seal)); seal.visible = cur.seal > 0.02;
    floorGlow.material.color.set(ICE).lerp(new THREE.Color(RED), fail * 0.5).lerp(new THREE.Color(GREEN), cur.seal * 0.6);

    if (!loop && st.view) {
      const v = VIEWS[st.view];
      camera.position.lerp(new THREE.Vector3(...v.pos), 0.04);
      camTarget.lerp(new THREE.Vector3(...v.look), 0.04);
      camera.fov += (v.fov - camera.fov) * 0.04; camera.updateProjectionMatrix();
      camera.lookAt(camTarget);
    }
  }

  return { scene, camera, update, lenses, bloom: { strength: 0.6, radius: 0.5, threshold: 0.9 } };
}
