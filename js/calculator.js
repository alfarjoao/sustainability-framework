/* ========================================
   BUILDING SUSTAINABILITY FRAMEWORK
   Calculator Logic - 7 Scenarios (REAL DATA from Valentine Lhoëst)
   Based on Meeting 2_Data.pdf - February 2026
   ✅ VERSÃO FINAL: NOVO MATERIAL SELECTOR + SUMMARY COMPLETO
   ======================================== */

// State Management
let currentStep = 1;
const totalSteps = 4;
let formData = {};

// ✅ 7 CENÁRIOS COM DADOS REAIS DA VALENTINE
const scenarioDefaults = {
    'light-renovation': {
        name: 'light-renovation',
        displayName: 'Light Renovation',
        reuseRate: 0.90,
        embodiedFactor: 0.10,
        operationalImprovement: 0.25,
        lifespan: 17.5,
        category: 'renovation',
        description: 'Minimal intervention preserving nearly all existing fabric. Window replacement, insulation upgrades, HVAC controls, and lighting retrofit. Ideal for buildings in good structural condition with 15-20 year intervention cycle.'
    },
    'medium-renovation': {
        name: 'medium-renovation',
        displayName: 'Medium Renovation',
        reuseRate: 0.70,
        embodiedFactor: 0.275,
        operationalImprovement: 0.475,
        lifespan: 22.5,
        category: 'renovation',
        description: 'Significant envelope upgrade with full HVAC replacement and interior reconfiguration. Primary structure remains untouched while 50%+ of envelope is replaced. Suitable for substantial updates within existing floor plate.'
    },
    'deep-renovation': {
        name: 'deep-renovation',
        displayName: 'Deep Renovation',
        reuseRate: 0.525,
        embodiedFactor: 0.45,
        operationalImprovement: 0.70,
        lifespan: 30,
        category: 'renovation',
        description: 'Comprehensive intervention with full envelope rebuild and complete systems replacement. Load-bearing structure 100% retained with high-performance assemblies (triple glazing, HRV >85%). Maximum intervention short of structural changes.'
    },
    'deep-renovation-demolition': {
        name: 'deep-renovation-demolition',
        displayName: 'Deep + Demo',
        reuseRate: 0.425,
        embodiedFactor: 0.55,
        operationalImprovement: 0.75,
        lifespan: 35,
        category: 'renovation',
        description: 'Deep renovation plus selective structural modifications. Removal of load-bearing walls for open plan, new beams/slabs for extensions. Structure retention 60-80%, enabling superior passive performance over 30-40 years.'
    },
    'code-compliant-new': {
        name: 'code-compliant-new',
        displayName: 'Code-Compliant',
        reuseRate: 0.025,
        embodiedFactor: 0.975,
        operationalImprovement: 0.84,
        lifespan: 40,
        category: 'newbuild',
        description: 'Complete demolition followed by conventional new construction meeting Belgian EPB 2026 minimums. Standard materials with minimal foundation reuse (5-10%). Meets but does not exceed regulatory baseline.'
    },
    'high-performance-new': {
        name: 'high-performance-new',
        displayName: 'High-Performance',
        reuseRate: 0.10,
        embodiedFactor: 0.825,
        operationalImprovement: 0.94,
        lifespan: 50,
        category: 'newbuild',
        description: 'Demolition plus advanced new build with triple glazing, ventilated façade, heat pump (COP>4), and HRV>85%. Optimized foundation reuse (10-20%), achieving passivhaus "low-energy" standard over 50 years.'
    },
    'low-carbon-new': {
        name: 'low-carbon-new',
        displayName: 'Low-Carbon',
        reuseRate: 0.225,
        embodiedFactor: 0.65,
        operationalImprovement: 0.98,
        lifespan: 60,
        category: 'newbuild',
        description: 'Demolition plus nearly net-zero building with mass timber structure, U-values<0.15, HRV>90%, PV integration, and >50% recycled materials. Maximum feasible reuse (20-30%) with 60-year lifecycle trajectory.'
    }
};

// ✅ PROGRAM TYPE BASELINES + USAGE FACTORS (kWh/m²/yr)
const programBaselines = {
    'office': 350,
    'residential': 250,
    'institutional': 450,
    'industrial': 700
};

const programFactors = {
    'office': 1.00,
    'residential': 0.71,
    'institutional': 1.29,
    'industrial': 2.00
};

// ✅ CLIMATE MULTIPLIERS
const climateMultipliers = {
    'temperate': 1.00,
    'cold': 1.27,
    'hot-dry': 0.92,
    'hot-humid': 0.95,
    'coastal': 0.85,
    'mountain': 1.13
};

// ✅ Material Factors
const materialFactors = {
    'concrete': 1.0,
    'steel': 1.3,
    'timber': 0.7,
    'masonry': 0.9,
    'mixed': 1.0
};

// ✅ Embodied Carbon por tonelada de material (kgCO2e/tonne)
const materialEmbodiedCarbon = {
    'concrete': 150,
    'steel': 1850,
    'timber': 100,
    'masonry': 200,
    'mixed': 500
};

// ✅ MAPEAMENTO "UNKNOWN" → VALORES ESTIMADOS (em MJ/m²)
const embodiedContextMap = {
    'light-construction': 7500,
    'medium-construction': 9000,
    'heavy-construction': 10500,
    'existing-building': 7500
};

