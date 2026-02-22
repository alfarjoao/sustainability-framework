/* ========================================
   BUILDING SUSTAINABILITY FRAMEWORK
   Calculator Logic - 6 Scenarios Comparison
   ======================================== */

// State Management
let currentStep = 1;
const totalSteps = 2;
let formData = {};

// 6 CENÁRIOS COM VALORES PLACEHOLDER (Valentine vai fornecer os reais)
const scenarioDefaults = {
    'light-renovation': {
        name: 'Light Renovation',
        reuseRate: 0.90,           // 90% material reuse
        embodiedFactor: 0.15,      // 15% of base embodied energy
        operationalImprovement: 0.25, // 25% operational improvement
        category: 'renovation'
    },
    'medium-renovation': {
        name: 'Medium Renovation',
        reuseRate: 0.70,           // 70% material reuse
        embodiedFactor: 0.35,      // 35% of base embodied energy
        operationalImprovement: 0.40, // 40% operational improvement
        category: 'renovation'
    },
    'deep-renovation': {
        name: 'Deep Renovation',
        reuseRate: 0.50,           // 50% material reuse
        embodiedFactor: 0.60,      // 60% of base embodied energy
        operationalImprovement: 0.55, // 55% operational improvement
        category: 'renovation'
    },
    'code-compliant-new': {
        name: 'Code-Compliant New Build',
        reuseRate: 0.10,           // 10% material reuse
        embodiedFactor: 1.50,      // 150% of base embodied energy
        operationalImprovement: 0.60, // 60% operational improvement
        category: 'newbuild'
    },
    'high-performance-new': {
        name: 'High-Performance New Build',
        reuseRate: 0.05,           // 5% material reuse
        embodiedFactor: 1.30,      // 130% of base embodied energy
        operationalImprovement: 0.75, // 75% operational improvement
        category: 'newbuild'
    },
    'low-carbon-new': {
        name: 'Low-Carbon New Build',
        reuseRate: 0.15,           // 15% material reuse (recycled materials)
        embodiedFactor: 0.90,      // 90% of base embodied energy (low-carbon materials)
        operationalImprovement: 0.80, // 80% operational improvement
        category: 'newbuild'
    }
};

// Material Factors
const materialFactors = {
    'concrete': 1.0,
    'steel': 1.3,
    'timber': 0.7,
    'masonry': 0.9,
    'mixed': 1.0
};

// Climate Multipliers
const climateMultipliers = {
    'cold': 1.2,
    'temperate': 1.0,
    'warm': 0.9,
    'hot': 1.1
};

// DOM Elements
const form = document.getElementById('calculator-form');
const btnNext = document.getElementById('btn-next');
const btnBack = document.getElementById('btn-back');
const formSections = document.querySelectorAll('.form-section');
const resultsSection = document.getElementById('results');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateUI();
    initTabs();
});

/* ========================================
   EVENT LISTENERS
   ======================================== */
function setupEventListeners() {
    // Navigation buttons
    btnNext.addEventListener('click', handleNext);
    btnBack.addEventListener('click', handleBack);

    // Real-time validation on ALL inputs (dropdowns + number fields)
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        // Validate on blur (when user leaves field)
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        // Validate on change (for dropdowns)
        input.addEventListener('change', function() {
            validateInput(this);
            if (this.value) {
                formData[this.name] = this.value;
            }
        });
        
        // Validate on input (for text/number inputs while typing)
        input.addEventListener('input', function() {
            if (this.value) {
                validateInput(this);
            }
        });
    });
}

/* ========================================
   REAL-TIME VALIDATION (SIMPLIFIED - NO MIN/MAX)
   ======================================== */
function validateInput(input) {
    const parentGroup = input.closest('.form-group');
    const errorMessage = parentGroup ? parentGroup.querySelector('.input-error-message') : null;
    
    // Clear previous state
    input.classList.remove('input-valid', 'input-invalid');
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }
    
    // Check if required and empty
    if (input.hasAttribute('required') && !input.value.trim()) {
        input.classList.add('input-invalid');
        if (errorMessage) {
            errorMessage.textContent = 'This field is required';
            errorMessage.style.display = 'block';
        }
        return false;
    }
    
    // Validation passed
    if (input.value.trim()) {
        input.classList.add('input-valid');
        if (errorMessage) errorMessage.style.display = 'none';
    }
    
    return true;
}

