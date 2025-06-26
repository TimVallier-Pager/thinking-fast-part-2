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
            color: "#F9C74F",
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
            color: "#F9844A",
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
            color: "#90BE6D",
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
            color: "#43AA8B",
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
            color: "#577590",
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
            color: "#277DA1",
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
            color: "#4D908E",
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
            color: "#F94144",
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
            color: "#F3722C",
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
        this.hoveredPlanet = null;
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
        // Grid pattern with random variations (statistical sampling) - brightened
        ctx.fillStyle = `rgb(${Math.min(255, r * 1.5)}, ${Math.min(255, g * 1.5)}, ${Math.min(255, b * 1.5)})`;
        ctx.fillRect(0, 0, 512, 512);
        
        const gridSize = 32;
        for (let x = 0; x < 512; x += gridSize) {
            for (let y = 0; y < 512; y += gridSize) {
                const intensity = Math.random() * 0.5 + 0.5; // Brighter range
                const shade = Math.floor(intensity * 50); // Less contrast
                ctx.fillStyle = `rgba(${Math.max(100, r + shade)}, ${Math.max(100, g + shade)}, ${Math.max(100, b + shade)}, 0.9)`;
                ctx.fillRect(x, y, gridSize, gridSize);
                
                // Add small dots for data points
                if (Math.random() > 0.7) {
                    ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
                    ctx.beginPath();
                    ctx.arc(x + gridSize/2, y + gridSize/2, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    createCrystallineTexture(ctx, r, g, b) {
        // Angular, geometric crystal patterns
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, 512, 512);
        
        // Create angular crystal facets
        for (let i = 0; i < 50; i++) {
            const centerX = Math.random() * 512;
            const centerY = Math.random() * 512;
            const size = Math.random() * 40 + 20;
            const sides = Math.floor(Math.random() * 4) + 3;
            
            ctx.beginPath();
            for (let j = 0; j < sides; j++) {
                const angle = (j / sides) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * size;
                const y = centerY + Math.sin(angle) * size;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            
            const brightness = Math.random() * 0.5 + 0.5;
            ctx.fillStyle = `rgba(${Math.floor(r * brightness)}, ${Math.floor(g * brightness)}, ${Math.floor(b * brightness)}, 0.7)`;
            ctx.fill();
        }
    }
    
    createCloudTexture(ctx, r, g, b) {
        // Swirling cloud patterns using noise - brightened
        ctx.fillStyle = `rgb(${Math.min(255, r * 1.4)}, ${Math.min(255, g * 1.4)}, ${Math.min(255, b * 1.4)})`;
        ctx.fillRect(0, 0, 512, 512);
        
        // Create multiple cloud layers
        for (let layer = 0; layer < 3; layer++) {
            for (let x = 0; x < 512; x += 4) {
                for (let y = 0; y < 512; y += 4) {
                    const noise = Math.sin(x * 0.01 + layer) * Math.cos(y * 0.01 + layer) * 0.5 + 0.5;
                    const swirl = Math.sin((x + y) * 0.02 + layer * 2) * 0.3 + 0.7;
                    const opacity = (noise * swirl * 0.6) + 0.3; // Brighter and more opaque
                    
                    ctx.fillStyle = `rgba(${Math.min(255, Math.floor(r * 1.6))}, ${Math.min(255, Math.floor(g * 1.6))}, ${Math.min(255, Math.floor(b * 1.6))}, ${opacity})`;
                    ctx.fillRect(x, y, 4, 4);
                }
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
        // Simple noise texture
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, 512, 512);
        
        for (let x = 0; x < 512; x += 4) {
            for (let y = 0; y < 512; y += 4) {
                const noise = Math.random() * 0.3 + 0.7;
                ctx.fillStyle = `rgb(${Math.floor(r * noise)}, ${Math.floor(g * noise)}, ${Math.floor(b * noise)})`;
                ctx.fillRect(x, y, 4, 4);
            }
        }
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
                shininess: 100,
                transparent: true,
                opacity: 0.9,
                emissive: new THREE.Color(planetInfo.color).multiplyScalar(0.2), // Add self-illumination
                emissiveMap: texture,
                emissiveIntensity: 0.3
            });
            const planet = new THREE.Mesh(geometry, material);
            planet.position.set(x, 0, z);
            
            // Store orbital data with physics-based orbital speeds (inner planets faster)
            planet.userData = { 
                planetInfo, 
                originalColor: planetInfo.color,
                orbitalAngle: initialAngle,
                orbitalRadius: radius,
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
            
            // Reset previous hover
            if (this.hoveredPlanet && this.hoveredPlanet !== intersects[0]?.object) {
                this.hoveredPlanet.userData.glow.material.opacity = 0;
                this.hoveredPlanet = null;
                document.body.style.cursor = 'default';
            }
            
            // Set new hover only if not zoomed AND modal is not visible
            if (intersects.length > 0 && !this.isZoomed && !isModalVisible) {
                this.hoveredPlanet = intersects[0].object;
                this.hoveredPlanet.userData.glow.material.opacity = 0.3;
                document.body.style.cursor = 'pointer';
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
                // Show planet card immediately
                showPlanetCard(planet.userData.planetInfo);
            })
            .start();
    }
    

    
    returnToGalaxy() {
        console.log('returnToGalaxy called - immediate reset');
        
        // Reset all flags immediately
        this.isZoomed = false;
        this.rotationEnabled = true;
        
        // Hide planet card immediately
        hidePlanetCard();
        
        // Show hero UI immediately
        document.getElementById('hero-ui').style.opacity = '1';
        
        // Reset camera to initial position immediately (no animation)
        this.camera.position.set(0, 8, 18);
        this.camera.lookAt(0, 0, 0);
        
        // Reset any hover effects
        if (this.hoveredPlanet) {
            this.hoveredPlanet.userData.glow.material.opacity = 0;
            this.hoveredPlanet = null;
        }
        
        // Reset cursor
        document.body.style.cursor = 'default';
        
        console.log('returnToGalaxy complete - back to galaxy view');
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update tweens
        TWEEN.update();
        
        // Update planet positions and rotations when not zoomed
        if (this.rotationEnabled && !this.isZoomed) {
            this.planets.forEach(planet => {
                // Update orbital position (planets orbiting around center)
                planet.userData.orbitalAngle += planet.userData.orbitalSpeed;
                const x = Math.cos(planet.userData.orbitalAngle) * planet.userData.orbitalRadius;
                const z = Math.sin(planet.userData.orbitalAngle) * planet.userData.orbitalRadius;
                planet.position.set(x, 0, z);
                
                // Update sprite position to follow planet
                if (planet.userData.sprite) {
                    planet.userData.sprite.position.set(x, 2.5, z);
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