const operationalContextMap = {
    'high-performance': 20,
    'code-compliant': 80,
    'existing-standard': 150,
    'poor-performance': 275
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
    setupUnknownLogic();
    setupNewMaterialSelector();
    setupProgressBar();
    setupNewAnalysisButton();
    injectAnimationStyles();
    
    console.log('✅ Calculator initialized - NOVO MATERIAL SELECTOR + SUMMARY COMPLETO');
    console.log('📊 7 Scenarios loaded:', Object.keys(scenarioDefaults));
});

/* ========================================
   ✅ NOVO MATERIAL SELECTOR (TUDO DENTRO DO DROPDOWN)
   ======================================== */
function setupNewMaterialSelector() {
    console.log('🔧 Setup NEW material selector - tudo dentro do dropdown');
    
    const dropdown = document.getElementById('material-dropdown');
    if (!dropdown) {
        console.error('❌ Dropdown not found!');
        return;
    }

    const trigger = dropdown.querySelector('.multiselect-trigger');
    const dropdownMenu = dropdown.querySelector('.multiselect-dropdown');
    const placeholder = dropdown.querySelector('.multiselect-placeholder');

    if (!trigger || !dropdownMenu || !placeholder) {
        console.error('❌ Dropdown elements missing!');
        return;
    }

    placeholder.textContent = 'Select materials and quantities...';
    dropdown.classList.remove('open');

    // ✅ CRIAR CONTEÚDO DO DROPDOWN COM CHECKBOX + INPUT INLINE
    const materials = [
        { value: 'concrete', label: 'Concrete' },
        { value: 'steel', label: 'Steel' },
        { value: 'timber', label: 'Timber' },
        { value: 'masonry', label: 'Masonry' },
        { value: 'mixed', label: 'Mixed' }
    ];

    dropdownMenu.innerHTML = '';
    
    materials.forEach(material => {
        const item = document.createElement('div');
        item.className = 'material-selector-item';
        item.innerHTML = `
            <label class="material-checkbox-label">
                <input type="checkbox" name="materials" value="${material.value}" class="material-checkbox">
                <span class="material-name">${material.label}</span>
            </label>
            <input 
                type="number" 
                name="quantity_${material.value}" 
                class="material-inline-quantity" 
                placeholder="tonnes" 
                min="0.1" 
                step="0.1"
                disabled
            >
        `;
        dropdownMenu.appendChild(item);
    });

    // ✅ TOGGLE DROPDOWN
    trigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = dropdown.classList.contains('open');
        
        if (isOpen) {
            dropdown.classList.remove('open');
            document.body.classList.remove('dropdown-open');
            console.log('🔴 DROPDOWN FECHADO');
        } else {
            dropdown.classList.add('open');
            document.body.classList.add('dropdown-open');
            console.log('🟢 DROPDOWN ABERTO');
        }
    });

    // ✅ CLOSE ON OUTSIDE CLICK
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            document.body.classList.remove('dropdown-open');
        }
    });

    // ✅ PREVENT CLOSE WHEN CLICKING INSIDE
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // ✅ HANDLE CHECKBOX CHANGES
    const checkboxes = dropdownMenu.querySelectorAll('.material-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const material = this.value;
            const quantityInput = dropdownMenu.querySelector(`input[name="quantity_${material}"]`);
            
            if (this.checked) {
                quantityInput.disabled = false;
                quantityInput.focus();
            } else {
                quantityInput.disabled = true;
                quantityInput.value = '';
            }
            
            updateMaterialPlaceholder();
            dropdown.classList.remove('input-invalid');
        });
    });

    // ✅ UPDATE PLACEHOLDER
    function updateMaterialPlaceholder() {
        const selectedCheckboxes = Array.from(checkboxes).filter(cb => cb.checked);
        
        if (selectedCheckboxes.length === 0) {
            placeholder.textContent = 'Select materials and quantities...';
            placeholder.style.color = '#9ca3af';
        } else {
            const materials = selectedCheckboxes.map(cb => {
                const label = cb.parentElement.querySelector('.material-name').textContent;
                return label;
            }).join(', ');
            placeholder.textContent = materials;
            placeholder.style.color = '#047857';
        }
    }

    console.log('✅ New material selector ready');
}

/* ========================================
   ✅ NEW ANALYSIS BUTTON SETUP
   ======================================== */
function setupNewAnalysisButton() {
    const newAnalysisBtn = document.getElementById('btn-new-analysis');
    if (!newAnalysisBtn) return;
    
    newAnalysisBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🔄 New Analysis clicked - resetting calculator');
        
        currentStep = 1;
        formData = {};
        form.reset();
        
        const dropdown = document.getElementById('material-dropdown');
        if (dropdown) {
            dropdown.classList.remove('open', 'input-valid', 'input-invalid');
            document.body.classList.remove('dropdown-open');
            
            const checkboxes = dropdown.querySelectorAll('.material-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = false;
                const material = cb.value;
                const quantityInput = dropdown.querySelector(`input[name="quantity_${material}"]`);
                if (quantityInput) {
                    quantityInput.disabled = true;
                    quantityInput.value = '';
                }
            });
            
            const placeholder = dropdown.querySelector('.multiselect-placeholder');
            if (placeholder) {
                placeholder.textContent = 'Select materials and quantities...';
                placeholder.style.color = '#9ca3af';
            }
        }
        
        document.querySelectorAll('.input-valid, .input-invalid').forEach(el => {
            el.classList.remove('input-valid', 'input-invalid');
        });
        
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
        
        const calculatorSection = document.querySelector('.calculator-section');
        if (calculatorSection) {
            calculatorSection.style.display = 'block';
        }
        
        updateUI();
        updateProgressBar();
        
        setTimeout(() => {
            const calculatorCard = document.querySelector('.calculator-card');
            if (calculatorCard) {
                calculatorCard.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 100);
        
        console.log('✅ Calculator reset complete');
    });
}

