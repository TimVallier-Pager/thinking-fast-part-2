console.log('app.js starting...');

// Data (converted from YAML)
const heroData = {
    hero: {
        title: "Galaxy of Biases",
        subtitle: "Leadership lessons from *Thinking, Fast and Slow* – Part 2",
        cta: "Click a planet to start your journey",
        meta: {
            description: "An interactive Three-js galaxy that helps leaders spot & tame heuristics and biases from Kahneman's Part 2 (Ch 10-18)."
        }
    }
};

const planetsData = {
    planets: [
        {
            id: "ch10",
            number: 10,
            title: "Law of Small Numbers",
            color: "#FF00FF", // Electric Magenta
            summary: "Small samples mislead. Insist on adequate data before calling a trend.",
            actions: [
                "Delay big bets until you have more than a handful of data points.",
                "Ask 'is this difference real or just random?' in every metrics review.",
                "Build a culture that prioritises statistical thinking."
            ]
        },
        {
            id: "ch11",
            number: 11,
            title: "Anchoring",
            color: "#00FFFF", // Electric Cyan
            summary: "First numbers pull estimates like gravity—often by ~50 %.",
            actions: [
                "Surface ranges *before* anyone names a single figure.",
                "Train teams to 'argue the opposite' to counter arbitrary anchors.",
                "Challenge anchors in negotiations with fresh reference points."
            ]
        },
        {
            id: "ch12",
            number: 12,
            title: "Availability Heuristic",
            color: "#00FF00", // Electric Lime
            summary: "What's vivid feels frequent. Recency ≠ reality.",
            actions: [
                "Check long-run data before reacting to a loud anecdote.",
                "Ask: 'Is it truly common, or just easy to recall?'",
                "Highlight quiet facts to balance memorable stories."
            ]
        },
        {
            id: "ch13",
            number: 13,
            title: "Emotion, Availability & Risk",
            color: "#FFFF00", // Electric Yellow
            summary: "Feelings hijack risk perception and fuel media cascades.",
            actions: [
                "Separate fear-driven talk-tracks from statistical threat levels.",
                "Calibrate tiny probabilities—don't ignore *or* overreact.",
                "Address rumours early with comparative context."
            ]
        },
        {
            id: "ch14",
            number: 14,
            title: "Representativeness",
            color: "#FF6600", // Electric Orange
            summary: "Stereotypes > statistics in our heads. Base-rate neglect is costly.",
            actions: [
                "Anchor forecasts on historical base rates, then adjust.",
                "Fight gut 'fit' instincts when hiring or scoping projects.",
                "Use Bayesian checklists: How diagnostic is this evidence?"
            ]
        },
        {
            id: "ch15",
            number: 15,
            title: "Conjunction Fallacy",
            color: "#6600FF", // Electric Purple
            summary: "Detailed stories feel likely but compound improbabilities.",
            actions: [
                "Beware multi-condition plans—each 'and' slashes odds.",
                "Keep scenarios simple; layer detail *after* core viability.",
                "Teach teams to separate plausibility from probability."
            ]
        },
        {
            id: "ch16",
            number: 16,
            title: "Causes Trump Statistics",
            color: "#FF0066", // Electric Pink
            summary: "We invent causes for noise and see patterns in randomness.",
            actions: [
                "Ask 'could this just be variance?' before credit or blame.",
                "Normalise talking about luck alongside skill.",
                "Use premortems to expose multiple possible futures."
            ]
        },
        {
            id: "ch17",
            number: 17,
            title: "Regression to Mean",
            color: "#0066FF", // Electric Blue
            summary: "Extremes fade naturally; interventions often get false credit.",
            actions: [
                "Don't over-penalise single bad months—or over-celebrate spikes.",
                "Compare interventions to baseline variation, not anecdotes.",
                "Keep reinforcing good behaviour; don't let regression fool you."
            ]
        },
        {
            id: "ch18",
            number: 18,
            title: "Taming Intuitive Predictions",
            color: "#00FF66", // Electric Mint
            summary: "Gut forecasts ignore evidence quality—temper them with base rates.",
            actions: [
                "Start every estimate with the outside-view average.",
                "Shrink bold forecasts by the evidence's real correlation.",
                "State confidence intervals publicly to model uncertainty."
            ]
        }
    ]
};

// UI Functions
function loadData() {
    console.log('loadData() called');
    try {
        console.log('Using embedded data');
        
        // Update hero UI
        const heroUI = document.getElementById('hero-ui');
        heroUI.querySelector('h1').textContent = heroData.hero.title;
        heroUI.querySelector('p:nth-of-type(1) em').textContent = heroData.hero.subtitle;
        heroUI.querySelector('p:nth-of-type(2)').textContent = heroData.hero.cta;
        
        // Update page title and meta
        document.title = heroData.hero.title;
        document.querySelector('meta[name="description"]').setAttribute('content', heroData.hero.meta.description);
        
        return planetsData;
    } catch (error) {
        console.error('Error loading data:', error);
        return { planets: [] };
    }
}

function showPlanetCard(planetInfo) {
    const card = document.getElementById('planet-card');
    const title = card.querySelector('.planet-title');
    const summary = card.querySelector('.planet-summary');
    const actionsList = card.querySelector('.actions-list');
    
    // Set content
    title.textContent = `Ch ${planetInfo.number}: ${planetInfo.title}`;
    title.style.color = planetInfo.color;
    summary.textContent = planetInfo.summary;
    
    // Clear and populate actions
    actionsList.innerHTML = '';
    planetInfo.actions.forEach(action => {
        const li = document.createElement('li');
        li.textContent = action;
        actionsList.appendChild(li);
    });
    
    // Show card
    card.classList.add('show');
    
    // Ensure back button works by adding event listener each time
    const backButton = card.querySelector('.back-button');
    if (backButton) {
        // Remove any existing listeners and add fresh one
        backButton.onclick = () => {
            console.log('Back button clicked via showPlanetCard');
            if (window.galaxy) {
                window.galaxy.returnToGalaxy();
            }
        };
    }
}

function hidePlanetCard() {
    const card = document.getElementById('planet-card');
    card.classList.remove('show');
}

// Galaxy Scene Class
class GalaxyScene {
    constructor() {
        console.log('GalaxyScene constructor called');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.planets = [];
        this.planetData = [];
        this.currentPlanet = null; // Track which planet is currently being viewed
        this.explodedPlanets = new Set(); // Track which planets have been exploded
        this.respawningPlanets = false; // Track if planets are currently respawning
        this.isZoomed = false;
        this.rotationEnabled = true;
        this.init();
    }
    
    async init() {
        console.log('Initializing galaxy scene...');
        try {
            // Setup renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x000011, 1);
            document.getElementById('canvas-container').appendChild(this.renderer.domElement);
            
            // Setup camera - elevated view to see the galaxy from above/side
            this.camera.position.set(0, 8, 18);
            this.camera.lookAt(0, 0, 0);
            
            // Create starfield
            console.log('Creating starfield...');
            this.createStarfield();
            
            // Create central sun
            console.log('Creating central sun...');
            this.createSun();
            
            // Load data and create planets
            console.log('Loading data...');
            const data = loadData();
            console.log('Data loaded:', data);
            
            if (!data || !data.planets || data.planets.length === 0) {
                throw new Error('No planet data loaded');
            }
            
            this.planetData = data.planets;
            console.log('Creating planets...');
            this.createPlanets();
            
            // Spaceship removed for simplicity
            
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
        // Regular twinkling stars
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 8000;
        const starsVertices = [];
        const colors = [];
        const sizes = [];
        
        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
            
            // Varied star colors (white, blue-white, yellow-white)
            const colorVariation = Math.random();
            if (colorVariation < 0.7) {
                colors.push(1.0, 1.0, 1.0); // White
            } else if (colorVariation < 0.9) {
                colors.push(0.8, 0.9, 1.0); // Blue-white
            } else {
                colors.push(1.0, 1.0, 0.8); // Yellow-white
            }
            
            sizes.push(Math.random() * 2 + 0.5); // Varied sizes
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        const starsMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            size: 1,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.8
        });
        
        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
        
