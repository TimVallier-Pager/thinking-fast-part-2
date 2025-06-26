import { heroData, planetsData } from './data.js';

export async function loadData() {
    console.log('loadData() called');
    try {
        console.log('Using embedded data instead of YAML files');
        console.log('Hero data:', heroData);
        console.log('Planets data:', planetsData);
        
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
        console.error('Stack trace:', error.stack);
        return { planets: [] };
    }
}

export function showPlanetCard(planetInfo) {
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
    
    // Setup back button if not already done
    const backButton = card.querySelector('.back-button');
    if (!backButton.hasEventListener) {
        backButton.addEventListener('click', () => {
            window.galaxy.returnToGalaxy();
        });
        backButton.hasEventListener = true;
    }
}

export function hidePlanetCard() {
    const card = document.getElementById('planet-card');
    card.classList.remove('show');
} 