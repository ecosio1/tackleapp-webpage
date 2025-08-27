class WaveAnimation {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      particles: options.particles || 3000,
      pointSize: options.pointSize || 1.5,
      waveSpeed: options.waveSpeed || 2.0,
      waveIntensity: options.waveIntensity || 8.0,
      particleColor: options.particleColor || "#2D7FF9",
      gridDistance: options.gridDistance || 6,
      ...options
    };
    
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.mesh = null;
    this.animationId = null;
    this.clock = null;
    
    this.init();
  }
  
  init() {
    if (!window.THREE) {
      console.error('THREE.js is required for WaveAnimation');
      return;
    }
    
    const w = this.options.width || this.container.clientWidth;
    const h = this.options.height || this.container.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x000000, 0); // transparent
    this.renderer.setPixelRatio(dpr);
    
    this.container.appendChild(this.renderer.domElement);
    
    // Setup camera
    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = h / 2 / Math.tan(fovRad);
    
    this.camera = new THREE.PerspectiveCamera(fov, w / h, 1, dist * 2);
    this.camera.position.set(0, 0, 10);
    
    // Setup scene
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    
    // Create wave geometry
    this.createWave();
    
    // Start animation
    this.animate();
    
    // Handle resize
    this.handleResize = () => {
      if (!this.options.width && !this.options.height) {
        const newW = this.container.clientWidth;
        const newH = this.container.clientHeight;
        this.camera.aspect = newW / newH;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(newW, newH);
      }
    };
    
    window.addEventListener('resize', this.handleResize);
  }
  
  createWave() {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    
    const w = this.options.width || this.container.clientWidth;
    const h = this.options.height || this.container.clientHeight;
    const gridWidth = 400 * (w / h);
    const depth = 400;
    
    for (let x = 0; x < gridWidth; x += this.options.gridDistance) {
      for (let z = 0; z < depth; z += this.options.gridDistance) {
        positions.push(-gridWidth / 2 + x, -30, -depth / 2 + z);
      }
    }
    
    const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
    geo.setAttribute("position", positionAttribute);
    
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_point_size: { value: this.options.pointSize },
        u_color: { value: new THREE.Color(this.options.particleColor) },
      },
      vertexShader: `
        #define M_PI 3.1415926535897932384626433832795
        precision mediump float;
        uniform float u_time;
        uniform float u_point_size;
        
        void main() {
          vec3 p = position;
          p.y += (
            cos(p.x / M_PI * ${this.options.waveIntensity.toFixed(1)} + u_time * ${this.options.waveSpeed.toFixed(1)}) +
            sin(p.z / M_PI * ${this.options.waveIntensity.toFixed(1)} + u_time * ${this.options.waveSpeed.toFixed(1)})
          );
          gl_PointSize = u_point_size;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 u_color;
        
        void main() {
          gl_FragColor = vec4(u_color, 0.6);
        }
      `,
    });
    
    this.mesh = new THREE.Points(geo, mat);
    this.scene.add(this.mesh);
  }
  
  animate() {
    if (!this.renderer || !this.scene || !this.camera) return;
    
    const time = this.clock.getElapsedTime();
    if (this.mesh) {
      this.mesh.material.uniforms.u_time.value = time;
    }
    
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    if (this.renderer) {
      if (this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
    }
    
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}

// Make WaveAnimation available globally
window.WaveAnimation = WaveAnimation;

// Usage example:
// const container = document.getElementById('wave-container');
// const wave = new WaveAnimation(container, {
//   waveSpeed: 2.5,
//   waveIntensity: 12.0,
//   particleColor: "#2D7FF9",
//   pointSize: 2.0
// });