/* ========================================
   BUILDING SUSTAINABILITY FRAMEWORK
   Charts Module - 6 Scenarios Visualization
   ======================================== */

const ChartsModule = (function() {
    let barChart, pieChart, lineChart;
    let resultsData = null;

    // Chart.js default config
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    Chart.defaults.color = '#64748b';

    function init(data) {
        console.log('📊 Initializing charts with data:', data);
        resultsData = data;
        
        // Destroy existing charts
        destroyCharts();
        
        // Create new charts
        setTimeout(() => {
            createBarChart();
            createPieChart();
            createLineChart();
            createComparisonTable();
        }, 300);
    }

    function destroyCharts() {
        if (barChart) barChart.destroy();
        if (pieChart) pieChart.destroy();
        if (lineChart) lineChart.destroy();
    }

    /* ========================================
       BAR CHART - 6 SCENARIOS COMPARISON
       ======================================== */
    function createBarChart() {
        const ctx = document.getElementById('barChart');
        if (!ctx || !resultsData) return;

        const scenarios = resultsData.allScenarios;
        
        // Ordenar cenários por total carbon (menor para maior)
        const sortedScenarios = Object.keys(scenarios).sort((a, b) => 
            scenarios[a].totalCarbon - scenarios[b].totalCarbon
        );

        const labels = sortedScenarios.map(key => scenarios[key].name);
        const embodiedData = sortedScenarios.map(key => scenarios[key].embodiedCarbon);
        const operationalData = sortedScenarios.map(key => scenarios[key].operationalCarbon);
        
        // Cores: Verde para renovation, Vermelho para new build
        const colors = sortedScenarios.map(key => 
            scenarios[key].category === 'renovation' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        );
        const borderColors = sortedScenarios.map(key => 
            scenarios[key].category === 'renovation' ? '#10b981' : '#ef4444'
        );

        barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Embodied Carbon',
                        data: embodiedData,
                        backgroundColor: colors,
                        borderColor: borderColors,
                        borderWidth: 2,
                        borderRadius: 8,
                    },
                    {
                        label: 'Operational Carbon',
                        data: operationalData,
                        backgroundColor: colors.map(c => c.replace('0.8', '0.5')),
                        borderColor: borderColors,
                        borderWidth: 2,
                        borderRadius: 8,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Carbon Comparison Across 6 Scenarios',
                        font: { size: 18, weight: 'bold' },
                        color: '#1f2937',
                        padding: { bottom: 20 }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { size: 13, weight: '600' },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'rectRounded'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(31, 41, 55, 0.95)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + 
                                       context.parsed.y.toLocaleString() + ' tCO₂e';
                            },
                            footer: function(tooltipItems) {
                                const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                                return 'Total: ' + total.toLocaleString() + ' tCO₂e';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false },
                        ticks: {
                            font: { size: 12, weight: '600' },
                            color: '#374151',
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            color: '#e5e7eb',
                            lineWidth: 1
                        },
                        ticks: {
                            font: { size: 12 },
                            color: '#6b7280',
                            callback: function(value) {
                                return value.toLocaleString() + ' tCO₂e';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Total Carbon Emissions (tCO₂e)',
                            font: { size: 13, weight: '600' },
                            color: '#374151'
                        }
                    }
                }
            }
        });
    }

    /* ========================================
       PIE CHART - BREAKDOWN (BEST SCENARIOS)
       ======================================== */
    function createPieChart() {
        const ctx = document.getElementById('pieChart');
        if (!ctx || !resultsData) return;

        const bestRenovation = resultsData.bestRenovation;
        const bestNewbuild = resultsData.bestNewbuild;

        pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    bestRenovation.name + ' (Embodied)',
                    bestRenovation.name + ' (Operational)',
                    bestNewbuild.name + ' (Embodied)',
                    bestNewbuild.name + ' (Operational)'
                ],
                datasets: [{
                    data: [
                        bestRenovation.embodiedCarbon,
                        bestRenovation.operationalCarbon,
                        bestNewbuild.embodiedCarbon,
                        bestNewbuild.operationalCarbon
                    ],
                    backgroundColor: [
                        '#10b981',  // Green - Renovation Embodied
                        '#34d399',  // Light Green - Renovation Operational
                        '#ef4444',  // Red - New Build Embodied
                        '#f87171'   // Light Red - New Build Operational
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Carbon Breakdown: Best Renovation vs Best New Build',
                        font: { size: 18, weight: 'bold' },
                        color: '#1f2937',
                        padding: { bottom: 20 }
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            font: { size: 12, weight: '600' },
                            padding: 12,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(31, 41, 55, 0.95)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return context.label + ': ' + value.toLocaleString() + 
                                       ' tCO₂e (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    /* ========================================
       LINE CHART - TIMELINE (CUMULATIVE)
       ======================================== */
    function createLineChart() {
        const ctx = document.getElementById('lineChart');
        if (!ctx || !resultsData) return;

        const scenarios = resultsData.allScenarios;
        const lifespan = resultsData.inputs.lifespan;
        
        // Generate years array (0 to lifespan)
        const years = Array.from({ length: lifespan + 1 }, (_, i) => i);
        
        // Calculate cumulative carbon for each scenario
        const datasets = Object.keys(scenarios).map(key => {
            const scenario = scenarios[key];
            const embodied = scenario.embodiedCarbon;
            const operationalPerYear = scenario.operationalCarbon / lifespan;
            
            const cumulativeData = years.map(year => 
                Math.round(embodied + (operationalPerYear * year))
            );
            
            const isRenovation = scenario.category === 'renovation';
            const color = isRenovation ? 
                ['#10b981', '#34d399', '#6ee7b7'][Object.keys(scenarios).indexOf(key) % 3] :
                ['#ef4444', '#f87171', '#fca5a5'][Object.keys(scenarios).indexOf(key) % 3];
            
            return {
                label: scenario.name,
                data: cumulativeData,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 3,
                tension: 0.4,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            };
        });

        lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years.map(y => 'Year ' + y),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Cumulative Carbon Over Building Lifespan',
                        font: { size: 18, weight: 'bold' },
                        color: '#1f2937',
                        padding: { bottom: 20 }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { size: 11, weight: '600' },
                            padding: 10,
                            usePointStyle: true,
                            pointStyle: 'line'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(31, 41, 55, 0.95)',
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + 
                                       context.parsed.y.toLocaleString() + ' tCO₂e';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 11 },
                            color: '#6b7280',
                            maxTicksLimit: 15,
                            callback: function(value, index) {
                                // Show every 5 years
                                return index % 5 === 0 ? 'Year ' + index : '';
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e5e7eb',
                            lineWidth: 1
                        },
                        ticks: {
                            font: { size: 11 },
                            color: '#6b7280',
                            callback: function(value) {
                                return (value / 1000).toFixed(0) + 'k tCO₂e';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Cumulative Carbon (tCO₂e)',
                            font: { size: 12, weight: '600' },
                            color: '#374151'
                        }
                    }
                }
            }
        });
    }

    /* ========================================
       COMPARISON TABLE - 6 SCENARIOS
       ======================================== */
    function createComparisonTable() {
        const table = document.getElementById('comparisonTable');
        if (!table || !resultsData) return;

        const tbody = table.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing

        const scenarios = resultsData.allScenarios;
        const scenarioKeys = Object.keys(scenarios);
        
        // Encontrar o melhor (menor) valor de cada métrica
        const bestEmbodied = Math.min(...scenarioKeys.map(k => scenarios[k].embodiedCarbon));
        const bestOperational = Math.min(...scenarioKeys.map(k => scenarios[k].operationalCarbon));
        const bestTotal = Math.min(...scenarioKeys.map(k => scenarios[k].totalCarbon));

        // Row 1: Total Carbon
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td class="metric-name">Total Carbon</td>
            ${scenarioKeys.map(key => {
                const value = scenarios[key].totalCarbon;
                const isBest = value === bestTotal;
                return `<td class="${isBest ? 'best-value' : ''}">
                    ${value.toLocaleString()} tCO₂e
                    ${isBest ? ' ✓' : ''}
                </td>`;
            }).join('')}
        `;
        tbody.appendChild(totalRow);

        // Row 2: Embodied Carbon
        const embodiedRow = document.createElement('tr');
        embodiedRow.innerHTML = `
            <td class="metric-name">Embodied Carbon</td>
            ${scenarioKeys.map(key => {
                const value = scenarios[key].embodiedCarbon;
                const isBest = value === bestEmbodied;
                return `<td class="${isBest ? 'best-value' : ''}">
                    ${value.toLocaleString()} tCO₂e
                    ${isBest ? ' ✓' : ''}
                </td>`;
            }).join('')}
        `;
        tbody.appendChild(embodiedRow);

        // Row 3: Operational Carbon
        const operationalRow = document.createElement('tr');
        operationalRow.innerHTML = `
            <td class="metric-name">Operational Carbon</td>
            ${scenarioKeys.map(key => {
                const value = scenarios[key].operationalCarbon;
                const isBest = value === bestOperational;
                return `<td class="${isBest ? 'best-value' : ''}">
                    ${value.toLocaleString()} tCO₂e
                    ${isBest ? ' ✓' : ''}
                </td>`;
            }).join('')}
        `;
        tbody.appendChild(operationalRow);

        // Row 4: Category
        const categoryRow = document.createElement('tr');
        categoryRow.innerHTML = `
            <td class="metric-name">Category</td>
            ${scenarioKeys.map(key => 
                `<td>${scenarios[key].category === 'renovation' ? '🔨 Renovation' : '🏗️ New Build'}</td>`
            ).join('')}
        `;
        tbody.appendChild(categoryRow);
    }

    /* ========================================
       PUBLIC API
       ======================================== */
    return {
        init: init,
        destroy: destroyCharts
    };
})();

// Expose to global scope
window.ChartsModule = ChartsModule;

console.log('✨ Charts module loaded (6 scenarios support)');
