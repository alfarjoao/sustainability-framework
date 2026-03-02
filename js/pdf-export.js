/**
 * PDF EXPORT MODULE
 * Building Sustainability Framework
 * Generates comprehensive 4-page PDF report with charts and tables
 * Supports 7 scenarios and new inline material selector
 * ✅ UPDATED: Complete input summary including all user data
 */

const PDFExportModule = (function() {
    'use strict';

    let resultsData = null;

    /**
     * Initialize PDF export
     * @param {Object} data - Results data from calculator
     */
    function init(data) {
        if (!data || !data.allScenarios || !Array.isArray(data.allScenarios)) {
            console.error('PDFExport: Invalid data provided');
            return;
        }

        resultsData = data;
        console.log('✅ PDF Export initialized with complete data:', resultsData);
    }

    /**
     * Check if required libraries are loaded
     */
    function checkDependencies() {
        if (typeof html2canvas === 'undefined') {
            console.error('PDFExport: html2canvas not loaded');
            return false;
        }
        if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
            console.error('PDFExport: jsPDF not loaded');
            return false;
        }
        return true;
    }

    /**
     * Generate and download PDF report
     */
    async function generatePDF() {
        if (!resultsData) {
            alert('No results data available. Please complete the calculation first.');
            return;
        }

        if (!checkDependencies()) {
            alert('PDF libraries not loaded. Please refresh the page and try again.');
            return;
        }

        try {
            // Show loading indicator
            const exportBtn = document.querySelector('.export-btn, #btn-export-pdf');
            const originalText = exportBtn ? exportBtn.innerHTML : '';
            if (exportBtn) {
                exportBtn.innerHTML = '<span class="btn-icon">⏳</span> Generating PDF...';
                exportBtn.disabled = true;
            }

            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;

            // PAGE 1: Cover Page & Summary
            await generateCoverPage(pdf, pageWidth, pageHeight, margin);

            // PAGE 2: Complete Input Summary
            pdf.addPage();
            await generateInputSummaryPage(pdf, pageWidth, pageHeight, margin);

            // PAGE 3: Detailed Results & Charts
            pdf.addPage();
            await generateResultsPage(pdf, pageWidth, pageHeight, margin);

            // PAGE 4: Scenarios Comparison
            pdf.addPage();
            await generateComparisonPage(pdf, pageWidth, pageHeight, margin);

            // PAGE 5: Methodology & Materials
            pdf.addPage();
            await generateMethodologyPage(pdf, pageWidth, pageHeight, margin);

            // Save PDF
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `SustainaBuild_Report_${timestamp}.pdf`;
            pdf.save(filename);

            // Restore button
            if (exportBtn) {
                exportBtn.innerHTML = originalText;
                exportBtn.disabled = false;
            }

            console.log('✅ PDF generated successfully (5 pages with complete data)');
        } catch (error) {
            console.error('PDFExport: Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
            
            // Restore button
            const exportBtn = document.querySelector('.export-btn, #btn-export-pdf');
            if (exportBtn) {
                exportBtn.innerHTML = '<span class="btn-icon">📄</span> Export PDF Report';
                exportBtn.disabled = false;
            }
        }
    }

    /**
     * PAGE 1: Cover Page & Summary
     */
    async function generateCoverPage(pdf, pageWidth, pageHeight, margin) {
        let y = margin + 20;

        // Logo/Title
        pdf.setFillColor(4, 120, 87); // Primary green
        pdf.rect(0, 0, pageWidth, 50, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SustainaBuild', pageWidth / 2, 25, { align: 'center' });
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Building Carbon Assessment Report', pageWidth / 2, 35, { align: 'center' });

        y = 70;
        pdf.setTextColor(0, 0, 0);

        // Decision Box
        const decision = resultsData.decision;
        const boxHeight = 40;
        
        if (decision === 'RENOVATE') {
            pdf.setFillColor(16, 185, 129); // Green
        } else {
            pdf.setFillColor(239, 68, 68); // Red
        }
        
        pdf.roundedRect(margin, y, pageWidth - 2 * margin, boxHeight, 3, 3, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Recommendation: ${decision}`, pageWidth / 2, y + 15, { align: 'center' });
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        const savingsText = `${resultsData.savingsPercent}% Carbon Savings`;
        pdf.text(savingsText, pageWidth / 2, y + 30, { align: 'center' });

        y += boxHeight + 20;
        pdf.setTextColor(0, 0, 0);

        // Quick Project Summary
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Project Overview', margin, y);
        y += 10;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const details = [
            ['Building Type:', capitalizeFirst(resultsData.inputs.buildingType || 'N/A')],
            ['Program After Renovation:', capitalizeFirst(resultsData.inputs.programAfterRenovation || 'N/A')],
            ['Floor Area:', `${(resultsData.inputs.buildingArea || 0).toLocaleString()} m²`],
            ['Climate Zone:', capitalizeFirst(resultsData.inputs.climate || 'N/A')],
            ['Total Materials:', `${(resultsData.inputs.totalMaterialQuantity || 0).toLocaleString()} tonnes`]
        ];

        details.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label, margin, y);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 65, y);
            y += 7;
        });

        // Best Scenarios
        y += 15;
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Optimal Scenarios', margin, y);
        y += 10;

        pdf.setFontSize(11);
        
        const best = resultsData.bestRenovation;
        const bestNew = resultsData.bestNewbuild;

        pdf.setFont('helvetica', 'bold');
        pdf.text('Best Renovation:', margin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${best.displayName}`, margin + 40, y);
        y += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Total: ${(best.totalCarbon / 1000).toFixed(1)} tCO₂e over ${best.lifespan} years`, margin + 5, y);
        y += 10;
        pdf.setTextColor(0, 0, 0);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Best New Build:', margin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${bestNew.displayName}`, margin + 40, y);
        y += 6;
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Total: ${(bestNew.totalCarbon / 1000).toFixed(1)} tCO₂e over ${bestNew.lifespan} years`, margin + 5, y);

        // Footer
        y = pageHeight - 20;
        pdf.setFontSize(9);
        pdf.setTextColor(128, 128, 128);
        const date = new Date().toLocaleDateString();
        pdf.text(`Generated on ${date} by SustainaBuild Framework`, pageWidth / 2, y, { align: 'center' });
        pdf.text('Page 1 of 5', pageWidth / 2, y + 5, { align: 'center' });
    }

    /**
     * PAGE 2: Complete Input Summary
     */
    async function generateInputSummaryPage(pdf, pageWidth, pageHeight, margin) {
        let y = margin;

        // Header
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(4, 120, 87);
        pdf.text('Complete Input Summary', margin, y);
        y += 15;

        const inputs = resultsData.inputs;

        // SECTION 1: Building Information
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Building Information', margin, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const buildingInfo = [
            ['Building Type:', capitalizeFirst(inputs.buildingType || 'N/A')],
            ['Program After Renovation:', capitalizeFirst(inputs.programAfterRenovation || 'N/A')],
            ['Building Area:', `${(inputs.buildingArea || 0).toLocaleString()} m²`],
            ['Recommended Lifespan:', `${inputs.lifespan || 0} years`]
        ];

        buildingInfo.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label, margin + 5, y);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 75, y);
            y += 6;
        });

        y += 10;

        // SECTION 2: Environmental Context
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Environmental Context', margin, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const climateLabels = {
            'temperate': 'Temperate',
            'cold': 'Cold',
            'hot-dry': 'Hot & Dry',
            'hot-humid': 'Hot & Humid',
            'coastal': 'Coastal',
            'mountain': 'Mountain'
        };

        const envContext = [
            ['Climate Zone:', climateLabels[inputs.climate] || capitalizeFirst(inputs.climate || 'N/A')],
            ['Climate Multiplier:', inputs.climateFactor ? inputs.climateFactor.toFixed(2) : 'N/A'],
            ['Embodied Energy Base:', inputs.embodiedEnergy ? `${inputs.embodiedEnergy.toFixed(2)} MJ/m²` : 'N/A']
        ];

        envContext.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label, margin + 5, y);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 75, y);
            y += 6;
        });

        y += 10;

        // SECTION 3: Energy Baselines
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Energy Baselines', margin, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const energyBaselines = [
            ['Program Baseline:', `${inputs.programBaseline || 0} kWh/m²/yr`],
            ['Program Factor:', inputs.programFactor ? inputs.programFactor.toFixed(2) : 'N/A']
        ];

        energyBaselines.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label, margin + 5, y);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 75, y);
            y += 6;
        });

        y += 10;

        // SECTION 4: Materials & Quantities
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Materials & Quantities', margin, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Total Material Quantity:', margin + 5, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${(inputs.totalMaterialQuantity || 0).toLocaleString()} tonnes`, margin + 75, y);
        y += 6;

        pdf.setFont('helvetica', 'bold');
        pdf.text('Material Factor:', margin + 5, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(inputs.materialFactor ? inputs.materialFactor.toFixed(2) : 'N/A', margin + 75, y);
        y += 10;

        // Material breakdown table
        if (inputs.materials && inputs.materials.length > 0) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Material Breakdown:', margin + 5, y);
            y += 8;

            // Table header
            pdf.setFillColor(4, 120, 87);
            pdf.rect(margin + 5, y, 80, 8, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(9);
            pdf.text('Material', margin + 8, y + 5);
            pdf.text('Quantity (tonnes)', margin + 50, y + 5);
            y += 8;

            // Table rows
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
            
            inputs.materials.forEach((mat, index) => {
                const fillColor = index % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
                pdf.setFillColor(...fillColor);
                pdf.rect(margin + 5, y, 80, 7, 'F');
                
                const qty = inputs.materialQuantities?.[mat] || 0;
                pdf.text(capitalizeFirst(mat), margin + 8, y + 5);
                pdf.text(qty.toLocaleString(), margin + 50, y + 5);
                y += 7;
            });
        } else {
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(100, 100, 100);
            pdf.text('No materials specified', margin + 5, y);
        }

        // Footer
        pdf.setFontSize(9);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Page 2 of 5', pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    /**
     * PAGE 3: Detailed Results & Charts
     */
    async function generateResultsPage(pdf, pageWidth, pageHeight, margin) {
        let y = margin;

        // Header
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(4, 120, 87);
        pdf.text('Detailed Carbon Analysis', margin, y);
        y += 12;

        // Capture bar chart
        const chartCanvas = document.querySelector('#barChart');
        if (chartCanvas) {
            try {
                const chartImage = await html2canvas(chartCanvas.parentElement, {
                    scale: 2,
                    backgroundColor: '#ffffff'
                });
                
                const imgData = chartImage.toDataURL('image/png');
                const imgWidth = pageWidth - 2 * margin;
                const imgHeight = (chartImage.height * imgWidth) / chartImage.width;
                
                pdf.addImage(imgData, 'PNG', margin, y, imgWidth, Math.min(imgHeight, 100));
                y += Math.min(imgHeight, 100) + 10;
            } catch (error) {
                console.warn('Could not capture bar chart:', error);
                y += 10;
            }
        }

        // Scenarios Table (Top 4)
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Top 4 Scenarios (Lowest Carbon)', margin, y);
        y += 8;

        const sorted = [...resultsData.allScenarios].sort((a, b) => a.totalCarbon - b.totalCarbon);
        const top4 = sorted.slice(0, 4);

        pdf.setFontSize(9);
        const colWidths = [60, 35, 35, 35];
        const rowHeight = 8;

        // Table header
        pdf.setFillColor(4, 120, 87);
        pdf.setTextColor(255, 255, 255);
        pdf.rect(margin, y, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Scenario', margin + 2, y + 5);
        pdf.text('Embodied', margin + colWidths[0] + 2, y + 5);
        pdf.text('Operational', margin + colWidths[0] + colWidths[1] + 2, y + 5);
        pdf.text('Total', margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);
        y += rowHeight;

        // Table rows
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        top4.forEach((scenario, index) => {
            const fillColor = index % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
            pdf.setFillColor(...fillColor);
            pdf.rect(margin, y, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
            
            pdf.text(scenario.displayName, margin + 2, y + 5);
            pdf.text(`${(scenario.embodiedCarbon / 1000).toFixed(1)} t`, margin + colWidths[0] + 2, y + 5);
            pdf.text(`${(scenario.operationalCarbon / 1000).toFixed(1)} t`, margin + colWidths[0] + colWidths[1] + 2, y + 5);
            pdf.text(`${(scenario.totalCarbon / 1000).toFixed(1)} t`, margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);
            y += rowHeight;
        });

        // Key Insights
        y += 10;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(4, 120, 87);
        pdf.text('Key Insights', margin, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        const insights = generateInsights(resultsData);
        insights.forEach(insight => {
            const lines = pdf.splitTextToSize(`• ${insight}`, pageWidth - 2 * margin - 5);
            lines.forEach(line => {
                pdf.text(line, margin + 5, y);
                y += 5;
            });
            y += 2;
        });

        // Footer
        pdf.setFontSize(9);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Page 3 of 5', pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    /**
     * PAGE 4: Scenarios Comparison
     */
    async function generateComparisonPage(pdf, pageWidth, pageHeight, margin) {
        let y = margin;

        // Header
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(4, 120, 87);
        pdf.text('Complete Scenarios Comparison', margin, y);
        y += 12;

        // Full comparison table
        pdf.setFontSize(8);
        const colWidths = [55, 20, 20, 20, 20, 20];
        const rowHeight = 7;

        // Header row
        pdf.setFillColor(4, 120, 87);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        
        const totalWidth = colWidths.reduce((a, b) => a + b, 0);
        pdf.rect(margin, y, totalWidth, rowHeight, 'F');
        
        pdf.text('Scenario', margin + 2, y + 5);
        pdf.text('Embodied', margin + colWidths[0] + 2, y + 5);
        pdf.text('Operational', margin + colWidths[0] + colWidths[1] + 2, y + 5);
        pdf.text('Total', margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);
        pdf.text('Lifespan', margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, y + 5);
        pdf.text('Category', margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 2, y + 5);
        y += rowHeight;

        // Data rows
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        resultsData.allScenarios.forEach((scenario, index) => {
            const fillColor = index % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
            pdf.setFillColor(...fillColor);
            pdf.rect(margin, y, totalWidth, rowHeight, 'F');
            
            pdf.text(scenario.displayName, margin + 2, y + 5);
            pdf.text(`${(scenario.embodiedCarbon / 1000).toFixed(1)}`, margin + colWidths[0] + 2, y + 5);
            pdf.text(`${(scenario.operationalCarbon / 1000).toFixed(1)}`, margin + colWidths[0] + colWidths[1] + 2, y + 5);
            pdf.text(`${(scenario.totalCarbon / 1000).toFixed(1)}`, margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);
            pdf.text(`${scenario.lifespan}y`, margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, y + 5);
            pdf.text(scenario.category, margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 2, y + 5);
            y += rowHeight;
        });

        // Renovation vs New Build Analysis
        y += 15;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(4, 120, 87);
        pdf.text('Renovation vs New Build Analysis', margin, y);
        y += 10;

        const renovations = resultsData.allScenarios.filter(s => s.category === 'renovation');
        const newBuilds = resultsData.allScenarios.filter(s => s.category === 'newbuild');

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);

        const avgRenov = renovations.reduce((sum, s) => sum + s.totalCarbon, 0) / renovations.length;
        const avgNew = newBuilds.reduce((sum, s) => sum + s.totalCarbon, 0) / newBuilds.length;

        pdf.text(`Average Renovation Carbon: ${(avgRenov / 1000).toFixed(1)} tCO₂e`, margin, y);
        y += 7;
        pdf.text(`Average New Build Carbon: ${(avgNew / 1000).toFixed(1)} tCO₂e`, margin, y);
        y += 7;
        pdf.text(`Difference: ${((avgNew - avgRenov) / 1000).toFixed(1)} tCO₂e (${(((avgNew - avgRenov) / avgNew) * 100).toFixed(1)}%)`, margin, y);

        // Footer
        pdf.setFontSize(9);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Page 4 of 5', pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    /**
     * PAGE 5: Methodology & Materials
     */
    async function generateMethodologyPage(pdf, pageWidth, pageHeight, margin) {
        let y = margin;

        // Header
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(4, 120, 87);
        pdf.text('Methodology & Assumptions', margin, y);
        y += 12;

        // Calculation Methodology
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Calculation Methodology', margin, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const methodology = [
            'Embodied Carbon: Calculated based on material quantities, construction context, and scenario-specific reuse rates and embodied factors. Material-specific carbon intensities are applied.',
            'Operational Carbon: Derived from building type baseline energy use (kWh/m²/yr), adjusted for climate zone multipliers, program factors, and scenario-specific performance improvements over the specified lifespan.',
            'Total Carbon: Sum of embodied and operational carbon emissions over the specified lifespan of each scenario, expressed in tCO₂e.',
            'Decision Logic: Compares the best renovation scenario against the best new build scenario. Recommends RENOVATE if renovation total carbon is lower; otherwise recommends DEMOLISH & REBUILD.',
            'Data Sources: Embodied carbon factors from ICE database v3.0; operational energy baselines from ASHRAE 90.1 and local standards; climate multipliers from regional studies.'
        ];

        methodology.forEach(text => {
            const lines = pdf.splitTextToSize(`• ${text}`, pageWidth - 2 * margin - 5);
            lines.forEach(line => {
                pdf.text(line, margin + 5, y);
                y += 5;
            });
            y += 3;
        });

        // Scenario Descriptions
        y += 8;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Scenario Descriptions', margin, y);
        y += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        const scenarioDescriptions = [
            'Light Renovation: Minimal intervention, 90% reuse, 10% embodied factor, 25% operational improvement, 17.5-year lifespan.',
            'Medium Renovation: Moderate upgrade, 70% reuse, 27.5% embodied factor, 47.5% operational improvement, 22.5-year lifespan.',
            'Deep Renovation: Extensive intervention, 52.5% reuse, 45% embodied factor, 70% operational improvement, 30-year lifespan.',
            'Deep + Demo: Selective demolition + deep renovation, 42.5% reuse, 55% embodied factor, 75% operational improvement, 35-year lifespan.',
            'Code-Compliant New: Minimum code compliance, 2.5% reuse, 97.5% embodied factor, 84% operational improvement, 40-year lifespan.',
            'High-Performance New: Advanced systems, 10% reuse, 82.5% embodied factor, 94% operational improvement, 50-year lifespan.',
            'Low-Carbon New: Net-zero ready, 22.5% reuse, 65% embodied factor, 98% operational improvement, 60-year lifespan.'
        ];

        scenarioDescriptions.forEach(desc => {
            const lines = pdf.splitTextToSize(`• ${desc}`, pageWidth - 2 * margin - 5);
            lines.forEach(line => {
                pdf.text(line, margin + 5, y);
                y += 4;
            });
            y += 2;
        });

        // Limitations
        y += 8;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(4, 120, 87);
        pdf.text('Limitations & Disclaimer', margin, y);
        y += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        const disclaimer = 'This assessment provides preliminary estimates based on simplified assumptions and industry-standard factors. Actual carbon emissions may vary significantly based on specific project details, local conditions, material sourcing, supply chain practices, construction methods, occupant behavior, and operational practices. This report should be used for comparative analysis and initial decision-making only. Detailed life cycle assessments (LCA) and project-specific analysis by qualified professionals are strongly recommended for final decisions and regulatory compliance.';
        
        const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 2 * margin);
        disclaimerLines.forEach(line => {
            pdf.text(line, margin, y);
            y += 4;
        });

        // Footer
        y = pageHeight - 30;
        pdf.setFillColor(4, 120, 87);
        pdf.rect(0, y, pageWidth, 20, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SustainaBuild Framework', pageWidth / 2, y + 8, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.text('Building a sustainable future, one decision at a time', pageWidth / 2, y + 14, { align: 'center' });

        pdf.setFontSize(9);
        pdf.setTextColor(200, 200, 200);
        pdf.text('Page 5 of 5', pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    // Helper Functions

    function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
    }

    function generateInsights(data) {
        const insights = [];
        const best = data.bestRenovation;
        const bestNew = data.bestNewbuild;
        
        insights.push(`The ${best.displayName} scenario achieves the lowest carbon footprint among renovation options at ${(best.totalCarbon / 1000).toFixed(1)} tCO₂e over ${best.lifespan} years.`);
        
        insights.push(`Compared to the best new build option (${bestNew.displayName}), the recommended scenario saves ${data.savingsPercent}% in total carbon emissions.`);
        
        const embodiedPercent = (best.embodiedCarbon / best.totalCarbon * 100).toFixed(0);
        insights.push(`Embodied carbon represents ${embodiedPercent}% of total carbon in the recommended scenario, highlighting the importance of material selection and reuse.`);
        
        if (data.inputs.buildingArea) {
            const carbonPerM2 = (best.totalCarbon / data.inputs.buildingArea).toFixed(1);
            insights.push(`Carbon intensity for the recommended scenario is ${carbonPerM2} kgCO₂e/m² over the project lifespan.`);
        }

        if (data.inputs.totalMaterialQuantity) {
            insights.push(`Total materials specified: ${data.inputs.totalMaterialQuantity.toLocaleString()} tonnes across ${data.inputs.materials.length} material types.`);
        }

        return insights;
    }

    // Public API
    return {
        init,
        generatePDF
    };
})();

// Expose globally
window.PDFExportModule = PDFExportModule;

// Auto-attach to export button
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.querySelector('.export-btn, #btn-export-pdf');
    if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            PDFExportModule.generatePDF();
        });
        console.log('✅ PDF Export button attached');
    }
});