/* ========================================
   NAVIGATION
   ======================================== */
function handleNext() {
    if (validateCurrentStep()) {
        if (currentStep === totalSteps) {
            // Final step - calculate results
            calculateResults();
        } else {
            currentStep++;
            updateUI();
        }
    }
}

function handleBack() {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
    }
}

/* ========================================
   STEP VALIDATION
   ======================================== */
function validateCurrentStep() {
    const currentSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
    const requiredInputs = currentSection.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidInput = null;

    requiredInputs.forEach(input => {
        const inputValid = validateInput(input);
        
        if (!inputValid) {
            isValid = false;
            if (!firstInvalidInput) {
                firstInvalidInput = input;
            }
            
            // Shake animation for invalid inputs
            input.style.animation = 'shake 0.4s ease-in-out';
            setTimeout(() => {
                input.style.animation = '';
            }, 400);
        }
    });

    if (!isValid) {
        // Scroll to first invalid input
        if (firstInvalidInput) {
            firstInvalidInput.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstInvalidInput.focus();
        }
        
        // Show error notification
        showErrorNotification('Please correct the highlighted fields before continuing');
    }

    return isValid;
}

/* ========================================
   ERROR NOTIFICATION
   ======================================== */
function showErrorNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.validation-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'validation-notification';
    notification.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

/* ========================================
   UI UPDATES WITH SMOOTH TRANSITIONS
   ======================================== */
function updateUI() {
    // Fade out current section
    const currentSection = document.querySelector('.form-section.active');
    if (currentSection) {
        currentSection.style.opacity = '0';
        currentSection.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            currentSection.classList.remove('active');
            showNextSection();
        }, 150);
    } else {
        showNextSection();
    }
    
    // Update buttons
    updateButtons();
}

function showNextSection() {
    const nextSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
    
    if (nextSection) {
        // Reset styles for animation
        nextSection.style.opacity = '0';
        nextSection.style.transform = 'translateX(20px)';
        nextSection.classList.add('active');
        
        // Trigger animation
        setTimeout(() => {
            nextSection.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            nextSection.style.opacity = '1';
            nextSection.style.transform = 'translateX(0)';
        }, 50);
    }
}

function updateButtons() {
    // Update back button visibility
    if (currentStep === 1) {
        btnBack.style.opacity = '0';
        btnBack.style.transform = 'translateX(-10px)';
        setTimeout(() => {
            btnBack.style.display = 'none';
        }, 200);
    } else {
        btnBack.style.display = 'inline-flex';
        setTimeout(() => {
            btnBack.style.transition = 'all 0.3s ease';
            btnBack.style.opacity = '1';
            btnBack.style.transform = 'translateX(0)';
        }, 50);
    }
    
    // Update button text with smooth transition
    btnNext.style.opacity = '0.7';
    setTimeout(() => {
        if (currentStep === totalSteps) {
            btnNext.innerHTML = `
                Calculate Results
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        } else {
            btnNext.innerHTML = `
                Next Step
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }
        btnNext.style.transition = 'opacity 0.3s ease';
        btnNext.style.opacity = '1';
    }, 150);
}

/* ========================================
   CALCULATIONS - 6 SCENARIOS
   ======================================== */