/* ========================================
   ✅ PROGRESS BAR (4 STEPS)
   ======================================== */
function setupProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    function updateProgressBar() {
        progressSteps.forEach((step, index) => {
            if (index + 1 <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    updateProgressBar();
}

/* ========================================
   EVENT LISTENERS
   ======================================== */
function setupEventListeners() {
    btnNext.addEventListener('click', handleNext);
    btnBack.addEventListener('click', handleBack);

    const inputs = form.querySelectorAll('input:not([type="checkbox"]), select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('change', function() {
            validateInput(this);
            if (this.value) {
                formData[this.name] = this.value;
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value) {
                validateInput(this);
            }
        });
    });
}

/* ========================================
   ✅ SHOW/HIDE "UNKNOWN" CONTEXT SELECTORS
   ======================================== */
function setupUnknownLogic() {
    const embodiedEnergySelect = document.getElementById('embodied-energy');
    const embodiedContextGroup = document.getElementById('embodied-context-group');
    const embodiedContextSelect = document.getElementById('embodied-context');
    
    const operationalEnergySelect = document.getElementById('operational-energy');
    const operationalContextGroup = document.getElementById('operational-context-group');
    const operationalContextSelect = document.getElementById('operational-context');

    if (embodiedEnergySelect) {
        embodiedEnergySelect.addEventListener('change', function() {
            if (this.value === 'unknown') {
                embodiedContextGroup.style.display = 'block';
                embodiedContextSelect.setAttribute('required', 'required');
            } else {
                embodiedContextGroup.style.display = 'none';
                embodiedContextSelect.removeAttribute('required');
                embodiedContextSelect.value = '';
            }
        });
    }

    if (operationalEnergySelect) {
        operationalEnergySelect.addEventListener('change', function() {
            if (this.value === 'unknown') {
                operationalContextGroup.style.display = 'block';
                operationalContextSelect.setAttribute('required', 'required');
            } else {
                operationalContextGroup.style.display = 'none';
                operationalContextSelect.removeAttribute('required');
                operationalContextSelect.value = '';
            }
        });
    }
}

/* ========================================
   REAL-TIME VALIDATION
   ======================================== */
function validateInput(input) {
    const parentGroup = input.closest('.form-group');
    const errorMessage = parentGroup ? parentGroup.querySelector('.input-error-message') : null;
    
    input.classList.remove('input-valid', 'input-invalid');
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }
    
    if (input.hasAttribute('required') && !input.value.trim()) {
        input.classList.add('input-invalid');
        if (errorMessage) {
            errorMessage.textContent = 'This field is required';
            errorMessage.style.display = 'block';
        }
        return false;
    }
    
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
            calculateResults();
        } else {
            currentStep++;
            updateUI();
            updateProgressBar();
        }
    }
}

function handleBack() {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
        updateProgressBar();
    }
}

function updateProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

/* ========================================
   ✅ STEP VALIDATION
   ======================================== */
function validateCurrentStep() {
    const currentSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
    if (!currentSection) return false;
    
    let isValid = true;
    let firstInvalidInput = null;

    const requiredInputs = currentSection.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
        if (input.offsetParent === null) return;
        
        const inputValid = validateInput(input);
        
        if (!inputValid) {
            isValid = false;
            if (!firstInvalidInput) {
                firstInvalidInput = input;
            }
            
            input.style.animation = 'shake 0.4s ease-in-out';
            setTimeout(() => {
                input.style.animation = '';
            }, 400);
        }
    });

    if (currentStep === 3) {
        const materialDropdown = document.getElementById('material-dropdown');
        if (materialDropdown) {
            const checkboxes = materialDropdown.querySelectorAll('.material-checkbox:checked');
            
            if (checkboxes.length === 0) {
                isValid = false;
                const parentGroup = materialDropdown.closest('.form-group');
                const errorMessage = parentGroup ? parentGroup.querySelector('.input-error-message') : null;
                
                materialDropdown.classList.add('input-invalid');
                if (errorMessage) {
                    errorMessage.textContent = 'Please select at least one material';
                    errorMessage.style.display = 'block';
                }
                
                if (!firstInvalidInput) {
                    firstInvalidInput = materialDropdown;
                }
            } else {
                // ✅ VALIDAR QUANTIDADES
                checkboxes.forEach(checkbox => {
                    const material = checkbox.value;
                    const quantityInput = materialDropdown.querySelector(`input[name="quantity_${material}"]`);
                    
                    if (!quantityInput || !quantityInput.value || parseFloat(quantityInput.value) <= 0) {
                        isValid = false;
                        if (quantityInput) {
                            quantityInput.classList.add('input-invalid');
                            quantityInput.style.animation = 'shake 0.4s ease-in-out';
                            setTimeout(() => {
                                quantityInput.style.animation = '';
                            }, 400);
                        }
                        if (!firstInvalidInput) {
                            firstInvalidInput = quantityInput;
                        }
                    }
                });
            }
        }
    }

    if (!isValid) {
        if (firstInvalidInput) {
            firstInvalidInput.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            if (firstInvalidInput.focus) firstInvalidInput.focus();
        }
        
        showErrorNotification('⚠️ Please correct the highlighted fields before continuing');
    }

    return isValid;
}

