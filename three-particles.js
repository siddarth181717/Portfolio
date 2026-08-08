/* ==========================================================================
   USTA AGENCY 3D PARTICLE WEBGL ENGINE (THREE.JS)
   ========================================================================== */

(function() {
  'use strict';

  // Core Three.js variables
  let scene, camera, renderer, particleGeometry, particleMaterial, particleSystem;
  const PARTICLE_COUNT = 12000;
  
  // Buffers
  let currentPositions, targetPositions, currentColors, targetColors, sizes;
  
  // 3D Model Shape Targets Array (6 shapes)
  const models = [];
  const modelColors = [];
  
  // Morph State
  let activeModelIndex = 0;
  let prevModelIndex = 0;
  let morphProgress = 1.0;
  
  // Mouse & Parallax
  let mouseX = 0, mouseY = 0;
  let targetRotationX = 0, targetRotationY = 0;
  let raycaster, mouseVec;
  
  // Initialize WebGL Scene
  function init() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    // 1. Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080d, 0.015);

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouseVec = new THREE.Vector2();

    // 4. Generate Particle Models
    generateParticleModels();

    // 5. Create Active Particle System
    createParticleSystem();

    // 6. Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);

    // 7. Start Render Loop
    animate();
  }

  // Generate Canvas Texture for Glowing Particle Points
  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(0, 229, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // --------------------------------------------------------------------------
  // PARAMETRIC 3D SHAPE GENERATORS (12,000 Particles Each)
  // --------------------------------------------------------------------------
  function generateParticleModels() {
    // Model 0: 3D Rocket Spacecraft
    models.push(createRocketModel());
    modelColors.push(createRocketColors());

    // Model 1: 3D Orbital Satellite
    models.push(createSatelliteModel());
    modelColors.push(createSatelliteColors());

    // Model 2: 3D Quantum Polyhedron Core
    models.push(createCoreModel());
    modelColors.push(createCoreColors());

    // Model 3: 3D Spiral Vortex Galaxy
    models.push(createGalaxyModel());
    modelColors.push(createGalaxyColors());

    // Model 4: 3D Constellation Network
    models.push(createNetworkModel());
    modelColors.push(createNetworkColors());

    // Model 5: 3D Particle Astronaut
    models.push(createAstronautModel());
    modelColors.push(createAstronautColors());
  }

  // SHAPE 0: Rocket Model Generator
  function createRocketModel() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const u = Math.random();
      
      if (u < 0.5) {
        // Fuselage Cylinder / Cone body
        const h = (Math.random() - 0.5) * 10;
        const radius = (1 - (h + 5) / 15) * 1.8 + 0.3;
        const angle = Math.random() * Math.PI * 2;
        pos[idx] = Math.cos(angle) * radius;
        pos[idx + 1] = h;
        pos[idx + 2] = Math.sin(angle) * radius;
      } else if (u < 0.75) {
        // 4 Wing Fins at base
        const finAngle = (Math.floor(Math.random() * 4) * Math.PI) / 2;
        const r = 1.5 + Math.random() * 2.5;
        const h = -3.5 + Math.random() * 2.5;
        pos[idx] = Math.cos(finAngle) * r + (Math.random() - 0.5) * 0.2;
        pos[idx + 1] = h;
        pos[idx + 2] = Math.sin(finAngle) * r + (Math.random() - 0.5) * 0.2;
      } else {
        // Thruster flame particle trail
        const h = -4 - Math.random() * 7;
        const radius = Math.random() * (Math.abs(h) - 3) * 0.4;
        const angle = Math.random() * Math.PI * 2;
        pos[idx] = Math.cos(angle) * radius;
        pos[idx + 1] = h;
        pos[idx + 2] = Math.sin(angle) * radius;
      }
    }
    return pos;
  }

  function createRocketColors() {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const c1 = new THREE.Color(0xffb700); // Gold
    const c2 = new THREE.Color(0x00e5ff); // Cyan
    const c3 = new THREE.Color(0xff3300); // Flame Red
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const y = models[0][idx + 1];
      let c;
      if (y < -4) c = c3;
      else if (y > 4) c = c2;
      else c = c1;
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;
    }
    return col;
  }

  // SHAPE 1: Satellite Model Generator
  function createSatelliteModel() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const u = Math.random();
      
      if (u < 0.3) {
        // Center Body Octahedron
        const r = Math.random() * 2.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        pos[idx] = r * Math.sin(phi) * Math.cos(theta);
        pos[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[idx + 2] = r * Math.cos(phi);
      } else if (u < 0.8) {
        // Solar Wing Panels Left & Right
        const side = Math.random() > 0.5 ? 1 : -1;
        const x = side * (3.0 + Math.random() * 8.0);
        const y = (Math.random() - 0.5) * 3.5;
        const z = (Math.random() - 0.5) * 0.4;
        pos[idx] = x;
        pos[idx + 1] = y;
        pos[idx + 2] = z;
      } else {
        // Parabolic Dish Antenna
        const r = Math.random() * 2.5;
        const angle = Math.random() * Math.PI * 2;
        pos[idx] = Math.cos(angle) * r;
        pos[idx + 1] = Math.sin(angle) * r;
        pos[idx + 2] = 2.5 + (r * r) * 0.25;
      }
    }
    return pos;
  }

  function createSatelliteColors() {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const cGold = new THREE.Color(0xffcc00);
    const cCyan = new THREE.Color(0x00e5ff);
    const cWhite = new THREE.Color(0xffffff);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const x = models[1][idx];
      let c = (Math.abs(x) > 3) ? cGold : (Math.random() > 0.4 ? cCyan : cWhite);
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;
    }
    return col;
  }

  // SHAPE 2: Quantum Core Model Generator
  function createCoreModel() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const u = Math.random();
      
      if (u < 0.4) {
        // Dense Inner Core Sphere
        const r = Math.pow(Math.random(), 0.5) * 2.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        pos[idx] = r * Math.sin(phi) * Math.cos(theta);
        pos[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[idx + 2] = r * Math.cos(phi);
      } else if (u < 0.75) {
        // Rotating Torus Ring 1
        const R = 5.0, r = 0.5;
        const uA = Math.random() * Math.PI * 2;
        const vA = Math.random() * Math.PI * 2;
        const x = (R + r * Math.cos(vA)) * Math.cos(uA);
        const y = (R + r * Math.cos(vA)) * Math.sin(uA);
        const z = r * Math.sin(vA);
        // Tilt ring 45 deg
        pos[idx] = x * 0.707 - z * 0.707;
        pos[idx + 1] = y;
        pos[idx + 2] = x * 0.707 + z * 0.707;
      } else {
        // Torus Ring 2
        const R = 6.5, r = 0.4;
        const uA = Math.random() * Math.PI * 2;
        const vA = Math.random() * Math.PI * 2;
        const x = (R + r * Math.cos(vA)) * Math.cos(uA);
        const y = (R + r * Math.cos(vA)) * Math.sin(uA);
        const z = r * Math.sin(vA);
        // Opposite tilt
        pos[idx] = x;
        pos[idx + 1] = y * 0.707 - z * 0.707;
        pos[idx + 2] = y * 0.707 + z * 0.707;
      }
    }
    return pos;
  }

  function createCoreColors() {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const c1 = new THREE.Color(0xa855f7); // Purple
    const c2 = new THREE.Color(0x00e5ff); // Cyan
    const c3 = new THREE.Color(0xff0055); // Crimson
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const r = Math.sqrt(models[2][idx]**2 + models[2][idx+1]**2 + models[2][idx+2]**2);
      let c = r < 3 ? c3 : (r > 6 ? c1 : c2);
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;
    }
    return col;
  }

  // SHAPE 3: Vortex Galaxy Model Generator
  function createGalaxyModel() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const arms = 4;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const r = Math.pow(Math.random(), 1.5) * 9.0;
      const armAngle = (i % arms) * ((2 * Math.PI) / arms);
      const spiralAngle = r * 0.7;
      const angle = armAngle + spiralAngle + (Math.random() - 0.5) * 0.4;
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = (Math.random() - 0.5) * (1.5 - r * 0.12);
      
      pos[idx] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;
    }
    return pos;
  }

  function createGalaxyColors() {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const cCore = new THREE.Color(0xffffff);
    const cMid = new THREE.Color(0x00e5ff);
    const cOuter = new THREE.Color(0xaa00ff);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const r = Math.sqrt(models[3][idx]**2 + models[3][idx+2]**2);
      let c = r < 2 ? cCore : (r < 5.5 ? cMid : cOuter);
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;
    }
    return col;
  }

  // SHAPE 4: Constellation Network Model Generator
  function createNetworkModel() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    // 25 central node clusters
    const nodes = [];
    for (let k = 0; k < 25; k++) {
      nodes.push(new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      ));
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const node = nodes[i % nodes.length];
      const offsetR = Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      pos[idx] = node.x + offsetR * Math.sin(phi) * Math.cos(theta);
      pos[idx + 1] = node.y + offsetR * Math.sin(phi) * Math.sin(theta);
      pos[idx + 2] = node.z + offsetR * Math.cos(phi);
    }
    return pos;
  }

  function createNetworkColors() {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const c1 = new THREE.Color(0x00ffaa); // Emerald
    const c2 = new THREE.Color(0x00e5ff); // Cyan
    const c3 = new THREE.Color(0xffffff);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      let c = i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3);
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;
    }
    return col;
  }

  // SHAPE 5: Particle Astronaut Model Generator
  function createAstronautModel() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const u = Math.random();

      if (u < 0.2) {
        // Helmet Dome
        const r = 1.8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        pos[idx] = r * Math.sin(phi) * Math.cos(theta);
        pos[idx + 1] = 5.0 + r * Math.cos(phi);
        pos[idx + 2] = r * Math.sin(phi) * Math.sin(theta);
      } else if (u < 0.5) {
        // Torso Suit Box & Backpack
        pos[idx] = (Math.random() - 0.5) * 2.8;
        pos[idx + 1] = 0.5 + Math.random() * 3.2;
        pos[idx + 2] = (Math.random() - 0.5) * 2.2;
      } else if (u < 0.65) {
        // Left Arm (Side)
        pos[idx] = -2.2 - Math.random() * 0.8;
        pos[idx + 1] = 1.0 + Math.random() * 2.5;
        pos[idx + 2] = (Math.random() - 0.5) * 0.8;
      } else if (u < 0.8) {
        // Right Arm (Waving Raised Up)
        const angle = 0.8 + Math.random() * 0.8;
        const len = Math.random() * 2.8;
        pos[idx] = 1.8 + Math.cos(angle) * len;
        pos[idx + 1] = 2.5 + Math.sin(angle) * len;
        pos[idx + 2] = (Math.random() - 0.5) * 0.8;
      } else {
        // Legs
        const legSide = Math.random() > 0.5 ? 0.9 : -0.9;
        pos[idx] = legSide + (Math.random() - 0.5) * 0.8;
        pos[idx + 1] = -3.8 + Math.random() * 4.0;
        pos[idx + 2] = (Math.random() - 0.5) * 0.8;
      }
    }
    return pos;
  }

  function createAstronautColors() {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const cWhite = new THREE.Color(0xffffff);
    const cGoldVisor = new THREE.Color(0xffb700);
    const cCyanGlow = new THREE.Color(0x00e5ff);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const y = models[5][idx + 1];
      const z = models[5][idx + 2];
      let c = (y > 4.5 && z > 0.8) ? cGoldVisor : (Math.random() > 0.3 ? cWhite : cCyanGlow);
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;
    }
    return col;
  }

  // --------------------------------------------------------------------------
  // CREATE ACTIVE THREE.JS POINT CLOUD SYSTEM
  // --------------------------------------------------------------------------
  function createParticleSystem() {
    particleGeometry = new THREE.BufferGeometry();

    currentPositions = new Float32Array(models[0]);
    targetPositions = new Float32Array(models[0]);

    currentColors = new Float32Array(modelColors[0]);
    targetColors = new Float32Array(modelColors[0]);

    sizes = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      sizes[i] = Math.random() * 0.35 + 0.15;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    particleMaterial = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      map: createParticleTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
  }

  // --------------------------------------------------------------------------
  // MORPH CONTROLLER API
  // --------------------------------------------------------------------------
  window.morphToModel = function(modelIndex) {
    if (modelIndex < 0 || modelIndex >= models.length) return;
    if (modelIndex === activeModelIndex) return;

    prevModelIndex = activeModelIndex;
    activeModelIndex = modelIndex;

    targetPositions = models[activeModelIndex];
    targetColors = modelColors[activeModelIndex];
  };

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    targetRotationY = mouseX * 0.3;
    targetRotationX = -mouseY * 0.2;
  }

  // --------------------------------------------------------------------------
  // RENDER LOOP & ANIMATION
  // --------------------------------------------------------------------------
  function animate() {
    requestAnimationFrame(animate);

    const positions = particleGeometry.attributes.position.array;
    const colors = particleGeometry.attributes.color.array;

    // Smooth Lerp positions and colors towards active target
    const lerpSpeed = 0.05;
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      positions[i] += (targetPositions[i] - positions[i]) * lerpSpeed;
      colors[i] += (targetColors[i] - colors[i]) * lerpSpeed;
    }

    // Add subtle ambient idle movement / wave to astronaut arm if active
    if (activeModelIndex === 5) {
      const time = Date.now() * 0.003;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        // If particle belongs to right arm
        if (targetPositions[idx] > 1.5 && targetPositions[idx + 1] > 2.0) {
          positions[idx] += Math.sin(time + positions[idx + 1]) * 0.015;
        }
      }
    }

    particleGeometry.attributes.position.needsUpdate = true;
    particleGeometry.attributes.color.needsUpdate = true;

    // Smooth Camera rotation & parallax
    if (particleSystem) {
      particleSystem.rotation.y += (targetRotationY - particleSystem.rotation.y) * 0.05;
      particleSystem.rotation.x += (targetRotationX - particleSystem.rotation.x) * 0.05;
      
      // Continuous slow orbital spin
      particleSystem.rotation.y += 0.0015;
    }

    renderer.render(scene, camera);
  }

  // Initialize once DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
