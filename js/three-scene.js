/*  Belle Aire Beach — Three.js 3D Scene
    Floating food items + hero wave mesh  */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent) || window.innerWidth < 768;
  const FOOD_COUNT = isMobile ? 18 : 40;
  const WAVE_SEGMENTS = isMobile ? 48 : 80;

  // ── FOOD EMOJIS ──
  const FOODS = ['🍔', '🍟', '🐟', '🍗', '🥓', '🌭', '🍕', '🧀'];

  // ── MOUSE TRACKING ──
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  document.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Create food sprite texture from emoji ──
  function createFoodTexture(emoji, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.font = (size * 0.75) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }


  // ══════════════════════════════════════════
  //  1. FLOATING FOOD ITEMS (all pages)
  // ══════════════════════════════════════════
  function initFoodParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'three-particles';
    document.body.prepend(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 30;

    const foodItems = [];

    // Pre-create textures for each food type
    const textures = FOODS.map(f => createFoodTexture(f, 128));

    for (let i = 0; i < FOOD_COUNT; i++) {
      const tex = textures[Math.floor(Math.random() * textures.length)];
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.12 + Math.random() * 0.18,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);

      const scale = 1 + Math.random() * 2.5;
      sprite.scale.set(scale, scale, 1);

      sprite.position.set(
        (Math.random() - 0.5) * 55,
        (Math.random() - 0.5) * 45,
        (Math.random() - 0.5) * 15 - 5
      );

      sprite.userData = {
        baseY: sprite.position.y,
        baseX: sprite.position.x,
        speed: 0.15 + Math.random() * 0.35,
        floatAmplitude: 0.8 + Math.random() * 2.5,
        floatOffset: Math.random() * Math.PI * 2,
        driftSpeed: 0.01 + Math.random() * 0.025,
        driftAmplitude: 0.4 + Math.random() * 1.2,
        rotSpeed: 0.003 + Math.random() * 0.01,
        parallaxFactor: 0.3 + Math.random() * 1.2,
      };

      scene.add(sprite);
      foodItems.push(sprite);
    }

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      for (const f of foodItems) {
        const d = f.userData;
        f.position.y = d.baseY + Math.sin(t * d.speed + d.floatOffset) * d.floatAmplitude;
        f.position.x = d.baseX + Math.sin(t * d.driftSpeed * 2 + d.floatOffset) * d.driftAmplitude;
        f.material.rotation += d.rotSpeed;

        // Mouse parallax
        f.position.x += mouse.x * d.parallaxFactor * 0.3;
        f.position.y -= mouse.y * d.parallaxFactor * 0.3;
      }

      camera.position.x = Math.sin(t * 0.08) * 0.4 + mouse.x * 1.2;
      camera.position.y = Math.cos(t * 0.06) * 0.3 - mouse.y * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }


  // ══════════════════════════════════════════
  //  2. HERO WAVE MESH
  // ══════════════════════════════════════════
  function initHeroWaves() {
    const heroEl = document.querySelector('.hero') || document.querySelector('.page-hero');
    if (!heroEl) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'three-hero-wave';
    heroEl.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x4a9eff, 0.5));
    const pointLight = new THREE.PointLight(0x4a9eff, 1, 50);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // Wave plane — wireframe
    const geometry = new THREE.PlaneGeometry(20, 8, WAVE_SEGMENTS, WAVE_SEGMENTS);
    const material = new THREE.MeshPhongMaterial({
      color: 0x2a6bcc,
      transparent: true,
      opacity: 0.18,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const waveMesh = new THREE.Mesh(geometry, material);
    waveMesh.rotation.x = -Math.PI / 2.5;
    waveMesh.position.y = -1;
    scene.add(waveMesh);

    // Wave plane — solid
    const geo2 = new THREE.PlaneGeometry(20, 8, WAVE_SEGMENTS / 2, WAVE_SEGMENTS / 2);
    const mat2 = new THREE.MeshPhongMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      shininess: 150,
    });
    const waveMesh2 = new THREE.Mesh(geo2, mat2);
    waveMesh2.rotation.x = -Math.PI / 2.5;
    waveMesh2.position.y = -0.5;
    scene.add(waveMesh2);

    const posAttr1 = geometry.attributes.position;
    const posAttr2 = geo2.attributes.position;
    const baseZ1 = new Float32Array(posAttr1.count);
    const baseZ2 = new Float32Array(posAttr2.count);
    for (let i = 0; i < posAttr1.count; i++) baseZ1[i] = posAttr1.getZ(i);
    for (let i = 0; i < posAttr2.count; i++) baseZ2[i] = posAttr2.getZ(i);

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      for (let i = 0; i < posAttr1.count; i++) {
        const x = posAttr1.getX(i);
        const y = posAttr1.getY(i);
        posAttr1.setZ(i, baseZ1[i] +
          Math.sin(x * 0.5 + t * 0.8) * 0.4 +
          Math.sin(y * 0.3 + t * 0.6) * 0.3 +
          Math.sin((x + y) * 0.4 + t * 1.2) * 0.15
        );
      }
      posAttr1.needsUpdate = true;

      for (let i = 0; i < posAttr2.count; i++) {
        const x = posAttr2.getX(i);
        const y = posAttr2.getY(i);
        posAttr2.setZ(i, baseZ2[i] +
          Math.sin(x * 0.4 + t * 0.5 + 1) * 0.5 +
          Math.sin(y * 0.25 + t * 0.4 + 2) * 0.35
        );
      }
      posAttr2.needsUpdate = true;

      camera.position.x = mouse.x * 0.8;
      camera.position.y = 3 - mouse.y * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height);
    });
  }


  // ══════════════════════════════════════════
  //  3. DARK SECTION FOOD FLOATERS
  // ══════════════════════════════════════════
  function initSectionFoods() {
    const targets = document.querySelectorAll('.features, .cta-banner');
    if (!targets.length) return;

    targets.forEach((section) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'three-section-food';
      section.insertBefore(canvas, section.firstChild);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.1, 100);
      camera.position.z = 15;

      const foods = [];
      const count = isMobile ? 6 : 12;
      const textures = FOODS.map(f => createFoodTexture(f, 128));

      for (let i = 0; i < count; i++) {
        const tex = textures[Math.floor(Math.random() * textures.length)];
        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          opacity: 0.1 + Math.random() * 0.15,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(mat);
        const scale = 0.8 + Math.random() * 1.8;
        sprite.scale.set(scale, scale, 1);
        sprite.position.set(
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6 - 3
        );
        sprite.userData = {
          rotSpeed: 0.003 + Math.random() * 0.008,
          floatSpeed: 0.3 + Math.random() * 0.5,
          floatAmp: 0.3 + Math.random() * 1,
          baseY: sprite.position.y,
          offset: Math.random() * Math.PI * 2,
        };
        scene.add(sprite);
        foods.push(sprite);
      }

      const clock = new THREE.Clock();
      let running = true;

      function animate() {
        if (!running) return;
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        for (const s of foods) {
          s.material.rotation += s.userData.rotSpeed;
          s.position.y = s.userData.baseY + Math.sin(t * s.userData.floatSpeed + s.userData.offset) * s.userData.floatAmp;
        }

        renderer.render(scene, camera);
      }

      // Only animate when visible
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          clock.start();
          animate();
        } else if (!entry.isIntersecting) {
          running = false;
        }
      }, { threshold: 0 });
      obs.observe(section);

      animate();

      window.addEventListener('resize', () => {
        const r = canvas.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
        renderer.setSize(r.width, r.height);
      });
    });
  }


  // ══════════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════════
  function init() {
    initFoodParticles();
    initHeroWaves();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