/* ========================================
   ERROR NOTIFICATION
   ======================================== */
function showErrorNotification(message) {
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
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

/* ========================================
   UI UPDATES WITH SMOOTH TRANSITIONS
   ======================================== */
function updateUI() {
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
    
    updateButtons();
}

function showNextSection() {
    const nextSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
    
    if (nextSection) {
        nextSection.style.opacity = '0';
        nextSection.style.transform = 'translateX(20px)';
        nextSection.classList.add('active');
        
        setTimeout(() => {
            nextSection.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            nextSection.style.opacity = '1';
            nextSection.style.transform = 'translateX(0)';
        }, 50);
    }
}

function updateButtons() {
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
   ✅ CALCULATIONS - COM MATERIAIS
   ======================================== */
function calculateResults() {
    btnNext.disabled = true;
    btnNext.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="60" stroke-dashoffset="20" opacity="0.25"/>
        </svg>
        Calculating...
    `;
    
    setTimeout(() => {
        performCalculation();
    }, 800);
}

function performCalculation() {
    // ✅ STEP 1: Building Type
    const buildingType = document.getElementById('building-type').value;
    
    // ✅ STEP 2: Program, Area, Climate
    const programAfterRenovation = document.getElementById('program-after-renovation').value;
    const area = parseFloat(document.getElementById('building-area').value);
    const climate = document.getElementById('climate-zone').value;
    
    // ✅ STEP 3: Materials + Quantities
    const materialDropdown = document.getElementById('material-dropdown');
    const materialCheckboxes = materialDropdown.querySelectorAll('.material-checkbox:checked');
    const selectedMaterials = Array.from(materialCheckboxes).map(cb => cb.value);
    
    const materialQuantities = {};
    let totalMaterialQuantity = 0;
    let totalMaterialEmbodiedCarbon = 0;
    
    selectedMaterials.forEach(material => {
        const quantityInput = materialDropdown.querySelector(`input[name="quantity_${material}"]`);
        if (quantityInput) {
            const qty = parseFloat(quantityInput.value) || 0;
            materialQuantities[material] = qty;
            totalMaterialQuantity += qty;
            
            const embodiedPerTonne = materialEmbodiedCarbon[material] || 500;
            totalMaterialEmbodiedCarbon += qty * embodiedPerTonne;
        }
    });
    
    const materialEmbodiedEnergyMJ = totalMaterialEmbodiedCarbon * 50;
    
    const materialFactor = selectedMaterials.length > 0
        ? selectedMaterials.reduce((sum, mat) => sum + (materialFactors[mat] || 1.0), 0) / selectedMaterials.length
        : 1.0;
    
    // ✅ STEP 4: Embodied Energy (se existir na UI)
    let embodiedEnergyBaseMJ;
    const embodiedEnergySelect = document.getElementById('embodied-energy');
    
    if (embodiedEnergySelect) {
        const embodiedEnergyValue = embodiedEnergySelect.value;
        if (embodiedEnergyValue === 'unknown') {
            const embodiedContext = document.getElementById('embodied-context').value;
            embodiedEnergyBaseMJ = embodiedContextMap[embodiedContext] || 9000;
        } else {
            embodiedEnergyBaseMJ = parseFloat(embodiedEnergyValue);
        }
    } else {
        // Se não existe input, usar valor base
        embodiedEnergyBaseMJ = 9000;
    }
    
    embodiedEnergyBaseMJ += (materialEmbodiedEnergyMJ / area);
    
    const programBaseline = programBaselines[buildingType] || 350;
    const programFactor = programFactors[programAfterRenovation] || 1.00;
    
    const climateFactor = climateMultipliers[climate] || 1.0;
    
    console.log('📊 ALL INPUTS:', {
        buildingType,
        programAfterRenovation,
        programBaseline,
        programFactor,
        area,
        climate,
        climateFactor,
        selectedMaterials,
        materialQuantities,
        totalMaterialQuantity,
        totalMaterialEmbodiedCarbon: totalMaterialEmbodiedCarbon.toFixed(2) + ' kgCO2e',
        materialEmbodiedEnergyMJ: materialEmbodiedEnergyMJ.toFixed(2) + ' MJ',
        materialFactor,
        embodiedEnergyBaseMJ: embodiedEnergyBaseMJ.toFixed(2) + ' MJ/m²'
    });
    
    const scenariosArray = [];
    
    Object.keys(scenarioDefaults).forEach(scenarioKey => {
        const scenario = scenarioDefaults[scenarioKey];
        
        const embodiedEnergyPerM2 = embodiedEnergyBaseMJ * scenario.embodiedFactor;
        const embodiedTotalMJ = embodiedEnergyPerM2 * area;
        
        const operationalKWhPerM2PerYear = programBaseline * programFactor * climateFactor * (1 - scenario.operationalImprovement);
        const operationalMJPerM2PerYear = operationalKWhPerM2PerYear * 3.6;
        const operationalTotalMJ = operationalMJPerM2PerYear * scenario.lifespan * area;
        
        const totalMJ = embodiedTotalMJ + operationalTotalMJ;
        
        scenariosArray.push({
            name: scenarioKey,
            displayName: scenario.displayName,
            category: scenario.category,
            lifespan: scenario.lifespan,
            description: scenario.description,
            embodiedCarbon: Math.round(embodiedTotalMJ),
            operationalCarbon: Math.round(operationalTotalMJ),
            totalCarbon: Math.round(totalMJ)
        });
    });
    
    console.log('✅ CALCULATED 7 SCENARIOS:', scenariosArray);
    
    const renovationScenarios = scenariosArray.filter(s => s.category === 'renovation');
    const newbuildScenarios = scenariosArray.filter(s => s.category === 'newbuild');
    
    const bestRenovation = renovationScenarios.reduce((best, current) => 
        current.totalCarbon < best.totalCarbon ? current : best
    );
    
    const bestNewbuild = newbuildScenarios.reduce((best, current) => 
        current.totalCarbon < best.totalCarbon ? current : best
    );
    
    const decision = bestRenovation.totalCarbon < bestNewbuild.totalCarbon ? 'RENOVATE' : 'DEMOLISH & REBUILD';
    const recommendedScenario = decision === 'RENOVATE' ? bestRenovation : bestNewbuild;
    const savings = Math.abs(bestRenovation.totalCarbon - bestNewbuild.totalCarbon);
    const savingsPercentage = ((savings / Math.max(bestRenovation.totalCarbon, bestNewbuild.totalCarbon)) * 100).toFixed(1);
    
    const results = {
        decision: decision,
        recommendedScenario: recommendedScenario.displayName,
        recommendedScenarioFull: recommendedScenario,
        savings: savings,
        savingsPercent: savingsPercentage,
        bestRenovation: bestRenovation,
        bestNewbuild: bestNewbuild,
        allScenarios: scenariosArray,
        inputs: {
            buildingType: buildingType,
            programAfterRenovation: programAfterRenovation,
            buildingArea: area,
            lifespan: recommendedScenario.lifespan,
            embodiedEnergy: embodiedEnergyBaseMJ,
            programBaseline: programBaseline,
            programFactor: programFactor,
            materials: selectedMaterials,
            materialQuantities: materialQuantities,
            totalMaterialQuantity: totalMaterialQuantity,
            materialFactor: materialFactor,
            climate: climate,
            climateFactor: climateFactor
        }
    };
    
    console.log('🎯 FINAL RESULTS:', results);
    
    displayResults(results);
}

function displayResults(results) {
    console.log('📊 Displaying results:', results);

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
            resultsTitle.textContent = results.recommendedScenario + ' is the better choice';
        }
    } else {
        if (decisionBadge) {
            decisionBadge.style.background = 'linear-gradient(to right, #dc2626 0%, #b91c1c 50%, #dc2626 100%)';
        }
        if (decisionText) {
            decisionText.textContent = 'DEMOLISH & REBUILD';
        }
        if (resultsTitle) {
            resultsTitle.textContent = results.recommendedScenario + ' is recommended';
        }
    }

    const savingsAmount = document.getElementById('savingsAmount');
    const savingsPercent = document.getElementById('savingsPercent');
    if (savingsAmount) {
        savingsAmount.textContent = formatNumber(results.savings) + ' MJ';
    }
    if (savingsPercent) {
        savingsPercent.textContent = '(' + results.savingsPercent + '%)';
    }

    animateNumber('renovationTotal', 0, results.bestRenovation.totalCarbon, 1500);
    animateNumber('renovationEmbodied', 0, results.bestRenovation.embodiedCarbon, 1500);
    animateNumber('renovationOperational', 0, results.bestRenovation.operationalCarbon, 1500);
    
    animateNumber('newbuildTotal', 0, results.bestNewbuild.totalCarbon, 1500);
    animateNumber('newbuildEmbodied', 0, results.bestNewbuild.embodiedCarbon, 1500);
    animateNumber('newbuildOperational', 0, results.bestNewbuild.operationalCarbon, 1500);

    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    resultsSection.style.opacity = '0';
    
    setTimeout(() => {
        resultsSection.style.transition = 'opacity 0.6s ease';
        resultsSection.style.opacity = '1';
        
        setTimeout(() => {
            displayCompleteSummary(results.inputs, results.recommendedScenarioFull);
            
            if (window.ChartsModule) {
                window.ChartsModule.init(results);
                
                setTimeout(() => {
                    const firstTab = document.querySelector('.charts-tabs .tab-btn:first-child');
                    if (firstTab) firstTab.click();
                }, 100);
            }
        }, 300);
        
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);

    btnNext.disabled = false;
    btnNext.innerHTML = `
        Calculate Results
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
}

/* ========================================
   ✅ SUMMARY COMPLETO COM TODOS OS INPUTS
   ======================================== */
function displayCompleteSummary(inputs, scenario) {
    console.log('📝 displayCompleteSummary - TODOS OS INPUTS');
    
    const existingBlock = document.querySelector('.input-summary-block');
    if (existingBlock) {
        existingBlock.remove();
    }
    
    const compactHeader = document.querySelector('.results-compact-header');
    if (!compactHeader) {
        console.error('❌ .results-compact-header not found!');
        return;
    }
    
    const climateLabels = {
        'temperate': 'Temperate',
        'cold': 'Cold',
        'hot-dry': 'Hot & Dry',
        'hot-humid': 'Hot & Humid',
        'coastal': 'Coastal',
        'mountain': 'Mountain'
    };
    
    const buildingTypeLabels = {
        'office': 'Office',
        'residential': 'Residential',
        'institutional': 'Institutional',
        'industrial': 'Industrial'
    };
    
    const materialsWithQuantities = inputs.materials.map(mat => {
        const qty = inputs.materialQuantities[mat] || 0;
        const materialName = mat.charAt(0).toUpperCase() + mat.slice(1);
        return `<div class="material-qty-item">
            <span class="material-name">${materialName}:</span>
            <span class="material-value">${qty.toLocaleString()} tonnes</span>
        </div>`;
    }).join('');
    
    const summaryBlock = document.createElement('div');
    summaryBlock.className = 'input-summary-block';
    summaryBlock.innerHTML = `
        <div class="scenario-explanation-section">
            <div class="explanation-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="explanation-content">
                <h4>What does ${scenario.displayName} mean?</h4>
                <p>${scenario.description}</p>
            </div>
        </div>
        
        <div class="summary-divider"></div>
        
        <div class="summary-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2"/>
                <path d="M9 12h6M9 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h4>Complete Input Summary</h4>
        </div>
        <div class="summary-grid-complete">
            <div class="summary-section">
                <h5 class="summary-section-title">Building Information</h5>
                <div class="summary-item">
                    <span class="summary-label">Building Type:</span>
                    <span class="summary-value">${buildingTypeLabels[inputs.buildingType] || inputs.buildingType}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Program After Renovation:</span>
                    <span class="summary-value">${buildingTypeLabels[inputs.programAfterRenovation] || inputs.programAfterRenovation}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Building Area:</span>
                    <span class="summary-value">${inputs.buildingArea.toLocaleString()} m²</span>
                </div>
            </div>
            
            <div class="summary-section">
                <h5 class="summary-section-title">Environmental Context</h5>
                <div class="summary-item">
                    <span class="summary-label">Climate Zone:</span>
                    <span class="summary-value">${climateLabels[inputs.climate] || inputs.climate}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Climate Multiplier:</span>
                    <span class="summary-value">${inputs.climateFactor.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Embodied Energy Base:</span>
                    <span class="summary-value">${inputs.embodiedEnergy.toFixed(2)} MJ/m²</span>
                </div>
            </div>
            
            <div class="summary-section">
                <h5 class="summary-section-title">Energy Baselines</h5>
                <div class="summary-item">
                    <span class="summary-label">Program Baseline:</span>
                    <span class="summary-value">${inputs.programBaseline} kWh/m²/yr</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Program Factor:</span>
                    <span class="summary-value">${inputs.programFactor.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Recommended Lifespan:</span>
                    <span class="summary-value">${inputs.lifespan} years</span>
                </div>
            </div>
            
            <div class="summary-section summary-section-full">
                <h5 class="summary-section-title">Materials & Quantities</h5>
                <div class="summary-item">
                    <span class="summary-label">Total Material Quantity:</span>
                    <span class="summary-value">${inputs.totalMaterialQuantity.toLocaleString()} tonnes</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Material Factor:</span>
                    <span class="summary-value">${inputs.materialFactor.toFixed(2)}</span>
                </div>
                <div class="materials-quantities-grid">
                    ${materialsWithQuantities}
                </div>
            </div>
        </div>
    `;
    
    compactHeader.parentNode.insertBefore(summaryBlock, compactHeader.nextSibling);
    
    setTimeout(() => {
        summaryBlock.style.opacity = '1';
        summaryBlock.style.transform = 'translateY(0)';
    }, 100);
    
    console.log('✅ COMPLETE summary with ALL inputs injected');
}

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
        
        const easeOutQuad = progress * (2 - progress);
        const current = start + (end - start) * easeOutQuad;
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetTab = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const targetPane = document.getElementById(`tab-${targetTab}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

/* ========================================
   ✅ STYLES PARA NOVO SELECTOR
   ======================================== */
function injectAnimationStyles() {
    if (document.getElementById('calculator-animations')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'calculator-animations';
    styleElement.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
            20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* ✅ NOVO MATERIAL SELECTOR */
        .material-selector-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid #e5e7eb;
            gap: 16px;
        }
        
        .material-selector-item:last-child {
            border-bottom: none;
        }
        
        .material-checkbox-label {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            flex: 1;
        }
        
        .material-checkbox {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        .material-name {
            font-size: 0.95rem;
            font-weight: 500;
            color: #374151;
        }
        
        .material-inline-quantity {
            width: 120px;
            padding: 8px 12px;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.9rem;
            text-align: right;
            transition: all 0.2s ease;
        }
        
        .material-inline-quantity:disabled {
            background: #f3f4f6;
            cursor: not-allowed;
            opacity: 0.5;
        }
        
        .material-inline-quantity:not(:disabled):focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        .material-inline-quantity.input-invalid {
            border-color: #ef4444;
        }
        
        /* ✅ SUMMARY COMPLETO */
        .input-summary-block {
            background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%);
            border: 2px solid #10b981;
            border-radius: 16px;
            padding: 0;
            margin: 2rem 0;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.4s ease;
            overflow: hidden;
        }
        
        .scenario-explanation-section {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 1.5rem;
        }
        
        .explanation-icon {
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .explanation-icon svg {
            color: #3b82f6;
        }
        
        .explanation-content h4 {
            font-size: 1.05rem;
            font-weight: 700;
            color: #1e40af;
            margin: 0 0 0.5rem 0;
        }
        
        .explanation-content p {
            font-size: 0.9rem;
            line-height: 1.6;
            color: #1e3a8a;
            margin: 0;
        }
        
        .summary-divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #10b981, transparent);
            margin: 0;
        }
        
        .summary-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1.25rem 1.5rem 1rem 1.5rem;
        }
        
        .summary-header svg {
            color: #10b981;
            flex-shrink: 0;
        }
        
        .summary-header h4 {
            font-size: 1.1rem;
            font-weight: 700;
            color: #047857;
            margin: 0;
        }
        
        .summary-grid-complete {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            padding: 0 1.5rem 1.5rem 1.5rem;
        }
        
        .summary-section {
            background: white;
            padding: 1.25rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        
        .summary-section-full {
            grid-column: 1 / -1;
        }
        
        .summary-section-title {
            font-size: 0.85rem;
            font-weight: 700;
            color: #047857;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #10b981;
        }
        
        .summary-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            margin-bottom: 0.75rem;
        }
        
        .summary-item:last-child {
            margin-bottom: 0;
        }
        
        .summary-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .summary-value {
            font-size: 0.95rem;
            font-weight: 600;
            color: #064e3b;
        }
        
        .materials-quantities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 0.75rem;
            margin-top: 1rem;
        }
        
        .material-qty-item {
            background: #f0fdf4;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 3px solid #10b981;
        }
        
        .material-name {
            font-size: 0.85rem;
            font-weight: 600;
            color: #047857;
        }
        
        .material-value {
            font-size: 0.9rem;
            font-weight: 700;
            color: #064e3b;
        }
        
        .validation-notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(239, 68, 68, 0.35);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            animation: slideInRight 0.4s ease-out;
            max-width: 400px;
            border-left: 4px solid #b91c1c;
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
        
        @media (max-width: 768px) {
            .scenario-explanation-section {
                flex-direction: column;
                gap: 0.75rem;
                padding: 1rem 1.25rem;
            }
            
            .explanation-icon {
                width: 36px;
                height: 36px;
            }
            
            .summary-grid-complete {
                grid-template-columns: 1fr;
            }
            
            .materials-quantities-grid {
                grid-template-columns: 1fr;
            }
            
            .material-inline-quantity {
                width: 100px;
            }
            
            .validation-notification {
                top: 80px;
                right: 10px;
                left: 10px;
                max-width: none;
                font-size: 0.875rem;
            }
        }
    `;
    document.head.appendChild(styleElement);
    
    console.log('✅ Styles injected for NEW selector + COMPLETE summary');
}

window.calculatorDebug = {
    formData: formData,
    scenarioDefaults: scenarioDefaults,
    programBaselines: programBaselines,
    programFactors: programFactors,
    climateMultipliers: climateMultipliers,
    materialFactors: materialFactors,
    materialEmbodiedCarbon: materialEmbodiedCarbon,
    currentStep: () => currentStep,
    validate: () => validateCurrentStep()
};

/* ========================================
   ✅ PDF EXPORT - SOLUÇÃO DEFINITIVA
   ======================================== */

// Variável global para armazenar resultados
let lastCalculationResults = null;

// Interceptar a função displayResults original
(function() {
    const originalDisplayResults = window.displayResults || displayResults;
    
    window.displayResults = function(results) {
        console.log('📊 Resultados capturados para PDF');
        
        // Armazenar globalmente
        lastCalculationResults = results;
        window.currentCalculationResults = results;
        
        // Chamar função original
        if (typeof originalDisplayResults === 'function') {
            originalDisplayResults(results);
        }
        
        // Conectar botão PDF após 1 segundo
        setTimeout(() => {
            setupPDFButton();
        }, 1000);
    };
})();

function setupPDFButton() {
    console.log('🔧 Configurando botão PDF...');
    
    // ✅ PROCURAR O BOTÃO PELO ID CORRETO
    const pdfButton = document.getElementById('downloadPdfBtn');
    
    if (!pdfButton) {
        console.error('❌ Botão #downloadPdfBtn NÃO ENCONTRADO!');
        return;
    }
    
    console.log('✅ Botão PDF encontrado:', pdfButton);
    
    // Remover listeners antigos
    const newButton = pdfButton.cloneNode(true);
    pdfButton.parentNode.replaceChild(newButton, pdfButton);
    
    // Adicionar novo listener
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🖱️ BOTÃO PDF CLICADO!');
        
        // Verificar bibliotecas
        if (typeof html2canvas === 'undefined') {
            console.error('❌ html2canvas não carregado');
            alert('Error: html2canvas library not loaded.');
            return;
        }
        
        if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
            console.error('❌ jsPDF não carregado');
            alert('Error: jsPDF library not loaded.');
            return;
        }
        
        // Verificar resultados
        if (!lastCalculationResults) {
            console.error('❌ Sem resultados');
            alert('Please calculate results first.');
            return;
        }
        
        // Verificar módulo PDF
        if (typeof window.PDFExportModule !== 'undefined') {
            console.log('✅ Usando PDFExportModule');
            try {
                const originalHTML = newButton.innerHTML;
                newButton.innerHTML = '⏳ Generating...';
                newButton.disabled = true;
                
                window.PDFExportModule.init(lastCalculationResults);
                window.PDFExportModule.generatePDF();
                
                setTimeout(() => {
                    newButton.innerHTML = originalHTML;
                    newButton.disabled = false;
                }, 3000);
            } catch (error) {
                console.error('❌ Erro:', error);
                alert('Error: ' + error.message);
                newButton.innerHTML = originalHTML;
                newButton.disabled = false;
            }
        } else {
            console.log('⚠️ PDFExportModule não encontrado, usando fallback');
            generateSimplePDF(lastCalculationResults, newButton);
        }
    });
    
    console.log('✅ Botão PDF configurado com sucesso');
}