function calculateResults() {
    // Show loading state
    btnNext.disabled = true;
    btnNext.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="60" stroke-dashoffset="20" opacity="0.25"/>
        </svg>
        Calculating...
    `;
    
    // Simulate calculation delay for smooth UX
    setTimeout(() => {
        performCalculation();
    }, 800);
}

function performCalculation() {
    // Get form data (agora todos são valores diretos de dropdowns)
    const area = parseFloat(formData.buildingArea);
    const lifespan = parseFloat(formData.lifespan);
    const embodiedEnergy = parseFloat(formData.embodiedEnergy);
    const operationalEnergy = parseFloat(formData.operationalEnergy);
    const material = formData.structuralMaterial;
    const climate = formData.climateZone;
    const userReuseRate = parseFloat(formData.reuseRate) / 100; // Convert % to decimal

    // Get multipliers
    const materialFactor = materialFactors[material] || 1.0;
    const climateFactor = climateMultipliers[climate] || 1.0;

    // CALCULAR OS 6 CENÁRIOS
    const scenarios = {};
    
    Object.keys(scenarioDefaults).forEach(scenarioKey => {
        const scenario = scenarioDefaults[scenarioKey];
        
        // Use user's reuse rate
        const reuseRate = userReuseRate;
        const embodiedFactor = scenario.embodiedFactor;
        const operationalImprovement = scenario.operationalImprovement;

        // EMBODIED CARBON
        const embodiedCarbon = embodiedEnergy * area * embodiedFactor * materialFactor * (1 - reuseRate);

        // OPERATIONAL CARBON
        const operationalCarbon = operationalEnergy * (1 - operationalImprovement) * area * climateFactor * lifespan * 0.5; // 0.5 = grid carbon intensity placeholder

        // TOTAL
        const totalCarbon = embodiedCarbon + operationalCarbon;

        scenarios[scenarioKey] = {
            name: scenario.name,
            category: scenario.category,
            embodiedCarbon: Math.round(embodiedCarbon),
            operationalCarbon: Math.round(operationalCarbon),
            totalCarbon: Math.round(totalCarbon)
        };
    });

    console.log('📊 Calculated 6 scenarios:', scenarios);

    // ENCONTRAR O MELHOR DE CADA CATEGORIA
    const renovationScenarios = Object.keys(scenarios).filter(k => scenarios[k].category === 'renovation');
    const newbuildScenarios = Object.keys(scenarios).filter(k => scenarios[k].category === 'newbuild');

    const bestRenovationKey = renovationScenarios.reduce((best, current) => 
        scenarios[current].totalCarbon < scenarios[best].totalCarbon ? current : best
    );

    const bestNewbuildKey = newbuildScenarios.reduce((best, current) => 
        scenarios[current].totalCarbon < scenarios[best].totalCarbon ? current : best
    );

    const bestRenovation = scenarios[bestRenovationKey];
    const bestNewbuild = scenarios[bestNewbuildKey];

    // DECISÃO: RENOVATE OU DEMOLISH & REBUILD
    const decision = bestRenovation.totalCarbon < bestNewbuild.totalCarbon ? 'RENOVATE' : 'DEMOLISH & REBUILD';
    const recommended = decision === 'RENOVATE' ? bestRenovation.name : bestNewbuild.name;
    const savings = Math.abs(bestRenovation.totalCarbon - bestNewbuild.totalCarbon);
    const savingsPercentage = ((savings / Math.max(bestRenovation.totalCarbon, bestNewbuild.totalCarbon)) * 100).toFixed(1);

    // Prepare results object
    const results = {
        decision: decision,
        recommended: recommended,
        savings: savings,
        savingsPercent: savingsPercentage,
        bestRenovation: bestRenovation,
        bestNewbuild: bestNewbuild,
        allScenarios: scenarios,
        inputs: {
            buildingArea: area,
            lifespan: lifespan,
            embodiedEnergy: embodiedEnergy,
            operationalEnergy: operationalEnergy,
            material: material,
            climate: climate,
            reuseRate: userReuseRate * 100
        }
    };

    console.log('✅ Final results:', results);

    // Display results with animation
    displayResults(results);
}

/* ========================================
   DISPLAY RESULTS WITH ANIMATIONS
   ======================================== */
function displayResults(results) {
    console.log('📊 Displaying results:', results);

    // Update decision badge
    const decisionBadge = document.getElementById('decisionBadge');
    const decisionText = document.getElementById('decisionText');
    const resultsTitle = document.getElementById('resultsTitle');

    if (results.decision === 'RENOVATE') {
        if (decisionBadge) {
            decisionBadge.style.background = 'linear-gradient(to right, #047857 0%, #059669 50%, #047857 100%)';
        }
        if (decisionText) {
            decisionText.textContent = 'RENOVATE';
        }
        if (resultsTitle) {
            resultsTitle.textContent = results.recommended + ' is the better choice';
        }
    } else {
        if (decisionBadge) {
            decisionBadge.style.background = 'linear-gradient(to right, #dc2626 0%, #ef4444 50%, #dc2626 100%)';
        }
        if (decisionText) {
            decisionText.textContent = 'DEMOLISH & REBUILD';
        }
        if (resultsTitle) {
            resultsTitle.textContent = results.recommended + ' is recommended';
        }
    }

    // Update savings
    const savingsAmount = document.getElementById('savingsAmount');
    const savingsPercent = document.getElementById('savingsPercent');
    if (savingsAmount) {
        savingsAmount.textContent = formatNumber(results.savings) + ' tCO₂e';
    }
    if (savingsPercent) {
        savingsPercent.textContent = '(' + results.savingsPercent + '%)';
    }

    // Update quick stats (Best Renovation vs Best New Build)
    animateNumber('renovationTotal', 0, results.bestRenovation.totalCarbon, 1500);
    animateNumber('renovationEmbodied', 0, results.bestRenovation.embodiedCarbon, 1500);
    animateNumber('renovationOperational', 0, results.bestRenovation.operationalCarbon, 1500);
    
    animateNumber('newbuildTotal', 0, results.bestNewbuild.totalCarbon, 1500);
    animateNumber('newbuildEmbodied', 0, results.bestNewbuild.embodiedCarbon, 1500);
    animateNumber('newbuildOperational', 0, results.bestNewbuild.operationalCarbon, 1500);

    // Initialize charts (vai mostrar os 6 cenários)
    if (window.ChartsModule) {
        setTimeout(() => {
            window.ChartsModule.init(results);
        }, 800);
    }

    // Show results section with fade-in
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    resultsSection.style.opacity = '0';
    
    setTimeout(() => {
        resultsSection.style.transition = 'opacity 0.6s ease';
        resultsSection.style.opacity = '1';
        
        // Smooth scroll to results
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);

    // Re-enable button
    btnNext.disabled = false;
    btnNext.innerHTML = `
        Calculate Results
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
}

