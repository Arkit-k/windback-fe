"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface RibbonCanvasProps {
  className?: string;
}

export function RibbonCanvas({ className }: RibbonCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7);
    camera.lookAt(0, 0, 0);

    // ── Lighting — matches the image's blue-white palette ────────────────────
    // Blue-tinted ambient fills the whole scene
    scene.add(new THREE.AmbientLight(0xC8D4FF, 1.1));

    // Key light: white, front-left-top (creates the bright lit face)
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 3.2);
    keyLight.position.set(-4, 6, 6);
    scene.add(keyLight);

    // Cyan fill from the right (creates the cyan edge highlight in the image)
    const fillLight = new THREE.DirectionalLight(0x70D8FF, 2.0);
    fillLight.position.set(7, -1, 4);
    scene.add(fillLight);

    // Deep blue rim from back-below (darkens the fold/shadow areas)
    const rimLight = new THREE.DirectionalLight(0x6080E0, 0.7);
    rimLight.position.set(1, -7, -4);
    scene.add(rimLight);

    // ── Build volumetric ribbon geometry ─────────────────────────────────────
    //
    // Strategy: sweep a flat rectangle (wide × thin) along a Frenet frame
    // for each ring on the curve. 4 faces × 2 verts per ring = 8 verts/ring.
    // Explicit face normals give correct per-face lighting (not smooth-shaded).
    //
    function buildRibbonGeo(
      curve: THREE.CatmullRomCurve3,
      segs: number,
      width: number,
      thickness: number
    ): THREE.BufferGeometry {
      const frames = curve.computeFrenetFrames(segs, false);
      const pts = curve.getPoints(segs);

      const hw = width / 2;
      const ht = thickness / 2;

      const posArr: number[] = [];
      const nrmArr: number[] = [];
      const uvsArr: number[] = [];

      for (let i = 0; i <= segs; i++) {
        const p = pts[i];
        const N = frames.normals[i];   // width axis
        const B = frames.binormals[i]; // thickness axis
        const u = i / segs;

        // 4 corners of the rectangular cross-section
        const TL = new THREE.Vector3().copy(p).addScaledVector(N, -hw).addScaledVector(B, -ht);
        const TR = new THREE.Vector3().copy(p).addScaledVector(N,  hw).addScaledVector(B, -ht);
        const BR = new THREE.Vector3().copy(p).addScaledVector(N,  hw).addScaledVector(B,  ht);
        const BL = new THREE.Vector3().copy(p).addScaledVector(N, -hw).addScaledVector(B,  ht);

        // Per-face normals (face-constant, so no smooth blending across edges)
        const nTop = new THREE.Vector3(-B.x, -B.y, -B.z); // top  face → -B
        const nRgt = new THREE.Vector3( N.x,  N.y,  N.z); // rght face → +N
        const nBot = new THREE.Vector3( B.x,  B.y,  B.z); // bot  face → +B
        const nLft = new THREE.Vector3(-N.x, -N.y, -N.z); // left face → -N

        // Each face: 2 verts per ring (left-vert, right-vert of that face strip)
        // Indices within the ring: [0,1]=top [2,3]=right [4,5]=bottom [6,7]=left

        // Top face (visible from -B side) — verts 0, 1
        posArr.push(TL.x, TL.y, TL.z,  TR.x, TR.y, TR.z);
        nrmArr.push(nTop.x, nTop.y, nTop.z,  nTop.x, nTop.y, nTop.z);
        uvsArr.push(0, u,  1, u);

        // Right edge (visible from +N side) — verts 2, 3
        posArr.push(TR.x, TR.y, TR.z,  BR.x, BR.y, BR.z);
        nrmArr.push(nRgt.x, nRgt.y, nRgt.z,  nRgt.x, nRgt.y, nRgt.z);
        uvsArr.push(0, u,  1, u);

        // Bottom face (visible from +B side) — verts 4, 5
        posArr.push(BR.x, BR.y, BR.z,  BL.x, BL.y, BL.z);
        nrmArr.push(nBot.x, nBot.y, nBot.z,  nBot.x, nBot.y, nBot.z);
        uvsArr.push(0, u,  1, u);

        // Left edge (visible from -N side) — verts 6, 7
        posArr.push(BL.x, BL.y, BL.z,  TL.x, TL.y, TL.z);
        nrmArr.push(nLft.x, nLft.y, nLft.z,  nLft.x, nLft.y, nLft.z);
        uvsArr.push(0, u,  1, u);
      }

      // Quad indices: for each segment, stitch 4 face strips
      // Winding: (a0, a1, b1)+(a0, b1, b0) gives outward normal = face normal ✓
      const idxArr: number[] = [];
      for (let i = 0; i < segs; i++) {
        const b = i * 8;
        const n = (i + 1) * 8;
        for (let f = 0; f < 4; f++) {
          const a0 = b + f * 2,     a1 = b + f * 2 + 1;
          const b0 = n + f * 2,     b1 = n + f * 2 + 1;
          idxArr.push(a0, a1, b1,  a0, b1, b0);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(posArr, 3));
      geo.setAttribute("normal",   new THREE.Float32BufferAttribute(nrmArr, 3));
      geo.setAttribute("uv",       new THREE.Float32BufferAttribute(uvsArr, 2));
      geo.setIndex(idxArr);
      return geo;
    }

    // ── Helix path ────────────────────────────────────────────────────────────
    // 1.3 turns, oval cross-section (flatter in Z to match the image perspective)
    const TURNS  = 1.3;
    const RADIUS = 1.85;
    const HEIGHT = 6.8;
    const PATH_N = 280;

    const pathPts: THREE.Vector3[] = [];
    for (let i = 0; i <= PATH_N; i++) {
      const t = i / PATH_N;
      const angle = t * Math.PI * 2 * TURNS - 0.25;
      pathPts.push(new THREE.Vector3(
        Math.cos(angle) * RADIUS,
        HEIGHT * (0.5 - t),
        Math.sin(angle) * RADIUS * 0.48  // shallower Z = more oval = matches image
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pathPts);

    // Ribbon: 1.5 units wide, 0.14 thick — wide flat band like the image
    const geo = buildRibbonGeo(curve, 400, 1.5, 0.14);

    const mat = new THREE.MeshStandardMaterial({
      color:     new THREE.Color("#8AAAF2"), // periwinkle blue
      roughness: 0.08,   // very smooth — gives clean specular highlights
      metalness: 0.02,
      side:      THREE.DoubleSide,
    });

    const ribbon = new THREE.Mesh(geo, mat);

    // Tilt to match the image's diagonal orientation
    // The image shows the helix tilted ~20° clockwise, positioned right-of-center
    ribbon.rotation.z = -0.30;
    ribbon.rotation.x =  0.10;
    ribbon.position.set(1.1, 0.0, 0.0);
    scene.add(ribbon);

    // ── Gentle animation: slow breathing float ────────────────────────────────
    let animId: number;
    let time = 0;

    function tick() {
      animId = requestAnimationFrame(tick);
      time += 0.0028;

      // Very slow, barely perceptible rotation — feels alive without being distracting
      ribbon.rotation.y =  Math.sin(time * 0.45) * 0.07;
      ribbon.position.y =  Math.sin(time * 0.30) * 0.06;

      renderer.render(scene, camera);
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    tick();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
    };
  }, []);

  return <div ref={mountRef} className={className ?? "h-full w-full"} />;
}
