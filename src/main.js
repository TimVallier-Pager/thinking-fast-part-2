console.log('main.js starting to load...');

import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
console.log('THREE.js loaded:', THREE);

import { TWEEN } from 'https://unpkg.com/@tweenjs/tween.js@21.0.0/dist/tween.esm.js';
console.log('TWEEN loaded:', TWEEN);

import SpriteText from 'https://unpkg.com/three-spritetext@1.8.2/dist/three-spritetext.mjs';
console.log('SpriteText loaded:', SpriteText);

import { loadData, showPlanetCard, hidePlanetCard } from './ui.js';
console.log('UI functions loaded');

class GalaxyScene {
    constructor() {
        console.log('GalaxyScene constructor called');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.planets = [];
        this.planetData = [];
        this.hoveredPlanet = null;
        this.isZoomed = false;
        this.rotationEnabled = true;
        this.spaceship = null;
        
        this.init();
    }
    
    async init() {
        console.log('Initializing galaxy scene...');
        try {
            // Setup renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x000011, 1);
            document.getElementById('canvas-container').appendChild(this.renderer.domElement);
            
            // Setup camera
            this.camera.position.set(0, 2, 15);
            this.camera.lookAt(0, 0, 0);
            
            // Create starfield
            console.log('Creating starfield...');
            this.createStarfield();
            
            // Load data and create planets
            console.log('Loading data...');
            const data = await loadData();
            console.log('Data loaded:', data);
            
            if (!data || !data.planets || data.planets.length === 0) {
                throw new Error('No planet data loaded');
            }
            
            this.planetData = data.planets;
            console.log('Creating planets...');
            this.createPlanets();
            
            // Create spaceship
            console.log('Creating spaceship...');
            this.createSpaceship();
            
            // Setup controls
            console.log('Setting up controls...');
            this.setupControls();
            
            // Hide loading
            console.log('Galaxy loaded successfully!');
            document.getElementById('loading').style.display = 'none';
            
            // Start animation loop
            this.animate();
        } catch (error) {
            console.error('Error initializing galaxy:', error);
            document.getElementById('loading').textContent = `Error: ${error.message}`;
        }
    }
    
    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ 
            color: 0xffffff,
            size: 0.5,
            sizeAttenuation: false
        });
        
        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }
    
    createPlanets() {
        const radius = 12;
        const planetCount = this.planetData.length;
        
        this.planetData.forEach((planetInfo, index) => {
            // Calculate position on circle
            const angle = (index / planetCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Create planet sphere
            const geometry = new THREE.SphereGeometry(1, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color: planetInfo.color,
                shininess: 100,
                transparent: true,
                opacity: 0.9
            });
            const planet = new THREE.Mesh(geometry, material);
            planet.position.set(x, 0, z);
            planet.userData = { planetInfo, originalColor: planetInfo.color };
            
            // Add glow effect material for hover
            const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: planetInfo.color,
                transparent: true,
                opacity: 0,
                side: THREE.BackSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            planet.add(glow);
            planet.userData.glow = glow;
            
            this.scene.add(planet);
            
            // Create floating text
            const sprite = new SpriteText(`Ch ${planetInfo.number}: ${planetInfo.title}`);
            sprite.position.set(x, 2.5, z);
            sprite.color = planetInfo.color;
            sprite.textHeight = 0.3;
            sprite.fontFace = 'Arial, sans-serif';
            this.scene.add(sprite);
            
            this.planets.push(planet);
        });
    }
    
    createSpaceship() {
        const group = new THREE.Group();
        
        // Main body (cone)
        const coneGeometry = new THREE.ConeGeometry(0.2, 1, 8);
        const coneMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.rotation.x = Math.PI / 2;
        group.add(cone);
        
        // Engines (cylinders)
        const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 8);
        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        
        const engine1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        engine1.position.set(-0.3, -0.3, 0);
        engine1.rotation.x = Math.PI / 2;
        group.add(engine1);
        
        const engine2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        engine2.position.set(0.3, -0.3, 0);
        engine2.rotation.x = Math.PI / 2;
        group.add(engine2);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.3);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = -0.2;
        group.add(wings);
        
        group.position.set(0, -5, 0);
        group.visible = false;
        this.scene.add(group);
        this.spaceship = group;
    }
    
    setupControls() {
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        // Mouse controls
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        const onMouseMove = (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.planets);
            
            // Reset previous hover
            if (this.hoveredPlanet && this.hoveredPlanet !== intersects[0]?.object) {
                this.hoveredPlanet.userData.glow.material.opacity = 0;
                this.hoveredPlanet = null;
                document.body.style.cursor = 'default';
            }
            
            // Set new hover
            if (intersects.length > 0 && !this.isZoomed) {
                this.hoveredPlanet = intersects[0].object;
                this.hoveredPlanet.userData.glow.material.opacity = 0.3;
                document.body.style.cursor = 'pointer';
            }
        };
        
        const onMouseClick = (event) => {
            if (this.isZoomed) return;
            
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.planets);
            
            if (intersects.length > 0) {
                this.zoomToPlanet(intersects[0].object);
            }
        };
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onMouseClick);
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    zoomToPlanet(planet) {
        this.isZoomed = true;
        this.rotationEnabled = false;
        
        // Hide hero UI
        document.getElementById('hero-ui').style.opacity = '0';
        
        // Calculate zoom position
        const planetPos = planet.position.clone();
        const direction = planetPos.clone().normalize();
        const zoomDistance = 8;
        const targetPos = direction.multiplyScalar(zoomDistance);
        
        // Camera zoom animation
        new TWEEN.Tween(this.camera.position)
            .to(targetPos, 1500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.camera.lookAt(planetPos);
            })
            .onComplete(() => {
                // Show spaceship and animate it
                this.animateSpaceship(planetPos, () => {
                    showPlanetCard(planet.userData.planetInfo);
                });
            })
            .start();
    }
    
    animateSpaceship(targetPos, onComplete) {
        this.spaceship.visible = true;
        this.spaceship.position.set(this.camera.position.x, this.camera.position.y - 2, this.camera.position.z);
        
        // Look at target
        this.spaceship.lookAt(targetPos);
        
        // Animate spaceship flying
        const midPoint = this.camera.position.clone().lerp(targetPos, 0.6);
        midPoint.y += 1;
        
        new TWEEN.Tween(this.spaceship.position)
            .to(midPoint, 800)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.spaceship.lookAt(targetPos);
            })
            .chain(
                new TWEEN.Tween(this.spaceship.position)
                    .to({ x: targetPos.x * 0.8, y: targetPos.y, z: targetPos.z * 0.8 }, 600)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onComplete(() => {
                        this.spaceship.visible = false;
                        onComplete();
                    })
            )
            .start();
    }
    
    returnToGalaxy() {
        this.isZoomed = false;
        
        // Hide planet card
        hidePlanetCard();
        
        // Reset camera
        new TWEEN.Tween(this.camera.position)
            .to({ x: 0, y: 2, z: 15 }, 1500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.camera.lookAt(0, 0, 0);
            })
            .onComplete(() => {
                this.rotationEnabled = true;
                document.getElementById('hero-ui').style.opacity = '1';
            })
            .start();
            
        // Reset any hover effects
        if (this.hoveredPlanet) {
            this.hoveredPlanet.userData.glow.material.opacity = 0;
            this.hoveredPlanet = null;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update tweens
        TWEEN.update();
        
        // Rotate scene slowly when not zoomed
        if (this.rotationEnabled && !this.isZoomed) {
            this.scene.rotation.y += 0.002;
        }
        
        // Rotate planets on their axis
        this.planets.forEach(planet => {
            planet.rotation.y += 0.01;
        });
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the galaxy scene
const galaxy = new GalaxyScene();

// Export for UI to access
window.galaxy = galaxy; 