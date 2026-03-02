/* ========================================
   🔧 SCENARIOS INFO - VERSÃO FINAL CORRIGIDA
   Pop-ups aparecem EMBAIXO com descrições curtas
   ======================================== */

const scenariosData = {
    'light-renovation': {
        name: 'Light Renovation',
        category: 'renovation',
        badge: 'Renovation',
        description: 'Minimal intervention with 90% reuse. Window upgrades, insulation, HVAC controls. 17.5-year cycle.',
        specs: { reuse: '90%', embodied: '10%', operational: '25%', lifespan: '17.5 yrs' },
        includes: ['Interior finishes', 'Minor HVAC', 'Window repairs'],
        excludes: ['Structural work', 'Full envelope']
    },
    'medium-renovation': {
        name: 'Medium Renovation',
        category: 'renovation',
        badge: 'Renovation',
        description: 'Envelope upgrade with 70% retention. Full HVAC replacement, interior reconfiguration. 22.5 years.',
        specs: { reuse: '70%', embodied: '27.5%', operational: '47.5%', lifespan: '22.5 yrs' },
        includes: ['Partial envelope', 'MEP upgrades', 'Enhanced insulation'],
        excludes: ['Complete facade', 'Full structural']
    },
    'deep-renovation': {
        name: 'Deep Renovation',
        category: 'renovation',
        badge: 'Renovation',
        description: 'Full envelope rebuild, 52.5% structure retained. Triple glazing, HRV>85%. 30-year performance.',
        specs: { reuse: '52.5%', embodied: '45%', operational: '70%', lifespan: '30 yrs' },
        includes: ['Full envelope', 'MEP renewal', 'Renewables'],
        excludes: ['Structure replacement']
    },
    'deep-renovation-demolition': {
        name: 'Deep + Partial Demo',
        category: 'renovation',
        badge: 'Renovation',
        description: 'Core retained (42.5%), full interior rebuild. Open plan modifications. 35-year lifespan.',
        specs: { reuse: '42.5%', embodied: '55%', operational: '75%', lifespan: '35 yrs' },
        includes: ['Core retention', 'Interior demo', 'Full envelope'],
        excludes: ['Foundation demo']
    },
    'code-compliant-new': {
        name: 'Code-Compliant New',
        category: 'newbuild',
        badge: 'New Build',
        description: 'EPB 2026 minimum compliance. Standard materials, conventional construction. 40-year baseline.',
        specs: { reuse: '2.5%', embodied: '97.5%', operational: '84%', lifespan: '40 yrs' },
        includes: ['Code-minimum envelope', 'Standard HVAC'],
        excludes: ['Advanced systems']
    },
    'high-performance-new': {
        name: 'High-Performance New',
        category: 'newbuild',
        badge: 'New Build',
        description: 'Passivhaus-standard with heat pump COP>4, HRV>85%. Enhanced envelope. 50 years.',
        specs: { reuse: '10%', embodied: '82.5%', operational: '94%', lifespan: '50 yrs' },
        includes: ['Enhanced envelope', 'High-efficiency HVAC', 'Solar PV'],
        excludes: ['Mass timber']
    },
    'low-carbon-new': {
        name: 'Low-Carbon New',
        category: 'newbuild',
        badge: 'New Build',
        description: 'Mass timber, U<0.15, >50% recycled content. Near net-zero with PV. 60-year trajectory.',
        specs: { reuse: '22.5%', embodied: '65%', operational: '98%', lifespan: '60 yrs' },
        includes: ['Mass timber', 'U<0.15', '>50% recycled'],
        excludes: ['High-carbon materials']
    }
};

document.addEventListener('DOMContentLoaded', function() {
    setupMethodologyTabs();
    setupScenarioPills();
    console.log('✅ Scenarios info loaded - SHORT descriptions, pop-ups BELOW pills');
});

function setupMethodologyTabs() {
    const tabBtns = document.querySelectorAll('.methodology-tabs-container .tab-btn');
    const tabContents = document.querySelectorAll('.methodology-tabs-container .tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
                console.log(`✅ Tab "${targetTab}" activated`);
            }
        });
    });
}

function setupScenarioPills() {
    const pills = document.querySelectorAll('.scenario-pill-compact');
    
    pills.forEach(pill => {
        pill.addEventListener('click', function() {
            const scenario = pill.dataset.scenario;
            const category = pill.dataset.category;
            const data = scenariosData[scenario];
            
            if (!data) {
                console.error(`❌ Scenario "${scenario}" not found!`);
                return;
            }
            
            const containerRenovation = document.getElementById('popup-renovation');
            const containerNewbuild = document.getElementById('popup-newbuild');
            
            if (!containerRenovation || !containerNewbuild) {
                console.error('❌ Pop-up containers not found!');
                return;
            }
            
            const targetContainer = category === 'renovation' ? containerRenovation : containerNewbuild;
            const isActive = pill.classList.contains('active');
            
            // Fecha todos os pop-ups
            document.querySelectorAll('.scenario-pill-compact').forEach(p => p.classList.remove('active'));
            containerRenovation.classList.remove('visible');
            containerNewbuild.classList.remove('visible');
            
            // Se já estava ativo, só fecha
            if (isActive) {
                console.log(`🔴 Closed pop-up: ${scenario}`);
                return;
            }
            
            // Abre o novo pop-up
            pill.classList.add('active');
            
            const popupHTML = `
                <div class="scenario-detail-popup">
                    <div class="detail-header">
                        <div class="detail-title-group">
                            <span class="scenario-badge ${category}">${data.badge}</span>
                            <h3>${data.name}</h3>
                        </div>
                        <button class="detail-close-btn" onclick="closeScenarioPopup()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                    
                    <p class="detail-description">${data.description}</p>
                    
                    <div class="detail-specs">
                        <div class="spec-item">
                            <span class="spec-label">Reuse</span>
                            <span class="spec-value">${data.specs.reuse}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Embodied</span>
                            <span class="spec-value">${data.specs.embodied}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Operational</span>
                            <span class="spec-value">${data.specs.operational}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Lifespan</span>
                            <span class="spec-value">${data.specs.lifespan}</span>
                        </div>
                    </div>
                    
                    <div class="detail-lists">
                        <div class="detail-list">
                            <h4>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                Includes
                            </h4>
                            <ul>
                                ${data.includes.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="detail-list">
                            <h4>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="#ef4444" stroke-width="2"/>
                                </svg>
                                Excludes
                            </h4>
                            <ul>
                                ${data.excludes.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            
            targetContainer.innerHTML = popupHTML;
            
            // Animação de entrada
            setTimeout(() => {
                targetContainer.classList.add('visible');
                console.log(`🟢 Opened pop-up: ${scenario}`);
            }, 50);
        });
    });
}

function closeScenarioPopup() {
    document.querySelectorAll('.scenario-pill-compact').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.scenario-popup-container').forEach(c => {
        c.classList.remove('visible');
    });
    console.log('🔴 All pop-ups closed');
}

window.closeScenarioPopup = closeScenarioPopup;

console.log('✅ Scenarios info module loaded - FINAL VERSION');