// ✅ MELHOR HANDLING DE EVENTOS - Adiciona no final do arquivo

// Tenta anexar o evento de várias formas
function attachExportButton() {
    console.log('🔍 Procurando botão de export PDF...');
    
    // Possíveis seletores do botão
    const selectors = [
        '.export-btn',
        '#btn-export-pdf',
        '[data-action="export-pdf"]',
        'button[onclick*="PDF"]',
        '.btn-export-pdf'
    ];
    
    let exportBtn = null;
    
    for (const selector of selectors) {
        exportBtn = document.querySelector(selector);
        if (exportBtn) {
            console.log(`✅ Botão encontrado com seletor: ${selector}`);
            break;
        }
    }
    
    if (!exportBtn) {
        console.warn('⚠️ Botão de export PDF não encontrado! Seletores tentados:', selectors);
        return false;
    }
    
    // Remove listeners antigos
    const newBtn = exportBtn.cloneNode(true);
    exportBtn.parentNode.replaceChild(newBtn, exportBtn);
    exportBtn = newBtn;
    
    // Adiciona listener
    exportBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('📄 Botão PDF clicado!');
        PDFExportModule.generatePDF();
    });
    
    console.log('✅ Event listener anexado ao botão PDF');
    return true;
}

// Tenta anexar imediatamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachExportButton);
} else {
    attachExportButton();
}

// Tenta novamente após 2 segundos (caso o botão seja renderizado dinamicamente)
setTimeout(attachExportButton, 2000);

// Expor função globalmente para debug
window.attachPDFExportButton = attachExportButton;