        // Create sparkly bright stars
        this.createSparklyStars();
        
        // Create shooting stars
        this.createShootingStars();
    }
    
    createSparklyStars() {
        this.sparklyStars = [];
        const sparklyCount = 50;
        
        for (let i = 0; i < sparklyCount; i++) {
            const starGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const starMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.3, 0.9),
                transparent: true,
                opacity: Math.random() * 0.8 + 0.2
            });
            
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 150
            );
            
            // Store animation data
            star.userData = {
                originalOpacity: starMaterial.opacity,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2
            };
            
            this.sparklyStars.push(star);
            this.scene.add(star);
        }
    }
    
    createShootingStars() {
        this.shootingStars = [];
        this.shootingStarTimer = 0;
    }
    
    createShootingStar() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6); // 2 points for a line
        
        // Random starting position
        const startX = (Math.random() - 0.5) * 100;
        const startY = (Math.random() - 0.5) * 100;
        const startZ = (Math.random() - 0.5) * 100;
        
        positions[0] = startX;
        positions[1] = startY;
        positions[2] = startZ;
        positions[3] = startX;
        positions[4] = startY;
        positions[5] = startZ;
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1
        });
        
        const shootingStar = new THREE.Line(geometry, material);
        
        // Random direction
        const direction = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize();
        
        shootingStar.userData = {
            direction: direction,
            speed: Math.random() * 0.5 + 0.3,
            life: 0,
            maxLife: Math.random() * 60 + 30
        };
        
        this.shootingStars.push(shootingStar);
        this.scene.add(shootingStar);
    }
    
    createPlanetTexture(planetInfo) {
        // Create a canvas for procedural texture generation
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base color from planet info - brightened for visibility
        const baseColor = new THREE.Color(planetInfo.color);
        const r = Math.min(255, Math.floor(baseColor.r * 255 * 1.2));
        const g = Math.min(255, Math.floor(baseColor.g * 255 * 1.2));
        const b = Math.min(255, Math.floor(baseColor.b * 255 * 1.2));
        
        // Create different texture patterns based on chapter theme
        switch(planetInfo.number) {
            case 10: // Law of Small Numbers - Statistical patterns
                this.createStatisticalTexture(ctx, r, g, b);
                break;
            case 11: // Anchoring - Crystalline/geometric patterns
                this.createCrystallineTexture(ctx, r, g, b);
                break;
            case 12: // Availability Heuristic - Swirling clouds
                this.createCloudTexture(ctx, r, g, b);
                break;
            case 13: // Representativeness - Marble/veined patterns
                this.createMarbleTexture(ctx, r, g, b);
                break;
            case 14: // Conjunction Fallacy - Layered sedimentary
                this.createLayeredTexture(ctx, r, g, b);
                break;
            case 15: // Causal Thinking - Lightning/fractal patterns
                this.createLightningTexture(ctx, r, g, b);
                break;
            case 16: // Regression to Mean - Wave interference patterns
                this.createWaveTexture(ctx, r, g, b);
                break;
            case 17: // Overconfidence - Volcanic/lava patterns
                this.createVolcanicTexture(ctx, r, g, b);
                break;
            case 18: // Intuitive Predictions - Organic/cellular patterns
                this.createOrganicTexture(ctx, r, g, b);
                break;
            default:
                this.createDefaultTexture(ctx, r, g, b);
        }
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;
        
        return texture;
    }
    
    createStatisticalTexture(ctx, r, g, b) {
        // ELECTRIC MAGENTA STATISTICAL FLOW - Seamless like Ch 14 but with data patterns
        ctx.fillStyle = '#220022'; // Dark magenta background
        ctx.fillRect(0, 0, 512, 512);
        
        // Create flowing statistical layers with electric magenta
        const layers = 15;
        for (let i = 0; i < layers; i++) {
            const y = (i / layers) * 512;
            const height = 512 / layers + Math.random() * 20 - 10;
            
            // Electric magenta with brightness variations
            const magentaIntensity = 0.8 + Math.random() * 0.4;
            const brightness = 150 + Math.random() * 105;
            
            const layerR = Math.min(255, brightness + 50); // Strong magenta red
            const layerG = Math.min(255, brightness * 0.3); // Minimal green
            const layerB = Math.min(255, brightness + 30); // Strong magenta blue
            
            ctx.fillStyle = `rgb(${layerR}, ${layerG}, ${layerB})`;
            ctx.fillRect(0, y, 512, height);
            
            // Add statistical data points across the layer
            for (let x = 0; x < 512; x += 8) {
                if (Math.random() > 0.4) {
                    const dataPointIntensity = 0.9 + Math.random() * 0.3;
                    const pointR = Math.min(255, layerR * dataPointIntensity + 40);
                    const pointG = Math.min(255, layerG * dataPointIntensity + 10);
                    const pointB = Math.min(255, layerB * dataPointIntensity + 30);
                    
                    ctx.fillStyle = `rgba(${pointR}, ${pointG}, ${pointB}, 0.8)`;
                    ctx.fillRect(x, y, 8, height);
                }
            }
            
            // Add bright electric magenta highlights
            ctx.fillStyle = `rgba(255, 50, 255, 0.7)`;
            ctx.fillRect(0, y, 512, 3);
            ctx.fillStyle = `rgba(255, 100, 255, 0.9)`;
            ctx.fillRect(0, y + 1, 512, 1);
            
            // Scatter statistical dots
            for (let dots = 0; dots < 8; dots++) {
                const dotX = Math.random() * 512;
                const dotY = y + Math.random() * height;
                ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
                ctx.shadowColor = `rgba(255, 0, 255, 0.8)`;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        
        // Add overall electric magenta glow
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
        gradient.addColorStop(0, `rgba(255, 0, 255, 0.3)`);
        gradient.addColorStop(1, `rgba(200, 0, 200, 0.1)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
    }
    
    createCrystallineTexture(ctx, r, g, b) {
        // RAINBOW PRISM CRYSTALS - Electric Cyan base
        ctx.fillStyle = '#001122'; // Dark crystal background
        ctx.fillRect(0, 0, 512, 512);
        
        // Create angular rainbow crystal facets
        for (let i = 0; i < 80; i++) {
            const centerX = Math.random() * 512;
            const centerY = Math.random() * 512;
            const size = Math.random() * 50 + 25;
            const sides = Math.floor(Math.random() * 4) + 3;
            
            // Rainbow hue based on position and randomness
            const hue = (centerX / 512 * 180 + centerY / 512 * 180) % 360;
            const saturation = 85 + Math.random() * 15;
            const lightness = 50 + Math.random() * 40;
            
            ctx.beginPath();
            for (let j = 0; j < sides; j++) {
                const angle = (j / sides) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * size;
                const y = centerY + Math.sin(angle) * size;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            
            // Rainbow crystal with glow
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Inner bright core
            ctx.beginPath();
            for (let j = 0; j < sides; j++) {
                const angle = (j / sides) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * size * 0.4;
                const y = centerY + Math.sin(angle) * size * 0.4;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fillStyle = `hsl(${hue}, 100%, 85%)`;
            ctx.fill();
        }
    }
    
    createCloudTexture(ctx, r, g, b) {
        // RAINBOW NEBULA CLOUDS - Electric Lime base
        ctx.fillStyle = '#002200'; // Dark space background
        ctx.fillRect(0, 0, 512, 512);
        
        // Create multiple rainbow cloud layers
        for (let layer = 0; layer < 4; layer++) {
            for (let x = 0; x < 512; x += 3) {
                for (let y = 0; y < 512; y += 3) {
                    const noise = Math.sin(x * 0.008 + layer) * Math.cos(y * 0.008 + layer) * 0.5 + 0.5;
                    const swirl = Math.sin((x + y) * 0.015 + layer * 2) * 0.4 + 0.6;
                    const opacity = (noise * swirl * 0.8) + 0.2;
                    
                    // Rainbow based on noise and position
                    const hue = (noise * 360 + (x + y) / 1024 * 180 + layer * 90) % 360;
                    const saturation = 70 + Math.random() * 30;
                    const lightness = 40 + noise * 50;
                    
                    ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
                    ctx.fillRect(x, y, 6, 6);
                    
                    // Add bright sparkles
                    if (Math.random() > 0.97) {
                        ctx.fillStyle = `hsla(${hue}, 100%, 90%, 0.9)`;
                        ctx.fillRect(x, y, 3, 3);
                    }
                }
            }
        }
        
        // Add rainbow spiral overlay
        const centerX = 256;
        const centerY = 256;
        for (let r = 0; r < 200; r += 2) {
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const x = centerX + Math.cos(angle + r * 0.02) * r;
                const y = centerY + Math.sin(angle + r * 0.02) * r;
                const hue = (angle / (Math.PI * 2) * 360 + r) % 360;
                const opacity = (200 - r) / 200 * 0.3;
                
                ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${opacity})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }
    }
    
    createMarbleTexture(ctx, r, g, b) {
        // Marble-like veined patterns - brightened
        ctx.fillStyle = `rgb(${Math.min(255, r * 1.3)}, ${Math.min(255, g * 1.3)}, ${Math.min(255, b * 1.3)})`;
        ctx.fillRect(0, 0, 512, 512);
        
        // Create veining with brighter contrast
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${Math.min(255, Math.floor(r * 1.2))}, ${Math.min(255, Math.floor(g * 1.2))}, ${Math.min(255, Math.floor(b * 1.2))}, 0.9)`;
            ctx.lineWidth = Math.random() * 3 + 1;
            
            let x = Math.random() * 512;
            let y = Math.random() * 512;
            ctx.moveTo(x, y);
            
            for (let j = 0; j < 20; j++) {
                x += (Math.random() - 0.5) * 30;
                y += (Math.random() - 0.5) * 30;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        // Add bright highlights
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
            ctx.lineWidth = Math.random() * 2 + 0.5;
            
            let x = Math.random() * 512;
            let y = Math.random() * 512;
            ctx.moveTo(x, y);
            
            for (let j = 0; j < 15; j++) {
                x += (Math.random() - 0.5) * 25;
                y += (Math.random() - 0.5) * 25;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    
    createLayeredTexture(ctx, r, g, b) {
        // Sedimentary rock layers - VERY bright warm tones for Chapter 14
        // Force warm colors to distinguish from blue Chapter 15
        const warmR = Math.min(255, Math.max(r * 2.5, 180)); // Force bright warm red
        const warmG = Math.min(255, Math.max(g * 2.2, 140)); // Bright warm yellow/orange
        const warmB = Math.min(255, Math.max(b * 1.5, 80));  // Reduce blue, keep some warmth
        
        ctx.fillStyle = `rgb(${warmR}, ${warmG}, ${warmB})`;
        ctx.fillRect(0, 0, 512, 512);
        
        // Create horizontal layers with very bright warm variations
        const layers = 12;
        for (let i = 0; i < layers; i++) {
            const y = (i / layers) * 512;
            const height = 512 / layers + Math.random() * 15 - 7;
            const brightness = 1.5 + Math.random() * 1.0; // VERY bright range
            
            // Ensure warm colors - add extra red/yellow
            const layerR = Math.min(255, Math.floor(warmR * brightness) + 30);
            const layerG = Math.min(255, Math.floor(warmG * brightness) + 20);
            const layerB = Math.min(255, Math.floor(warmB * brightness));
            
            ctx.fillStyle = `rgb(${layerR}, ${layerG}, ${layerB})`;
            ctx.fillRect(0, y, 512, height);
            
            // Add very bright warm highlights
            for (let x = 0; x < 512; x += 6) {
                if (Math.random() > 0.4) { // Much more frequent highlights
                    const highlightR = Math.min(255, layerR + 50);
                    const highlightG = Math.min(255, layerG + 40);
                    const highlightB = Math.min(255, layerB + 10);
                    ctx.fillStyle = `rgba(${highlightR}, ${highlightG}, ${highlightB}, 0.9)`;
                    ctx.fillRect(x, y, 6, height);
                }
            }
            
            // Add bright golden layer edges
            ctx.fillStyle = `rgba(255, 220, 100, 0.7)`;
            ctx.fillRect(0, y, 512, 3);
            ctx.fillStyle = `rgba(255, 255, 255, 0.5)`;
            ctx.fillRect(0, y + 1, 512, 1);
        }
        
        // Add overall warm glow
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
        gradient.addColorStop(0, `rgba(255, 200, 100, 0.3)`);
        gradient.addColorStop(1, `rgba(255, 150, 50, 0.1)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
    }
    
    createLightningTexture(ctx, r, g, b) {
        // Fractal lightning/branching patterns - VERY bright cool electric blue for Chapter 15
        // Force cool electric colors to distinguish from warm Chapter 14
        const electricR = Math.min(255, Math.max(r * 1.2, 60));  // Reduce red for cool tones
        const electricG = Math.min(255, Math.max(g * 2.5, 150)); // Bright electric green/cyan
        const electricB = Math.min(255, Math.max(b * 3.0, 220)); // VERY bright electric blue
        
        // Create electric storm background
        ctx.fillStyle = `rgb(${electricR}, ${electricG}, ${electricB})`;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add multiple electric background glows
        for (let i = 0; i < 5; i++) {
            const centerX = Math.random() * 512;
            const centerY = Math.random() * 512;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
            gradient.addColorStop(0, `rgba(100, 200, 255, 0.8)`); // Bright electric blue center
            gradient.addColorStop(0.5, `rgba(${electricR}, ${electricG}, ${electricB}, 0.6)`);
            gradient.addColorStop(1, `rgba(${electricR}, ${electricG}, ${electricB}, 0.2)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 512);
        }
        
        // Create many branching lightning patterns - VERY bright electric
        for (let i = 0; i < 18; i++) { // Many more lightning branches
            this.drawLightningBranch(ctx, Math.random() * 512, Math.random() * 512, 0, Math.random() * Math.PI * 2, 120, electricR, electricG, electricB);
        }
        
        // Add electric sparkles
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 4 + 2;
            
            ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = `rgba(150, 220, 255, 0.7)`;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawLightningBranch(ctx, x, y, depth, angle, length, r, g, b) {
        if (depth > 6 || length < 8) return;
        
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        // Draw VERY bright electric lightning with multiple layers
        // Outer glow
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 - depth * 0.08})`;
        ctx.lineWidth = Math.max(4, 10 - depth); // Very thick outer glow
        ctx.stroke();
        
        // Middle electric layer
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(${Math.min(255, r + 100)}, ${Math.min(255, g + 180)}, ${Math.min(255, b + 200)}, ${0.8 - depth * 0.08})`;
        ctx.lineWidth = Math.max(2, 6 - depth);
        ctx.stroke();
        
        // Bright white core
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 - depth * 0.08})`;
        ctx.lineWidth = Math.max(1, 3 - depth);
        ctx.stroke();
        
        // Create more frequent branches for electric effect
        if (Math.random() > 0.3) { // Much more frequent branching
            this.drawLightningBranch(ctx, endX, endY, depth + 1, angle + Math.random() * 1.2 - 0.6, length * 0.75, r, g, b);
        }
        if (Math.random() > 0.5) {
            this.drawLightningBranch(ctx, endX, endY, depth + 1, angle - Math.random() * 1.2 + 0.6, length * 0.65, r, g, b);
        }
        if (Math.random() > 0.8) { // Additional random branch
            this.drawLightningBranch(ctx, endX, endY, depth + 1, angle + Math.random() * Math.PI - Math.PI/2, length * 0.5, r, g, b);
        }
    }
    
    createWaveTexture(ctx, r, g, b) {
        // Wave interference patterns - much brighter for Chapter 16
        ctx.fillStyle = `rgb(${Math.min(255, r * 1.7)}, ${Math.min(255, g * 1.7)}, ${Math.min(255, b * 1.7)})`;
        ctx.fillRect(0, 0, 512, 512);
        
        // Create bright interference pattern
        for (let x = 0; x < 512; x += 2) {
            for (let y = 0; y < 512; y += 2) {
                const wave1 = Math.sin(x * 0.02) * Math.sin(y * 0.02);
                const wave2 = Math.sin((x + 100) * 0.015) * Math.sin((y + 100) * 0.015);
                const wave3 = Math.sin((x + 200) * 0.018) * Math.sin((y + 200) * 0.018); // Third wave
                const interference = (wave1 + wave2 + wave3) / 3 * 0.5 + 0.5;
                
                const brightness = 1.0 + interference * 1.2; // Much brighter range
                ctx.fillStyle = `rgb(${Math.min(255, Math.floor(r * brightness))}, ${Math.min(255, Math.floor(g * brightness))}, ${Math.min(255, Math.floor(b * brightness))})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }
        
        // Add bright wave crests
        for (let i = 0; i < 8; i++) {
            const centerX = Math.random() * 512;
            const centerY = Math.random() * 512;
            const radius = Math.random() * 80 + 40;
            
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0.6)`);
            gradient.addColorStop(0.5, `rgba(${Math.min(255, r * 2)}, ${Math.min(255, g * 2)}, ${Math.min(255, b * 2)}, 0.4)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    createVolcanicTexture(ctx, r, g, b) {
        // Lava/volcanic rock texture
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, 512, 512);
        
        // Create lava flows
        for (let i = 0; i < 30; i++) {
            const startX = Math.random() * 512;
            const startY = Math.random() * 512;
            const size = Math.random() * 40 + 20;
            
            const gradient = ctx.createRadialGradient(startX, startY, 0, startX, startY, size);
            gradient.addColorStop(0, `rgba(${Math.min(255, r + 100)}, ${Math.min(255, g + 50)}, ${b}, 0.9)`);
            gradient.addColorStop(1, `rgba(${Math.floor(r * 0.3)}, ${Math.floor(g * 0.3)}, ${Math.floor(b * 0.3)}, 0.3)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(startX, startY, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add cracks
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${Math.floor(r * 0.2)}, ${Math.floor(g * 0.2)}, ${Math.floor(b * 0.2)}, 0.8)`;
            ctx.lineWidth = Math.random() * 2 + 1;
            
            let x = Math.random() * 512;
            let y = Math.random() * 512;
            ctx.moveTo(x, y);
            
            for (let j = 0; j < 10; j++) {
                x += (Math.random() - 0.5) * 40;
                y += (Math.random() - 0.5) * 40;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    
    createOrganicTexture(ctx, r, g, b) {
        // Organic cellular patterns
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, 512, 512);
        
        // Create cellular structure
        for (let i = 0; i < 100; i++) {
            const centerX = Math.random() * 512;
            const centerY = Math.random() * 512;
            const size = Math.random() * 25 + 10;
            
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
            gradient.addColorStop(0, `rgba(${Math.floor(r * 1.3)}, ${Math.floor(g * 1.3)}, ${Math.floor(b * 1.3)}, 0.6)`);
            gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.4)`);
            gradient.addColorStop(1, `rgba(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)}, 0.2)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    createDefaultTexture(ctx, r, g, b) {
        // PSYCHEDELIC RAINBOW EXPLOSION - Electric Colors
        ctx.fillStyle = '#000000'; // Pure black background
        ctx.fillRect(0, 0, 512, 512);
        
        // Create radial rainbow burst
        const centerX = 256;
        const centerY = 256;
        
        for (let x = 0; x < 512; x += 2) {
            for (let y = 0; y < 512; y += 2) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const angle = Math.atan2(y - centerY, x - centerX);
                
                // Rainbow based on angle and distance
                const hue = (angle + Math.PI) / (2 * Math.PI) * 360 + distance * 2;
                const saturation = 100;
                const lightness = 30 + Math.sin(distance * 0.1) * 40 + Math.random() * 30;
                
                // Psychedelic patterns
                const pattern1 = Math.sin(x * 0.05) * Math.cos(y * 0.05);
                const pattern2 = Math.sin(distance * 0.1 + angle * 3);
                const intensity = (pattern1 + pattern2 + 2) / 4;
                
                const finalLightness = lightness * intensity;
                
                ctx.fillStyle = `hsl(${hue % 360}, ${saturation}%, ${Math.min(90, finalLightness)}%)`;
                ctx.fillRect(x, y, 3, 3);
                
                // Add electric sparkles
                if (Math.random() > 0.95) {
                    ctx.fillStyle = `hsl(${hue % 360}, 100%, 95%)`;
                    ctx.shadowColor = `hsl(${hue % 360}, 100%, 70%)`;
                    ctx.shadowBlur = 10;
                    ctx.fillRect(x, y, 4, 4);
                    ctx.shadowBlur = 0;
                }
            }
        }
    }
    
    createPlanetRings(planet, planetInfo) {
        // Create Saturn-like rings for certain planets
        const ringColors = [
            { inner: 1.3, outer: 1.6, color: new THREE.Color(planetInfo.color).multiplyScalar(0.8), opacity: 0.6 },
            { inner: 1.7, outer: 2.0, color: new THREE.Color(planetInfo.color).multiplyScalar(1.1), opacity: 0.4 },
            { inner: 2.1, outer: 2.3, color: new THREE.Color(planetInfo.color).multiplyScalar(0.9), opacity: 0.5 }
        ];
        
        ringColors.forEach((ring, index) => {
            const ringGeometry = new THREE.RingGeometry(ring.inner, ring.outer, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: ring.color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: ring.opacity,
                emissive: ring.color.clone().multiplyScalar(0.2)
            });
            
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3; // Slight random tilt
            ringMesh.rotation.z = Math.random() * 0.2; // Random rotation
            
            planet.add(ringMesh);
            
            // Store ring reference for cleanup during explosion
            if (!planet.userData.rings) planet.userData.rings = [];
            planet.userData.rings.push(ringMesh);
        });
    }
    
    createPlanets() {
        const planetCount = this.planetData.length;
        
        this.planetData.forEach((planetInfo, index) => {
            // Calculate orbital radius based on chapter number with larger gaps to prevent collisions
            const chapterNumber = planetInfo.number;
            const minRadius = 6;   // Chapter 10 distance
            const maxRadius = 12;  // Chapter 18 distance (kept within camera view)
            // Add extra spacing to ensure no overlap even with largest planets + glow
            const radius = minRadius + ((chapterNumber - 10) / (18 - 10)) * (maxRadius - minRadius);
            
            // Calculate initial position on circle
            const initialAngle = (index / planetCount) * Math.PI * 2;
            const x = Math.cos(initialAngle) * radius;
            const z = Math.sin(initialAngle) * radius;
            
            // Create planet sphere with unique texture and smaller size variation to prevent collisions
            const baseSize = 0.8; // Reduced base size
            const sizeVariation = 0.9 + Math.random() * 0.2; // Smaller variation: 0.9 to 1.1
            const planetSize = baseSize * sizeVariation;
            
            const geometry = new THREE.SphereGeometry(planetSize, 32, 32);
            const texture = this.createPlanetTexture(planetInfo);
            const material = new THREE.MeshPhongMaterial({ 
                map: texture,
                color: planetInfo.color,
                shininess: 300, // Much shinier for neon effect
                transparent: true,
                opacity: 1.0, // Full opacity for vibrant colors
                emissive: new THREE.Color(planetInfo.color).multiplyScalar(0.4), // Stronger self-illumination
                emissiveMap: texture,
                emissiveIntensity: 0.6 // Much brighter emission
            });
            const planet = new THREE.Mesh(geometry, material);
            planet.position.set(x, 0, z);
            
            // Add orbital tilt to some planets for 3D depth (25% tilt range)
            let orbitalTilt = 0;
            if (planetInfo.number === 11 || planetInfo.number === 13 || planetInfo.number === 16 || planetInfo.number === 18) {
                // Tilt certain planets by +/- 25 degrees for visual interest
                orbitalTilt = (Math.random() - 0.5) * Math.PI * 0.28; // ±25 degrees in radians
            }
            
            // Store orbital data with physics-based orbital speeds (inner planets faster)
            planet.userData = { 
                planetInfo, 
                originalColor: planetInfo.color,
                orbitalAngle: initialAngle,
                orbitalRadius: radius,
                orbitalTilt: orbitalTilt, // Store the tilt angle
                // Orbital speed inversely proportional to radius (like real physics)
                // This prevents faster outer planets from catching inner ones
                orbitalSpeed: (0.008 / Math.sqrt(radius)) * 0.25, // Physics-based + reduced by 75%
                spinSpeed: (0.01 + (Math.random() * 0.02)) * 0.25 // Reduced by 75%
            };
            
            // Add glow effect material for hover - scaled to planet size but smaller to reduce collision area
            const glowSize = planetSize * 1.1; // Glow is only 10% larger than planet (reduced from 20%)
            const glowGeometry = new THREE.SphereGeometry(glowSize, 32, 32);
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
            
            // Add rings to Chapter 17 only (Regression to Mean - like Saturn)
            if (planetInfo.number === 17) {
                this.createPlanetRings(planet, planetInfo);
            }
            
            // Create floating text with background for better readability
            const sprite = new SpriteText(`Ch ${planetInfo.number}: ${planetInfo.title}`);
            sprite.position.set(x, 2.5, z);
            sprite.color = planetInfo.color;
            sprite.textHeight = 0.3;
            sprite.fontFace = 'Arial, sans-serif';
            sprite.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background
            sprite.padding = 0.1; // Add some padding around the text
            planet.userData.sprite = sprite; // Link sprite to planet for movement
            this.scene.add(sprite);
            
            this.planets.push(planet);
        });
    }
    
    createSun() {
        // Create sun sphere
        const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700, // Gold color
            transparent: false
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(0, 0, 0);
        this.scene.add(sun);
        
        // Add sun glow effect
        const glowGeometry = new THREE.SphereGeometry(2.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        sun.add(sunGlow);
        
        // Add larger outer glow
        const outerGlowGeometry = new THREE.SphereGeometry(3.2, 32, 32);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFA500,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        sun.add(outerGlow);
        
        this.sun = sun;
    }
 
    
    setupControls() {
        // Add lighting - sun as primary light source
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        
        // Point light from the sun
        const sunLight = new THREE.PointLight(0xFFD700, 1.2, 100);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
        
        // Additional directional light for better planet visibility
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
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
            
            // Check if modal is currently showing
            const planetCard = document.getElementById('planet-card');
            const isModalVisible = planetCard && planetCard.classList.contains('show');
            
            // Set cursor style based on hover state
            if (intersects.length > 0 && !this.isZoomed && !isModalVisible) {
                document.body.style.cursor = 'pointer';
            } else {
                document.body.style.cursor = 'default';
            }
        };
        
        const onMouseClick = (event) => {
            // Don't allow planet clicks if zoomed OR if modal is currently showing
            const planetCard = document.getElementById('planet-card');
            const isModalVisible = planetCard && planetCard.classList.contains('show');
            
            if (this.isZoomed || isModalVisible) return;
            
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
        
        // Setup back button - ensure it's properly bound
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                console.log('Back button clicked');
                this.returnToGalaxy();
            });
        } else {
            console.warn('Back button not found');
        }
        
        // Setup explode all button
        const explodeAllButton = document.getElementById('explode-all-btn');
        if (explodeAllButton) {
            explodeAllButton.addEventListener('click', () => {
                console.log('Explode All button clicked');
                this.explodeAllPlanets();
            });
        }
        
        // Setup explode sun button
        const explodeSunButton = document.getElementById('explode-sun-btn');
        if (explodeSunButton) {
            explodeSunButton.addEventListener('click', () => {
                console.log('Explode Sun button clicked');
                this.showConfirmModal();
            });
        }
        
        // Setup modal event listeners
        this.setupModalListeners();
    }
    
    zoomToPlanet(planet) {
        this.isZoomed = true;
        this.rotationEnabled = false;
        this.currentPlanet = planet; // Store reference to current planet
        
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
                // Show planet card immediately
                showPlanetCard(planet.userData.planetInfo);
            })
            .start();
    }
    
    returnToGalaxy() {
        console.log('returnToGalaxy called - exploding planet!');
        
        // If there's a current planet, explode it!
        if (this.currentPlanet && !this.explodedPlanets.has(this.currentPlanet.userData.planetInfo.id)) {
            this.explodePlanet(this.currentPlanet);
        }
        
        // Reset all flags immediately
        this.isZoomed = false;
        this.rotationEnabled = true;
        this.currentPlanet = null;
        
        // Hide planet card immediately
        hidePlanetCard();
        
        // Show hero UI immediately
        document.getElementById('hero-ui').style.opacity = '1';
        
        // Reset camera to initial position immediately (no animation)
        this.camera.position.set(0, 8, 18);
        this.camera.lookAt(0, 0, 0);
        
        // Reset cursor
        document.body.style.cursor = 'default';
        
        console.log('returnToGalaxy complete - back to galaxy view');
    }
    
    explodePlanet(planet) {
        console.log('Exploding planet:', planet.userData.planetInfo.title);
        
        // Mark this planet as exploded
        this.explodedPlanets.add(planet.userData.planetInfo.id);
        
        // Create explosion particles
        const particleCount = 50;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        const colors = new Float32Array(particleCount * 3);
        
        // Get planet's color for particles
        const planetColor = new THREE.Color(planet.userData.planetInfo.color);
        
        for (let i = 0; i < particleCount; i++) {
            // Start particles at planet position
            positions[i * 3] = planet.position.x;
            positions[i * 3 + 1] = planet.position.y;
            positions[i * 3 + 2] = planet.position.z;
            
            // Random velocities in all directions
            velocities.push({
                x: (Math.random() - 0.5) * 0.2,
                y: (Math.random() - 0.5) * 0.2,
                z: (Math.random() - 0.5) * 0.2
            });
            
            // Mix of planet color and bright explosion colors
            const explosionIntensity = Math.random();
            if (explosionIntensity > 0.7) {
                // Bright yellow/orange explosion colors
                colors[i * 3] = 1; // R
                colors[i * 3 + 1] = 0.8; // G
                colors[i * 3 + 2] = 0.2; // B
            } else {
                // Planet's original color
                colors[i * 3] = planetColor.r;
                colors[i * 3 + 1] = planetColor.g;
                colors[i * 3 + 2] = planetColor.b;
            }
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 1
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        
        // Animate the explosion
        let explosionTime = 0;
        const explosionDuration = 120; // frames
        
        const animateExplosion = () => {
            explosionTime++;
            
            // Update particle positions
            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;
                
                // Add gravity effect
                velocities[i].y -= 0.001;
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
            
            // Fade out over time
            const fadeProgress = explosionTime / explosionDuration;
            particleMaterial.opacity = Math.max(0, 1 - fadeProgress);
            particleMaterial.size = 0.1 + (fadeProgress * 0.05); // Particles get slightly bigger
            
            if (explosionTime < explosionDuration) {
                requestAnimationFrame(animateExplosion);
            } else {
                // Clean up
                this.scene.remove(particleSystem);
                particles.dispose();
                particleMaterial.dispose();
            }
        };
        
        animateExplosion();
        
        // Remove the planet from the scene
        this.scene.remove(planet);
        
        // Remove planet's sprite/label if it exists
        if (planet.userData.sprite) {
            this.scene.remove(planet.userData.sprite);
        }
        
        // Remove planet's glow effect if it exists
        if (planet.userData.glow) {
            this.scene.remove(planet.userData.glow);
        }
        
        // Remove planet's rings if they exist
        if (planet.userData.rings) {
            planet.userData.rings.forEach(ring => {
                planet.remove(ring);
                ring.geometry.dispose();
                ring.material.dispose();
            });
        }
        
        // Remove from planets array
        const planetIndex = this.planets.indexOf(planet);
        if (planetIndex > -1) {
            this.planets.splice(planetIndex, 1);
        }
        
        console.log('Planet exploded and removed from galaxy!');
    }
    
    explodeAllPlanets() {
        if (this.planets.length === 0) {
            console.log('No planets left to explode!');
            return;
        }
        
        console.log(`Exploding all ${this.planets.length} planets!`);
        
        // Make a copy of the planets array since we'll be modifying it
        const planetsToExplode = [...this.planets];
        
        // Explode each planet with a small delay for dramatic effect
        planetsToExplode.forEach((planet, index) => {
            setTimeout(() => {
                // Check if planet still exists (might have been individually exploded)
                if (this.planets.includes(planet) && !this.explodedPlanets.has(planet.userData.planetInfo.id)) {
                    this.explodePlanet(planet);
                }
            }, index * 200); // 200ms delay between each explosion
        });
        
        // Hide the hero UI temporarily for better explosion viewing
        const heroUI = document.getElementById('hero-ui');
        heroUI.style.opacity = '0.3';
        
        // Restore hero UI after all explosions are done
        setTimeout(() => {
            heroUI.style.opacity = '1';
        }, planetsToExplode.length * 200 + 1000);
    }
    
    respawnAllPlanets() {
        if (this.respawningPlanets) return; // Prevent multiple respawns
        
        console.log('All planets destroyed! Respawning from the void...');
        this.respawningPlanets = true;
        
        // Clear the exploded planets set
        this.explodedPlanets.clear();
        
        // Get all original planet data
        const originalPlanets = this.planetData;
        const respawnDelay = 500; // ms between each planet respawn
        
        originalPlanets.forEach((planetInfo, index) => {
            setTimeout(() => {
                this.respawnPlanet(planetInfo, index === originalPlanets.length - 1);
            }, index * respawnDelay);
        });
    }
    
    respawnPlanet(planetInfo, isLastPlanet = false) {
        console.log('Respawning planet:', planetInfo.title);
        
        // Create the planet using the same logic as original creation
        const planetGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const planetTexture = this.createPlanetTexture(planetInfo);
        const planetMaterial = new THREE.MeshLambertMaterial({ map: planetTexture });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // Calculate original orbital position
        const angle = (planetInfo.number - 10) * (Math.PI * 2 / 9);
        const radius = 12 + Math.sin(planetInfo.number * 0.5) * 2;
        const targetX = Math.cos(angle) * radius;
        const targetZ = Math.sin(angle) * radius;
        
        // Start the planet way outside the galaxy
        const startDistance = 50;
        const startAngle = angle + Math.PI; // Come from the opposite side
        planet.position.set(
            Math.cos(startAngle) * startDistance,
            Math.random() * 10 - 5, // Random height for dramatic effect
            Math.sin(startAngle) * startDistance
        );
        
        // Add orbital tilt to some planets for 3D depth (25% tilt range)
        let orbitalTilt = 0;
        if (planetInfo.number === 11 || planetInfo.number === 13 || planetInfo.number === 16 || planetInfo.number === 18) {
            // Tilt certain planets by +/- 25 degrees for visual interest
            orbitalTilt = (Math.random() - 0.5) * Math.PI * 0.28; // ±25 degrees in radians
        }
        
        // Set up planet data
        planet.userData = {
            planetInfo: planetInfo,
            orbitalAngle: angle,
            orbitalRadius: radius,
            orbitalTilt: orbitalTilt, // Store the tilt angle
            // Orbital speed inversely proportional to radius (like real physics)
            // This prevents faster outer planets from catching inner ones
            orbitalSpeed: (0.008 / Math.sqrt(radius)) * 0.25, // Physics-based + reduced by 75%
            spinSpeed: (0.01 + (Math.random() * 0.02)) * 0.25 // Reduced by 75%
        };
        
        // Create glow effect
        const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: planetInfo.color,
            transparent: true,
            opacity: 0,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(planet.position);
        planet.userData.glow = glow;
        
        // Create planet label
        const sprite = new SpriteText(`Ch ${planetInfo.number}: ${planetInfo.title}`);
        sprite.material.depthWrite = false;
        sprite.color = planetInfo.color;
        sprite.textHeight = 0.8;
        sprite.position.copy(planet.position);
        sprite.position.y += 2.5;
        planet.userData.sprite = sprite;
        
        // Add to scene
        this.scene.add(planet);
        this.scene.add(glow);
        this.scene.add(sprite);
        this.planets.push(planet);
        
        // Add rings to Chapter 17 only (Regression to Mean - like Saturn)
        if (planetInfo.number === 17) {
            this.createPlanetRings(planet, planetInfo);
        }
        
        // Calculate final Y position based on orbital tilt
        let finalY = 0;
        if (orbitalTilt !== 0) {
            finalY = targetZ * Math.sin(orbitalTilt);
            targetZ = targetZ * Math.cos(orbitalTilt);
        }
        
        // Animate planet flying in from outer space
        const flyInDuration = 2000; // 2 seconds
        new TWEEN.Tween(planet.position)
            .to({ x: targetX, y: finalY, z: targetZ }, flyInDuration)
            .easing(TWEEN.Easing.Cubic.Out)
            .onUpdate(() => {
                // Update glow and sprite positions during flight
                glow.position.copy(planet.position);
                sprite.position.copy(planet.position);
                sprite.position.y += 2.5;
            })
            .onComplete(() => {
                console.log('Planet respawned:', planetInfo.title);
                
                // If this is the last planet, re-enable normal operations
                if (isLastPlanet) {
                    this.respawningPlanets = false;
                    console.log('All planets have returned to the galaxy!');
                }
            })
            .start();
        
        // Add some particle trails during the flight for extra drama
        this.createRespawnTrail(planet, flyInDuration);
    }
    
    createRespawnTrail(planet, duration) {
        const trailParticles = 20;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(trailParticles * 3);
        const colors = new Float32Array(trailParticles * 3);
        
        // Get planet color
        const planetColor = new THREE.Color(planet.userData.planetInfo.color);
        
        for (let i = 0; i < trailParticles; i++) {
            // Start particles at planet position
            positions[i * 3] = planet.position.x;
            positions[i * 3 + 1] = planet.position.y;
            positions[i * 3 + 2] = planet.position.z;
            
            // Use planet color with some sparkle
            colors[i * 3] = planetColor.r;
            colors[i * 3 + 1] = planetColor.g;
            colors[i * 3 + 2] = planetColor.b;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const trailMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const trailSystem = new THREE.Points(particles, trailMaterial);
        this.scene.add(trailSystem);
        
        // Animate trail following the planet
        let trailTime = 0;
        const maxTrailTime = duration / 16.67; // Convert to frames (assuming 60fps)
        
        const animateTrail = () => {
            trailTime++;
            
            // Update trail positions to follow behind the planet
            const positions = trailSystem.geometry.attributes.position.array;
            for (let i = trailParticles - 1; i > 0; i--) {
                // Move each particle to the position of the one in front
                positions[i * 3] = positions[(i - 1) * 3];
                positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
                positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
            }
            
            // Set the first particle to planet's current position
            positions[0] = planet.position.x;
            positions[1] = planet.position.y;
            positions[2] = planet.position.z;
            
            trailSystem.geometry.attributes.position.needsUpdate = true;
            
            // Fade out trail
            const fadeProgress = trailTime / maxTrailTime;
            trailMaterial.opacity = Math.max(0, 0.8 * (1 - fadeProgress));
            
            if (trailTime < maxTrailTime) {
                requestAnimationFrame(animateTrail);
            } else {
                // Clean up trail
                this.scene.remove(trailSystem);
                particles.dispose();
                trailMaterial.dispose();
            }
        };
        
        animateTrail();
    }
    
    setupModalListeners() {
        // First confirmation modal
        document.getElementById('confirm-yes').addEventListener('click', () => {
            this.hideConfirmModal();
            this.showFinalWarningModal();
        });
        
        document.getElementById('confirm-no').addEventListener('click', () => {
            this.hideConfirmModal();
        });
        
        // Final warning modal
        document.getElementById('final-yes').addEventListener('click', () => {
            this.hideFinalWarningModal();
            this.explodeSun();
        });
        
        document.getElementById('final-no').addEventListener('click', () => {
            this.hideFinalWarningModal();
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGalaxy();
        });
    }
    
    showConfirmModal() {
        document.getElementById('confirm-modal').classList.add('show');
    }
    
    hideConfirmModal() {
        document.getElementById('confirm-modal').classList.remove('show');
    }
    
    showFinalWarningModal() {
        document.getElementById('final-warning-modal').classList.add('show');
    }
    
    hideFinalWarningModal() {
        document.getElementById('final-warning-modal').classList.remove('show');
    }
    
    showGameOver() {
        document.getElementById('game-over').classList.add('show');
    }
    
    hideGameOver() {
        document.getElementById('game-over').classList.remove('show');
    }
    
    explodeSun() {
        console.log('💥 EXPLODING THE SUN! 💥');
        
        if (!this.sun) {
            console.log('No sun to explode!');
            return;
        }
        
        // Create massive sun explosion particles
        const particleCount = 200;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Start particles at sun position
            positions[i * 3] = this.sun.position.x;
            positions[i * 3 + 1] = this.sun.position.y;
            positions[i * 3 + 2] = this.sun.position.z;
            
            // Random velocities in all directions (much faster than planet explosions)
            velocities.push({
                x: (Math.random() - 0.5) * 0.8,
                y: (Math.random() - 0.5) * 0.8,
                z: (Math.random() - 0.5) * 0.8
            });
            
            // Sun explosion colors (bright yellows, oranges, reds)
            const explosionType = Math.random();
            if (explosionType > 0.6) {
                // Bright yellow core
                colors[i * 3] = 1; // R
                colors[i * 3 + 1] = 1; // G
                colors[i * 3 + 2] = 0.2; // B
            } else if (explosionType > 0.3) {
                // Orange explosion
                colors[i * 3] = 1; // R
                colors[i * 3 + 1] = 0.5; // G
                colors[i * 3 + 2] = 0; // B
            } else {
                // Red hot fragments
                colors[i * 3] = 1; // R
                colors[i * 3 + 1] = 0.2; // G
                colors[i * 3 + 2] = 0; // B
            }
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.3, // Much larger particles for sun explosion
            vertexColors: true,
            transparent: true,
            opacity: 1
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        
        // Animate the massive explosion
        let explosionTime = 0;
        const explosionDuration = 180; // Longer explosion
        
        const animateExplosion = () => {
            explosionTime++;
            
            // Update particle positions
            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;
                
                // Add some gravity and air resistance
                velocities[i].y -= 0.002;
                velocities[i].x *= 0.995;
                velocities[i].z *= 0.995;
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
            
            // Fade out over time
            const fadeProgress = explosionTime / explosionDuration;
            particleMaterial.opacity = Math.max(0, 1 - fadeProgress);
            particleMaterial.size = 0.3 + (fadeProgress * 0.2); // Particles get bigger as they spread
            
            if (explosionTime < explosionDuration) {
                requestAnimationFrame(animateExplosion);
            } else {
                // Clean up explosion
                this.scene.remove(particleSystem);
                particles.dispose();
                particleMaterial.dispose();
                
                // Show game over after explosion completes
                setTimeout(() => {
                    this.showGameOver();
                }, 500);
            }
        };
        
        animateExplosion();
        
        // Remove the sun immediately
        this.scene.remove(this.sun);
        this.sun = null;
        
        // Stop all planetary motion (sun gravity is gone!)
        this.rotationEnabled = false;
        
        // Scatter all remaining planets immediately after sun explosion
        this.scatterPlanets();
        
        console.log('The sun has been destroyed! Galaxy collapse imminent...');
    }
    
    scatterPlanets() {
        console.log('🌍💫 Scattering planets into the void...');
        
        // Scatter all remaining planets
        this.planets.forEach((planet, index) => {
            if (planet && planet.parent) {
                // Generate random scatter direction and speed
                const scatterDirection = new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ).normalize();
                
                // Vary scatter speed based on planet's original orbital distance
                const baseSpeed = 0.1 + (Math.random() * 0.1);
                const scatterVelocity = scatterDirection.multiplyScalar(baseSpeed);
                
                // Store scatter velocity in planet userData
                planet.userData.scatterVelocity = scatterVelocity;
                planet.userData.isScattering = true;
                
                // Add some random rotation to make it look more chaotic
                planet.userData.scatterRotation = {
                    x: (Math.random() - 0.5) * 0.1,
                    y: (Math.random() - 0.5) * 0.1,
                    z: (Math.random() - 0.5) * 0.1
                };
                
                // Also scatter the planet's sprite label
                if (planet.userData.sprite) {
                    planet.userData.sprite.userData.scatterVelocity = scatterVelocity.clone();
                    planet.userData.sprite.userData.isScattering = true;
                }
            }
        });
        
        // Start the scattering animation
        this.animateScattering();
    }
    
    animateScattering() {
        let scatteringPlanets = this.planets.filter(planet => planet.userData.isScattering);
        
        if (scatteringPlanets.length === 0) {
            return; // No more planets to scatter
        }
        
        scatteringPlanets.forEach(planet => {
            // Update planet position
            planet.position.add(planet.userData.scatterVelocity);
            
            // Add chaotic rotation
            planet.rotation.x += planet.userData.scatterRotation.x;
            planet.rotation.y += planet.userData.scatterRotation.y;
            planet.rotation.z += planet.userData.scatterRotation.z;
            
            // Update sprite position to follow planet
            if (planet.userData.sprite && planet.userData.sprite.userData.isScattering) {
                planet.userData.sprite.position.add(planet.userData.sprite.userData.scatterVelocity);
            }
            
            // Gradually fade out the planet as it gets farther away
            const distanceFromCenter = planet.position.length();
            if (distanceFromCenter > 50) {
                // Planet is too far away, mark it as scattered away
                planet.userData.isScattering = false;
                planet.visible = false;
                if (planet.userData.sprite) {
                    planet.userData.sprite.visible = false;
                }
            }
        });
        
        // Continue animation if there are still scattering planets
        if (scatteringPlanets.some(planet => planet.userData.isScattering)) {
            requestAnimationFrame(() => this.animateScattering());
        }
    }
    
    resetGalaxy() {
        console.log('🌟 Resetting Galaxy...');
        
        // Hide game over screen
        this.hideGameOver();
        
        // Clear the scene of any remaining particles or debris
        const objectsToRemove = [];
        this.scene.traverse((object) => {
            if (object.type === 'Points' || object.userData.isDebris) {
                objectsToRemove.push(object);
            }
        });
        
        objectsToRemove.forEach(object => {
            this.scene.remove(object);
            if (object.geometry) object.geometry.dispose();
            if (object.material) object.material.dispose();
        });
        
        // Reset planets array and exploded planets
        this.planets = [];
        this.explodedPlanets.clear();
        this.respawningPlanets = false;
        
        // Remove any existing planets and sprites
        const planetsToRemove = [];
        this.scene.traverse((object) => {
            if (object.userData && object.userData.planetInfo) {
                planetsToRemove.push(object);
            }
        });
        
        planetsToRemove.forEach(planet => {
            this.scene.remove(planet);
            if (planet.userData.sprite) {
                this.scene.remove(planet.userData.sprite);
            }
        });
        
        // Recreate the sun
        this.createSun();
        
        // Recreate all planets
        this.createPlanets();
        
        // Reset camera and controls
        this.isZoomed = false;
        this.rotationEnabled = true;
        this.currentPlanet = null;
        
        this.camera.position.set(0, 8, 18);
        this.camera.lookAt(0, 0, 0);
        
        // Show hero UI
        document.getElementById('hero-ui').style.opacity = '1';
        
        console.log('✨ Galaxy has been restored to its former glory!');
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update tweens
        TWEEN.update();
        
        // Check if all planets have been exploded and trigger respawn
        if (this.planets.length === 0 && !this.respawningPlanets && !this.isZoomed) {
            this.respawnAllPlanets();
        }
        
        // Update planet positions and rotations when not zoomed
        if (this.rotationEnabled && !this.isZoomed) {
            this.planets.forEach(planet => {
                // Update orbital position (planets orbiting around center)
                planet.userData.orbitalAngle += planet.userData.orbitalSpeed;
                
                // Calculate base orbital position
                const baseX = Math.cos(planet.userData.orbitalAngle) * planet.userData.orbitalRadius;
                const baseZ = Math.sin(planet.userData.orbitalAngle) * planet.userData.orbitalRadius;
                
                // Apply orbital tilt if this planet has one
                let x = baseX;
                let y = 0;
                let z = baseZ;
                
                if (planet.userData.orbitalTilt !== 0) {
                    // Rotate the orbital position around the X-axis by the tilt angle
                    y = baseZ * Math.sin(planet.userData.orbitalTilt);
                    z = baseZ * Math.cos(planet.userData.orbitalTilt);
                }
                
                planet.position.set(x, y, z);
                
                // Update sprite position to follow planet
                if (planet.userData.sprite) {
                    planet.userData.sprite.position.set(x, y + 2.5, z);
                }
                
                // Spin planet on its own axis
                planet.rotation.y += planet.userData.spinSpeed;
            });
        } else if (!this.isZoomed) {
            // Still spin planets on their axis even when orbital motion is paused
            this.planets.forEach(planet => {
                planet.rotation.y += planet.userData.spinSpeed;
            });
        }
        
        // Rotate the sun slowly
        if (this.sun) {
            this.sun.rotation.y += 0.001;
        }
        
        // Animate sparkly stars (twinkling effect) - slowed down by 95%
        if (this.sparklyStars) {
            this.sparklyStars.forEach(star => {
                const time = Date.now() * star.userData.twinkleSpeed * 0.05 + star.userData.twinkleOffset;
                const opacity = star.userData.originalOpacity * (0.5 + 0.5 * Math.sin(time));
                star.material.opacity = opacity;
                
                // Add subtle scale animation
                const scale = 1 + 0.3 * Math.sin(time * 1.5);
                star.scale.setScalar(scale);
            });
        }
        
        // Animate shooting stars - slowed down by 95%
        this.shootingStarTimer++;
        if (this.shootingStarTimer > 2400) { // Create new shooting star every 40 seconds at 60fps (was 2 seconds)
            this.createShootingStar();
            this.shootingStarTimer = 0;
        }
        
        // Update existing shooting stars - slowed down by 95%
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const shootingStar = this.shootingStars[i];
            const userData = shootingStar.userData;
            
            userData.life++;
            
            // Update position
            const positions = shootingStar.geometry.attributes.position.array;
            const tailLength = 5;
            
            // Move head of shooting star - slowed down by 95%
            positions[3] += userData.direction.x * userData.speed * 0.05;
            positions[4] += userData.direction.y * userData.speed * 0.05;
            positions[5] += userData.direction.z * userData.speed * 0.05;
            
            // Update tail to follow
            const progress = Math.min(userData.life / 400, 1); // Slowed down by 95% (was /20)
            positions[0] = positions[3] - userData.direction.x * tailLength * progress;
            positions[1] = positions[4] - userData.direction.y * tailLength * progress;
            positions[2] = positions[5] - userData.direction.z * tailLength * progress;
            
            shootingStar.geometry.attributes.position.needsUpdate = true;
            
            // Fade out - extended lifetime by 95%
            const fadeProgress = userData.life / (userData.maxLife * 20); // Extended lifetime
            shootingStar.material.opacity = Math.max(0, 1 - fadeProgress);
            
            // Remove when life expires - extended lifetime
            if (userData.life >= userData.maxLife * 20) {
                this.scene.remove(shootingStar);
                this.shootingStars.splice(i, 1);
            }
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when page loads
console.log('About to create galaxy...');
const galaxy = new GalaxyScene();
window.galaxy = galaxy; 