/* ========================================
   HELPER FUNCTIONS
   ======================================== */
function formatNumber(num) {
    return Math.round(num).toLocaleString('en-US');
}

function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuad = progress * (2 - progress);
        const current = start + (end - start) * easeOutQuad;
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/* ========================================
   TABS FUNCTIONALITY
   ======================================== */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked
            btn.classList.add('active');
            const targetPane = document.getElementById(`tab-${targetTab}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

/* ========================================
   ANIMATIONS CSS (inject into page)
   ======================================== */
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
        20%, 40%, 60%, 80% { transform: translateX(8px); }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    /* Form Section Transitions */
    .form-section {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Button Transitions */
    .btn {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Input States - UPDATED FOR DROPDOWNS */
    .form-input.input-valid,
    .form-select.input-valid {
        border-color: #10b981 !important;
        background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 12L11 14L15 10' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='12' cy='12' r='10' stroke='%2310b981' stroke-width='2'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 20px;
        padding-right: 40px;
    }
    
    .form-input.input-invalid,
    .form-select.input-invalid {
        border-color: #ef4444 !important;
        background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%23ef4444' stroke-width='2'/%3E%3Cpath d='M12 8V12M12 16H12.01' stroke='%23ef4444' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 20px;
        padding-right: 40px;
    }
    
    /* Error Messages */
    .input-error-message {
        display: none;
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        font-weight: 500;
    }
    
    /* Required Asterisk */
    .required-asterisk {
        color: #ef4444;
        font-weight: 700;
        margin-left: 2px;
    }
    
    /* Validation Notification */
    .validation-notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 10px 40px rgba(239, 68, 68, 0.3);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        max-width: 400px;
    }
    
    .validation-notification svg {
        flex-shrink: 0;
    }
`;
document.head.appendChild(animationStyles);

/* ========================================
   DEBUG HELPERS
   ======================================== */
window.calculatorDebug = {
    formData: formData,
    scenarioDefaults: scenarioDefaults,
    currentStep: () => currentStep,
    validate: () => validateCurrentStep()
};

console.log('✨ Calculator initialized with 6-scenario comparison logic + DROPDOWNS');
