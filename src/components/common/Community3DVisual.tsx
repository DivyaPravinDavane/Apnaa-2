'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function Community3DVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Set up Scene, Camera, Renderer
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;

    try {
      scene = new THREE.Scene();
      scene.background = null;

      const width = container.clientWidth || 500;
      const height = container.clientHeight || 400;

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(14, 18, 20);
      camera.lookAt(0, 2, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.appendChild(renderer.domElement);
    } catch {
      setHasWebGL(false);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff6e5, 1.4);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    const d = 12;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0x248F84, 1.2, 20);
    accentLight.position.set(0, 4, 0);
    scene.add(accentLight);

    // Group for whole model
    const communityGroup = new THREE.Group();
    scene.add(communityGroup);

    // Ground Platform
    const groundGeo = new THREE.BoxGeometry(18, 0.6, 18);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xEEF3F0,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    communityGroup.add(ground);

    // Landscaped Green Lawns
    const lawnGeo = new THREE.BoxGeometry(16, 0.1, 16);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0xD6ECE5,
      roughness: 0.9,
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.position.y = 0.05;
    lawn.receiveShadow = true;
    communityGroup.add(lawn);

    // Swimming Pool on deck
    const poolGeo = new THREE.BoxGeometry(5, 0.15, 3);
    const poolMat = new THREE.MeshStandardMaterial({
      color: 0x248F84,
      roughness: 0.1,
      metalness: 0.2,
    });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(4, 0.08, 4);
    communityGroup.add(pool);

    // Residential Tower 1 (Main Tower - Purple Accent)
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xFAFAFA,
      roughness: 0.4,
    });
    const towerAccentMat = new THREE.MeshStandardMaterial({
      color: 0x7C3AED,
      roughness: 0.3,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xEDE9FE,
      roughness: 0.1,
      metalness: 0.5,
      transparent: true,
      opacity: 0.85,
    });

    const tower1 = new THREE.Mesh(new THREE.BoxGeometry(4, 11, 4), towerMat);
    tower1.position.set(-3.5, 5.5, -2);
    tower1.castShadow = true;
    tower1.receiveShadow = true;
    communityGroup.add(tower1);

    // Balconies / Floors for Tower 1
    for (let f = 1; f <= 8; f++) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.15, 4.3), towerAccentMat);
      slab.position.set(-3.5, f * 1.25, -2);
      communityGroup.add(slab);

      // Glass windows
      const windowStrip = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.6, 0.05), glassMat);
      windowStrip.position.set(-3.5, f * 1.25 - 0.4, 0.05);
      communityGroup.add(windowStrip);
    }

    // Residential Tower 2 (Wing B)
    const tower2 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 8.5, 3.5), towerMat);
    tower2.position.set(3, 4.25, -3.5);
    tower2.castShadow = true;
    tower2.receiveShadow = true;
    communityGroup.add(tower2);

    for (let f = 1; f <= 6; f++) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 3.8), towerAccentMat);
      slab.position.set(3, f * 1.25, -3.5);
      communityGroup.add(slab);
    }

    // Clubhouse / Pavilion (Ground level)
    const clubhouse = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 4.5), towerMat);
    clubhouse.position.set(-1, 1.1, 4);
    clubhouse.castShadow = true;
    clubhouse.receiveShadow = true;
    communityGroup.add(clubhouse);

    // Clubhouse Roof Garden
    const clubRoof = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.25, 4.8), towerAccentMat);
    clubRoof.position.set(-1, 2.3, 4);
    communityGroup.add(clubRoof);

    // Trees / Landscaping
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B });
    const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x198754, roughness: 0.9 });

    const treePositions = [
      [2, 0, 1],
      [1.5, 0, 6],
      [-5.5, 0, 5],
      [6, 0, -1],
      [-6, 0, -5],
    ];

    treePositions.forEach(([x, y, z]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.8), treeTrunkMat);
      trunk.position.set(x, 0.4, z);
      trunk.castShadow = true;
      communityGroup.add(trunk);

      const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 6), treeFoliageMat);
      foliage.position.set(x, 1.4, z);
      foliage.castShadow = true;
      communityGroup.add(foliage);
    });

    // Mouse interactivity
    let mouseX = 0;
    let targetRotation = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseX = normX * 0.4;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        targetRotation = mouseX;
        communityGroup.rotation.y += (targetRotation - communityGroup.rotation.y) * 0.05;
        // gentle idle bobbing
        const elapsed = clock.getElapsedTime();
        communityGroup.position.y = Math.sin(elapsed * 0.8) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-purple-50 rounded-2xl p-6 text-center">
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xl">
            GV
          </div>
          <p className="font-semibold text-purple-950">Green Valley Residency</p>
          <p className="text-sm text-purple-700">Premium Sustainable Residential Community</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[360px] sm:h-[420px] lg:h-[480px] relative cursor-grab active:cursor-grabbing select-none"
      title="Interactive 3D Architectural Community - Drag or move mouse to explore"
    >
      <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur border border-slate-200/80 text-[11px] text-purple-950 font-medium flex items-center gap-1.5 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        Interactive 3D Campus
      </div>
    </div>
  );
}