// ✅ MÉTODO FALLBACK SIMPLIFICADO
function generateSimplePDF(results, button) {
    const originalHTML = button.innerHTML;
    button.innerHTML = '⏳ Generating PDF...';
    button.disabled = true;
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // CAPA
        doc.setFillColor(5, 120, 87);
        doc.rect(0, 0, 210, 297, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.setFont(undefined, 'bold');
        doc.text('SustainaBuild', 105, 100, { align: 'center' });
        doc.setFontSize(24);
        doc.text('Carbon Analysis Report', 105, 115, { align: 'center' });
        
        doc.setFontSize(18);
        doc.setFont(undefined, 'normal');
        doc.text('Decision: ' + results.decision, 105, 140, { align: 'center' });
        
        doc.setFontSize(14);
        doc.text('Recommended: ' + results.recommendedScenario, 105, 155, { align: 'center' });
        doc.text('Savings: ' + results.savings.toLocaleString() + ' MJ (' + results.savingsPercent + '%)', 105, 170, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text('Generated: ' + new Date().toLocaleDateString(), 105, 280, { align: 'center' });
        
        // PÁGINA 2 - RESULTADOS
        doc.addPage();
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Results Summary', 20, 25);
        
        doc.setFontSize(12);
        let y = 45;
        
        // Best Renovation
        doc.setFont(undefined, 'bold');
        doc.text('Best Renovation Option:', 20, y);
        y += 8;
        doc.setFont(undefined, 'normal');
        doc.text('Scenario: ' + results.bestRenovation.displayName, 25, y);
        y += 7;
        doc.text('Total: ' + results.bestRenovation.totalCarbon.toLocaleString() + ' MJ', 25, y);
        y += 7;
        doc.text('Embodied: ' + results.bestRenovation.embodiedCarbon.toLocaleString() + ' MJ', 25, y);
        y += 7;
        doc.text('Operational: ' + results.bestRenovation.operationalCarbon.toLocaleString() + ' MJ', 25, y);
        y += 15;
        
        // Best Newbuild
        doc.setFont(undefined, 'bold');
        doc.text('Best New Build Option:', 20, y);
        y += 8;
        doc.setFont(undefined, 'normal');
        doc.text('Scenario: ' + results.bestNewbuild.displayName, 25, y);
        y += 7;
        doc.text('Total: ' + results.bestNewbuild.totalCarbon.toLocaleString() + ' MJ', 25, y);
        y += 7;
        doc.text('Embodied: ' + results.bestNewbuild.embodiedCarbon.toLocaleString() + ' MJ', 25, y);
        y += 7;
        doc.text('Operational: ' + results.bestNewbuild.operationalCarbon.toLocaleString() + ' MJ', 25, y);
        y += 15;
        
        // Input Summary
        doc.setFont(undefined, 'bold');
        doc.text('Input Parameters:', 20, y);
        y += 8;
        doc.setFont(undefined, 'normal');
        doc.text('Building Type: ' + results.inputs.buildingType, 25, y);
        y += 7;
        doc.text('Area: ' + results.inputs.buildingArea.toLocaleString() + ' m²', 25, y);
        y += 7;
        doc.text('Climate: ' + results.inputs.climate, 25, y);
        y += 7;
        doc.text('Materials: ' + results.inputs.materials.join(', '), 25, y);
        y += 7;
        
        // Material quantities
        if (results.inputs.materialQuantities) {
            doc.setFont(undefined, 'bold');
            doc.text('Material Quantities:', 25, y);
            y += 7;
            doc.setFont(undefined, 'normal');
            Object.keys(results.inputs.materialQuantities).forEach(mat => {
                const qty = results.inputs.materialQuantities[mat];
                doc.text('  ' + mat + ': ' + qty.toLocaleString() + ' tonnes', 30, y);
                y += 6;
            });
        }
        
        // PÁGINA 3 - TODOS OS CENÁRIOS
        doc.addPage();
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('All Scenarios Comparison', 20, 25);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        y = 40;
        
        results.allScenarios.forEach((scenario, index) => {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFont(undefined, 'bold');
            doc.text((index + 1) + '. ' + scenario.displayName, 20, y);
            y += 6;
            doc.setFont(undefined, 'normal');
            doc.text('Total: ' + scenario.totalCarbon.toLocaleString() + ' MJ', 25, y);
            y += 5;
            doc.text('Embodied: ' + scenario.embodiedCarbon.toLocaleString() + ' MJ', 25, y);
            y += 5;
            doc.text('Operational: ' + scenario.operationalCarbon.toLocaleString() + ' MJ', 25, y);
            y += 5;
            doc.text('Lifespan: ' + scenario.lifespan + ' years', 25, y);
            y += 10;
        });
        
        // Salvar
        const filename = 'SustainaBuild_Report_' + new Date().toISOString().split('T')[0] + '.pdf';
        doc.save(filename);
        
        console.log('✅ PDF gerado:', filename);
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        alert('Error generating PDF: ' + error.message);
    } finally {
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.disabled = false;
        }, 1000);
    }
}

// Expor para debug
window.setupPDFButton = setupPDFButton;
window.getLastResults = () => lastCalculationResults;
window.testPDF = () => {
    if (lastCalculationResults) {
        const btn = document.getElementById('downloadPdfBtn');
        if (btn) generateSimplePDF(lastCalculationResults, btn);
    } else {
        console.error('Sem resultados. Faça um cálculo primeiro.');
    }
};

console.log('✅ PDF Export Integration carregada');
console.log('📋 Debug: window.testPDF() | window.getLastResults()');
