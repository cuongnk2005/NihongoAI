import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function CultivatorModel({ rank, color, robe, sound }: { rank: number; color: string; robe: string; sound: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { setFailed(true); return; }
    setFailed(false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 2.8, 8.6); camera.lookAt(0, 1.65, 0);
    scene.add(new THREE.HemisphereLight(0xe8f6ff, 0x303039, 2.1));
    const light = new THREE.DirectionalLight(0xffe5b8, 2); light.position.set(3, 6, 5); scene.add(light);
    const model = new THREE.Group(); scene.add(model);
    const mat = (c: THREE.ColorRepresentation, metalness = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: .65, metalness });
    const clothing = mat(robe), dark = mat('#26312f'), skin = mat('#e7b99b'), hair = mat(rank >= 7 ? '#d9dce1' : '#1a2329'), gold = mat(rank > 2 ? '#d6ad60' : '#968c79', .55);
    const glow = new THREE.MeshBasicMaterial({ color });
    const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = model) => { const item = new THREE.Mesh(geometry, material); item.position.set(x, y, z); parent.add(item); return item; };
    mesh(new THREE.CylinderGeometry(.46, .85, 1.75, 8), clothing, 0, 1.35, 0);
    // Layered robes and asymmetric cloth panels give each silhouette depth.
    for (const side of [-1, 1]) {
      const panel = mesh(new THREE.ConeGeometry(.44, 1.42, 4), mat(rank >= 7 ? '#e6d9bd' : '#344b48'), side * .35, 1.13, .31);
      panel.rotation.y = Math.PI / 4; panel.rotation.z = side * .1;
      const hem = mesh(new THREE.BoxGeometry(.055, 1.18, .025), gold, side * .38, 1.17, .57); hem.rotation.z = side * .12;
    }
    mesh(new THREE.CylinderGeometry(.47, .55, .14, 8), gold, 0, 1.65, 0);
    const collar = mesh(new THREE.BoxGeometry(.1, .8, .09), mat('#e8dfc8'), -.16, 2.04, .45); collar.rotation.z = -.5;
    const collar2 = mesh(new THREE.BoxGeometry(.1, .8, .09), mat('#e8dfc8'), .16, 2.04, .45); collar2.rotation.z = .5;
    for (const side of [-1, 1]) {
      const arm = mesh(new THREE.CylinderGeometry(.21, .27, 1.05, 7), clothing, side * .62, 1.89, 0); arm.rotation.z = side * .23;
      if (rank >= 1) { const cuff = mesh(new THREE.CylinderGeometry(.28, .28, .12, 8), gold, side * .72, 1.47, 0); cuff.rotation.z = side * .23; }
      if (rank >= 3) { const shoulder = mesh(new THREE.SphereGeometry(.25, 10, 8), gold, side * .52, 2.28, 0); shoulder.scale.set(1.3, .43, 1); }
      mesh(new THREE.SphereGeometry(.14, 12, 8), skin, side * .74, 1.35, 0);
      mesh(new THREE.CylinderGeometry(.16, .18, .53, 8), dark, side * .28, .35, 0);
    }
    mesh(new THREE.SphereGeometry(.39, 20, 16), skin, 0, 2.79, 0);
    const cap = mesh(new THREE.SphereGeometry(.41, 16, 12, 0, Math.PI * 2, 0, Math.PI * .53), hair, 0, 2.83, 0);
    cap.rotation.z = -.12;
    mesh(new THREE.CylinderGeometry(.28, .18, 1, 8), hair, 0, 2.42, -.31);
    mesh(new THREE.SphereGeometry(.2, 12, 8), hair, 0, 3.18, -.08);
    const fringe = mesh(new THREE.ConeGeometry(.22, .4, 4), hair, -.24, 2.93, .3); fringe.rotation.z = -.35;
    if (rank >= 4) mesh(new THREE.TorusGeometry(.22, .035, 8, 20), gold, 0, 3.2, -.08).rotation.x = Math.PI / 2;
    if (rank >= 6) {
      for (const side of [-1, 1]) { const ornament = mesh(new THREE.ConeGeometry(.06, .42, 5), gold, side * .17, 3.35, 0); ornament.rotation.z = side * -.35; }
    }
    for (const side of [-1, 1]) mesh(new THREE.SphereGeometry(.025, 8, 6), dark, side * .14, 2.8, .36);
    const sword = new THREE.Group(); sword.position.set(.86, 1.1, .2); sword.rotation.z = -.28; model.add(sword);
    mesh(new THREE.BoxGeometry(.095, 1.35, .045), mat(rank >= 3 ? '#dce9ef' : '#a6b0aa', .7), 0, .85, 0, sword);
    const tip = mesh(new THREE.ConeGeometry(.065, .2, 4), mat('#e2e6df', .7), 0, 1.62, 0, sword); tip.rotation.y = Math.PI / 4;
    mesh(new THREE.BoxGeometry(.32, .07, .09), gold, 0, .17, 0, sword);
    mesh(new THREE.CylinderGeometry(.045, .045, .28, 8), dark, 0, 0, 0, sword);
    if (rank >= 2) { const gem = mesh(new THREE.OctahedronGeometry(.105), glow, 0, .2, .08, sword); gem.rotation.z = Math.PI / 4; }
    if (rank >= 5) { const edge = mesh(new THREE.BoxGeometry(.025, 1.3, .055), glow, 0, .86, .03, sword); edge.material = glow; }
    if (rank >= 7) { const wing = mesh(new THREE.TorusGeometry(.23, .025, 8, 24, Math.PI), gold, 0, .2, 0, sword); wing.rotation.z = Math.PI; }
    // A cape, prayer beads, flying swords and a crown mark major breakthroughs.
    if (rank >= 3) {
      const cape = mesh(new THREE.ConeGeometry(.9, 1.9, 4, 1, true), mat(rank >= 7 ? '#e3d4ad' : robe), 0, 1.45, -.4);
      cape.rotation.y = Math.PI / 4; cape.scale.z = .4;
      mesh(new THREE.OctahedronGeometry(.12), glow, 0, 2.08, .48);
    }
    if (rank === 4) for (let i = 0; i < 7; i++) mesh(new THREE.SphereGeometry(.055, 8, 6), gold, -.35 + i * .115, 2.12 - Math.sin(i * Math.PI / 6) * .23, .43);
    if (rank === 5 || rank === 6) {
      for (const side of [-1, 1]) { const ribbon = mesh(new THREE.TorusGeometry(.95, .025, 8, 48, Math.PI * 1.3), glow, side * .3, 1.8, -.3); ribbon.rotation.set(.8, side * .6, side * .65); }
    }
    if (rank >= 7) {
      for (const side of [-1, 1]) { const floatingSword = new THREE.Group(); floatingSword.position.set(side * 1.12, 1.7, -.45); floatingSword.rotation.z = side * -.25; model.add(floatingSword); mesh(new THREE.ConeGeometry(.08, 1.2, 4), gold, 0, .25, 0, floatingSword); mesh(new THREE.BoxGeometry(.28, .055, .07), gold, 0, -.35, 0, floatingSword); }
    }
    const pedestal = mesh(new THREE.CylinderGeometry(1.1, 1.2, .16, 40), mat('#384a47', .2), 0, .02, 0, scene);
    const ring = mesh(new THREE.TorusGeometry(1.05, .025, 8, 64), new THREE.MeshBasicMaterial({ color }), 0, .12, 0, scene); ring.rotation.x = Math.PI / 2;
    const effects = new THREE.Group(); scene.add(effects);
    if (rank >= 1) {
      const orbit = mesh(new THREE.TorusGeometry(1.2 + rank * .025, .012, 8, 80), glow, 0, 1.5, -.4, effects); orbit.rotation.set(.35, 0, .24);
      if (rank >= 4) { const second = mesh(new THREE.TorusGeometry(1.4, .012, 8, 80), glow, 0, 1.55, -.55, effects); second.rotation.set(.6, .3, -.35); }
      for (let i = 0; i < 8 + rank * 3; i++) { const orb = mesh(new THREE.OctahedronGeometry(.025 + (i % 3) * .01), glow, 0, 0, 0, effects); orb.userData = { phase: i * 2.4, radius: .8 + (i % 4) * .16, height: .35 + (i % 8) * .37 }; }
    }
    if (rank === 3) mesh(new THREE.IcosahedronGeometry(.18, 1), glow, 0, 1.65, .65, model);
    if (rank === 8) {
      const halo = mesh(new THREE.TorusGeometry(.72, .035, 8, 64), gold, 0, 2.8, -.55, model);
      halo.rotation.z = .1;
      for (let i = 0; i < 8; i++) { const ray = mesh(new THREE.ConeGeometry(.045, .35, 4), glow, Math.sin(i * Math.PI / 4) * .85, 2.8 + Math.cos(i * Math.PI / 4) * .85, -.55, model); ray.rotation.z = -i * Math.PI / 4; }
    }
    // Each high realm has a distinct animated scene, built from real 3D geometry.
    const dragon = new THREE.Group();
    const lightning = new THREE.Group();
    const cosmos = new THREE.Group();
    const dragonParts: THREE.Group[] = [];
    const flames: THREE.Mesh[] = [];
    let importedDragon: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let disposed = false;
    scene.add(dragon, lightning, cosmos);
    if (rank === 6) {
      // The generated asset is optional; retain the existing dragon until it is supplied.
      fetch(`${import.meta.env.BASE_URL}models/red-dragon.glb`, { method: 'HEAD' }).then(response => {
        if (!response.ok || (response.headers.get('content-type') || '').includes('text/html')) return;
        new GLTFLoader().load(`${import.meta.env.BASE_URL}models/red-dragon.glb`, gltf => {
          if (disposed) { gltf.scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); } }); return; }
          const asset = gltf.scene;
          const bounds = new THREE.Box3().setFromObject(asset), size = bounds.getSize(new THREE.Vector3());
          const scale = 2.1 / Math.max(size.x, size.y, size.z, .001);
          asset.scale.setScalar(scale);
          const center = bounds.getCenter(new THREE.Vector3());
          asset.position.copy(center).multiplyScalar(-scale);
          importedDragon = new THREE.Group(); importedDragon.add(asset); scene.add(importedDragon);
          dragon.visible = false;
          if (gltf.animations.length) { mixer = new THREE.AnimationMixer(asset); mixer.clipAction(gltf.animations[0]).play(); }
        }, undefined, () => { /* Leave the procedural fallback visible. */ });
      }).catch(() => { /* Leave the procedural fallback visible. */ });
      const dragonMaterial = new THREE.MeshStandardMaterial({ color: '#9c1d21', metalness: .4, roughness: .32 }), belly = mat('#e9b184', .3), hornMaterial = mat('#efc48b', .45);
      const maneMaterial = mat('#e25431', .3), scaleMaterial = mat('#d65038', .45), eyeMaterial = new THREE.MeshBasicMaterial({ color: '#ffdc5e' });
      // Every segment follows the same flight path with a time delay, so the body
      // flexes as the dragon closes in and circles the cultivator.
      const head = new THREE.Group(); dragon.add(head); dragonParts.push(head);
      head.scale.setScalar(1.18);
      const skull = mesh(new THREE.SphereGeometry(.23, 20, 16), dragonMaterial, 0, 0, 0, head); skull.scale.set(1.12, .85, 1);
      const snout = mesh(new THREE.SphereGeometry(.19, 20, 12), dragonMaterial, 0, -.07, .22, head); snout.scale.set(.9, .58, 1.5);
      const ridge = mesh(new THREE.ConeGeometry(.1, .4, 5), scaleMaterial, 0, .09, .22, head); ridge.rotation.x = Math.PI / 2;
      const mouth = mesh(new THREE.SphereGeometry(.17, 12, 8), mat('#39161a'), 0, -.14, .25, head); mouth.scale.set(1.05, .42, 1.5);
      const jaw = mesh(new THREE.SphereGeometry(.17, 10, 8), belly, 0, -.2, .23, head); jaw.scale.set(1, .26, 1.4);
      for (const side of [-1, 1]) {
        const horn = mesh(new THREE.ConeGeometry(.09, .48, 7), hornMaterial, side * .19, .28, -.08, head); horn.rotation.set(-.35, 0, -side * .48);
        const branch = mesh(new THREE.ConeGeometry(.035, .19, 5), hornMaterial, side * .26, .32, -.12, head); branch.rotation.z = -side * .85;
        const antler = new THREE.CatmullRomCurve3([new THREE.Vector3(side * .17, .12, -.1), new THREE.Vector3(side * .32, .34, -.16), new THREE.Vector3(side * .39, .56, -.27), new THREE.Vector3(side * .48, .64, -.4)]);
        mesh(new THREE.TubeGeometry(antler, 18, .032, 6, false), hornMaterial, 0, 0, 0, head);
        const brow = mesh(new THREE.ConeGeometry(.08, .22, 5), dragonMaterial, side * .18, .1, .12, head); brow.rotation.z = side * .7;
        mesh(new THREE.SphereGeometry(.045, 10, 8), eyeMaterial, side * .19, .045, .16, head);
        for (let tooth = 0; tooth < 4; tooth++) { const fang = mesh(new THREE.ConeGeometry(.025, tooth === 0 ? .14 : .085, 5), hornMaterial, side * (.13 - tooth * .015), -.15, .13 + tooth * .095, head); fang.rotation.z = Math.PI; }
        for (let i = 0; i < 7; i++) { const mane = mesh(new THREE.ConeGeometry(.075, .5 - i * .035, 5), i % 2 ? scaleMaterial : maneMaterial, side * (.19 + i * .025), .12 - i * .045, -.1 - i * .055, head); mane.rotation.set(-.9, 0, -side * 1.05); }
        const whiskerCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(side * .13, -.1, .35), new THREE.Vector3(side * .4, -.02, .48), new THREE.Vector3(side * .52, -.2, .34));
        mesh(new THREE.TubeGeometry(whiskerCurve, 16, .012, 5, false), hornMaterial, 0, 0, 0, head);
      }
      for (let i = 1; i <= 38; i++) {
        const part = new THREE.Group(); dragon.add(part); dragonParts.push(part);
        const width = .19 * (1 - .62 * (i / 38));
        const body = mesh(new THREE.SphereGeometry(width, 16, 12), dragonMaterial, 0, 0, 0, part); body.scale.set(1, .85, 2.25);
        const underside = mesh(new THREE.SphereGeometry(width * .84, 10, 7), belly, 0, -width * .48, .01, part); underside.scale.set(1, .38, 1.5);
        if (i % 2 === 0) {
          const fin = mesh(new THREE.ConeGeometry(width * .75, width * 2.7, 5), maneMaterial, 0, width * 1.3, -.04, part); fin.rotation.x = -.5;
          for (const side of [-1, 1]) { const spike = mesh(new THREE.ConeGeometry(width * .38, width * 1.5, 4), scaleMaterial, side * width * .9, width * .32, 0, part); spike.rotation.z = -side * .9; }
        }
        for (const side of [-1, 1]) for (const row of [-1, 0, 1]) { const scale = mesh(new THREE.SphereGeometry(width * .34, 8, 6), scaleMaterial, side * width * (.78 - Math.abs(row) * .12), row * width * .36, .03 + Math.abs(row) * .035, part); scale.scale.set(.4, .7, 1.2); }
        if (i === 8 || i === 20) for (const side of [-1, 1]) {
          const limb = mesh(new THREE.CylinderGeometry(.055, .04, .3, 7), dragonMaterial, side * .17, -.1, 0, part); limb.rotation.z = side * .85;
          for (let claw = -1; claw <= 1; claw++) { const nail = mesh(new THREE.ConeGeometry(.022, .11, 5), hornMaterial, side * .28, -.22, claw * .05, part); nail.rotation.z = Math.PI; }
        }
        if (i === 38) for (let fan = -1; fan <= 1; fan++) { const blade = mesh(new THREE.ConeGeometry(.09, .35, 4), dragonMaterial, fan * .07, 0, -.2, part); blade.rotation.x = -Math.PI / 2; blade.rotation.z = fan * .5; }
      }
      for (let i = 0; i < 18; i++) {
        const fireMaterial = new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? '#fff1a1' : i % 2 ? '#ff7c22' : '#ffba32', transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false });
        const flame = mesh(new THREE.SphereGeometry(.1, 8, 6), fireMaterial, 0, 0, .4, head); flames.push(flame);
      }
    }
    if (rank === 7) {
      const boltMaterial = new THREE.MeshBasicMaterial({ color: '#f7f5ff' });
      const auraMaterial = new THREE.MeshBasicMaterial({ color: '#8c8dff', transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending });
      const stroke = (from: THREE.Vector3, to: THREE.Vector3, parent: THREE.Object3D, width: number) => {
        const delta = to.clone().sub(from), middle = from.clone().add(to).multiplyScalar(.5);
        for (const [material, radius] of [[auraMaterial, width * 4], [boltMaterial, width]] as const) {
          const part = mesh(new THREE.CylinderGeometry(radius * .6, radius, delta.length(), 6), material, 0, 0, 0, parent);
          part.position.copy(middle); part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
        }
      };
      for (let b = 0; b < 5; b++) {
        const bolt = new THREE.Group(); lightning.add(bolt);
        bolt.position.set((b - 2) * .72, 0, -.7 + (b % 2) * .8);
        let point = new THREE.Vector3(0, 3.8, 0);
        for (let j = 0; j < 10; j++) {
          const next = new THREE.Vector3((j % 2 ? -.22 : .18) + Math.sin(b * 3 + j) * .16, 3.8 - (j + 1) * .32, Math.sin(j * 4 + b) * .06);
          stroke(point, next, bolt, .018);
          if (j === 2 || j === 5 || j === 7) {
            const direction = (b + j) % 2 ? 1 : -1;
            const fork = next.clone().add(new THREE.Vector3(direction * .32, -.24, .04));
            const end = fork.clone().add(new THREE.Vector3(direction * .18, -.3, 0));
            stroke(next, fork, bolt, .009); stroke(fork, end, bolt, .006);
          }
          point = next;
        }
      }
    }
    if (rank === 8) {
      const palette = ['#ffc779', '#8adce6', '#dcaaed', '#ffffff', '#e98c70'];
      for (let i = 0; i < 3; i++) {
        const orbit = mesh(new THREE.TorusGeometry(1.4 + i * .24, .012, 6, 96), new THREE.MeshBasicMaterial({ color: palette[i], transparent: true, opacity: .65 }), 0, 1.65, 0, cosmos);
        orbit.rotation.set(1.15 - i * .4, i * .6, i * .6);
        const planet = mesh(new THREE.SphereGeometry(.075 + i * .025, 12, 10), mat(palette[i], .3), 0, 0, 0, cosmos);
        planet.userData = { planet: true, index: i, radius: 1.4 + i * .24 };
      }
      for (let i = 0; i < 55; i++) { const star = mesh(new THREE.OctahedronGeometry(i % 8 === 0 ? .045 : .018), new THREE.MeshBasicMaterial({ color: palette[i % palette.length] }), 0, 0, 0, cosmos); star.userData = { star: true, phase: i * 2.399, radius: 1.4 + (i % 8) * .14, height: .3 + (i % 13) * .25 }; }
    }
    const resize = () => { const w = element.clientWidth, h = element.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    let frame = 0; const start = performance.now(); let previousTime = start;
    const dragonPosition = (time: number) => {
      const phase = ((time % 20) + 20) % 20;
      // Start outside, spiral inward for several turns, then return outside.
      const smooth = (value: number) => { const v = THREE.MathUtils.clamp(value, 0, 1); return v * v * (3 - 2 * v); };
      const inward = smooth((phase - 2) / 4), outward = smooth((phase - 15) / 5);
      const radius = 1.75 - .83 * inward + .83 * outward;
      const angle = time * (Math.PI * 2 / 5);
      return new THREE.Vector3(Math.sin(angle) * radius, 2.05 + Math.sin(angle * .5) * .35, Math.cos(angle) * radius * .63);
    };
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      const t = (time - start) / 1000;
      mixer?.update(Math.min((time - previousTime) / 1000, .1)); previousTime = time;
      model.rotation.y = Math.sin(t * .45) * .3; model.position.y = Math.sin(t * 1.4) * .035; pedestal.rotation.y = t * .08;
      dragonParts.forEach((part, index) => {
        const delayed = t - index * .085;
        part.position.copy(dragonPosition(delayed));
        part.lookAt(dragonPosition(delayed + .035));
        if (index > 0) part.rotateZ(Math.sin(t * 2 - index * .3) * .12);
      });
      if (importedDragon) { importedDragon.position.copy(dragonPosition(t)); importedDragon.lookAt(dragonPosition(t + .035)); }
      const breathing = t % 20 >= 11 && t % 20 < 15;
      flames.forEach((flame, index) => {
        flame.visible = breathing;
        if (!breathing) return;
        const age = (t * 1.7 + index / flames.length) % 1;
        flame.position.set(Math.sin(index * 8 + t * 4) * age * .23, -.08 + Math.cos(index * 5 + t * 3) * age * .17, .37 + age * 1.15);
        flame.scale.setScalar((.45 + age * 1.7) * Math.sin(age * Math.PI));
      });
      lightning.visible = Math.sin(t * 2.3) > .91 || Math.sin(t * 3.7) > .97; cosmos.rotation.y = t * .12;
      cosmos.children.forEach(item => { if (item.userData.planet) { const { index, radius } = item.userData; const a = t * (.35 + index * .12) + index * 2; item.position.set(Math.cos(a) * radius, 1.65 + Math.sin(a) * (.4 + index * .2), Math.sin(a) * radius * .6); } else if (item.userData.star) { const { phase, radius, height } = item.userData; item.position.set(Math.cos(phase) * radius, height, Math.sin(phase) * radius * .65); item.scale.setScalar(.65 + .35 * Math.sin(t * 2 + phase)); } });
      effects.children.forEach(item => { if (item.userData.phase !== undefined) { const { phase, radius, height } = item.userData; item.position.set(Math.cos(t * .45 + phase) * radius, height + Math.sin(t + phase) * .1, Math.sin(t * .45 + phase) * radius); item.rotation.y = t; } });
      renderer.render(scene, camera);
    }; frame = requestAnimationFrame(animate);
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); mixer?.stopAllAction(); scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); } }); renderer.dispose(); renderer.domElement.remove(); };
  }, [rank, color, robe]);
  useEffect(() => {
    if (!sound || rank !== 7) return;
    let context: AudioContext;
    try { context = new AudioContext(); } catch { return; }
    let active = true;
    const thunder = () => {
      if (!active) return;
      const length = context.sampleRate * 1.6;
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (context.sampleRate * .5));
      const source = context.createBufferSource(); source.buffer = buffer;
      const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 180;
      const gain = context.createGain(); gain.gain.value = .22;
      source.connect(filter).connect(gain).connect(context.destination); source.start();
    };
    void context.resume().then(thunder);
    const timer = window.setInterval(thunder, 6500);
    return () => { active = false; window.clearInterval(timer); void context.close(); };
  }, [sound, rank]);
  return <div ref={host} className="cult-model">{failed && <p>Trình duyệt chưa hỗ trợ hiển thị mô hình 3D.</p>}</div>;
}
