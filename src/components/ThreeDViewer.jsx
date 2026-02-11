import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

function ThreeDViewer({ modelUrl, className = "" }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Reset state for new model
    setLoading(true);
    setError(null);
    console.log(`[ThreeDViewer] Effect triggered for: ${modelUrl}`);

    // If modelUrl is missing or empty, fail immediately
    if (!modelUrl || modelUrl.trim() === "") {
      console.warn("[ThreeDViewer] No modelUrl provided");
      setError("3D model not available");
      setLoading(false);
      return;
    }

    let renderer, scene, camera, controls;
    let animationId;

    const container = containerRef.current;

    const handleResize = () => {
      if (!camera || !renderer || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      console.log(`[ThreeDViewer] Resize detected: ${w}x${h}`);
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const init = () => {
      try {
        const width = container.clientWidth;
        const height = container.clientHeight;
        console.log(`[ThreeDViewer] Initializing. Container size: ${width}x${height}. modelUrl: ${modelUrl}`);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width || 400, height || 300);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        container.appendChild(renderer.domElement);
        console.log("[ThreeDViewer] Renderer appended to DOM");

        scene = new THREE.Scene();

        // Environment lighting
        try {
          const pmrem = new THREE.PMREMGenerator(renderer);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          pmrem.dispose();
        } catch (envError) {
          console.warn("Failed to set up environment lighting, using basic lights:", envError);
        }

        // Robust lighting as backup
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(2, 5, 5);
        scene.add(mainLight);

        camera = new THREE.PerspectiveCamera(45, (width || 400) / (height || 300), 0.1, 1000);
        camera.position.set(0, 0.5, 5);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.enableZoom = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.0;

        const loader = new GLTFLoader();

        loader.load(
          modelUrl,
          (gltf) => {
            const model = gltf.scene;

            model.traverse((node) => {
              if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
              }
            });

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.5 / (maxDim || 1);

            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));

            scene.add(model);
            setLoading(false);
          },
          null,
          (err) => {
            console.error("GLTF load error:", err);
            setError(`Failed to load 3D model: ${err.message || "Network error"}`);
            setLoading(false);
          }
        );

        window.addEventListener('resize', handleResize);

        const animate = () => {
          animationId = requestAnimationFrame(animate);
          if (controls) controls.update();
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };
        animate();
      } catch (err) {
        console.error("[ThreeDViewer] Init Error:", err);
        setError(`Renderer error: ${err.message || "Unknown error"}`);
        setLoading(false);
      }
    };

    init();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) {
        renderer.dispose();
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      if (scene) {
        scene.traverse((object) => {
          if (object.isMesh) {
            object.geometry.dispose();
            if (object.material.isMaterial) {
              cleanMaterial(object.material);
            } else if (Array.isArray(object.material)) {
              for (const material of object.material) cleanMaterial(material);
            }
          }
        });
      }
    };

    function cleanMaterial(material) {
      if (!material) return;
      material.dispose();
      for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && typeof value.dispose === 'function') {
          value.dispose();
        }
      }
    }
  }, [modelUrl]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
    >
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-2"></div>
          Loading 3D Model...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4 text-center text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

export default ThreeDViewer;