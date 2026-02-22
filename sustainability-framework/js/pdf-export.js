/**
 * PDF Export Module - With All Charts
 * Generates PDF reports from calculation results
 */

(function() {
    'use strict';

    const PDFExport = {
        
        init() {
            console.log('🔍 Checking PDF libraries...');
            
            // Check if libraries are loaded
            if (typeof html2canvas === 'undefined') {
                console.error('❌ html2canvas not loaded');
                return;
            }
            if (typeof window.jspdf === 'undefined') {
                console.error('❌ jsPDF not loaded');
                return;
            }
            
            console.log('✅ PDF libraries loaded');
            
            const downloadBtn = document.getElementById('downloadPdfBtn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    console.log('📄 PDF button clicked');
                    this.generatePDF();
                });
                console.log('✅ PDF button listener attached');
            } else {
                console.error('❌ Download button not found');
            }
        },

        async generatePDF() {
            console.log('🚀 Starting PDF generation...');
            
            const btn = document.getElementById('downloadPdfBtn');
            const originalHTML = btn.innerHTML;
            
            try {
                // Show loading
                btn.disabled = true;
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="60" stroke-dashoffset="20" opacity="0.25"/></svg> Generating PDF...';
                
                console.log('📦 Creating jsPDF instance...');
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                let yPos = 20;
                
                // ==========================================
                // PAGE 1: HEADER & SUMMARY
                // ==========================================
                
                // Header
                doc.setFontSize(22);
                doc.setTextColor(4, 120, 87);
                doc.text('SUSTAINABUILD', 20, yPos);
                yPos += 10;
                
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text('Building Sustainability Assessment Report', 20, yPos);
                yPos += 15;
                
                // Date
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-GB');
                doc.setFontSize(10);
                doc.text(`Generated: ${dateStr}`, 20, yPos);
                yPos += 15;
                
                // Decision
                const decision = document.getElementById('decisionText')?.textContent || 'N/A';
                doc.setFontSize(18);
                doc.setTextColor(4, 120, 87);
                doc.text(`DECISION: ${decision}`, 20, yPos);
                yPos += 12;
                
                // Title
                const title = document.getElementById('resultsTitle')?.textContent || 'N/A';
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(title, 20, yPos);
                yPos += 15;
                
                // Carbon values
                doc.setFontSize(12);
                doc.text('Carbon Comparison:', 20, yPos);
                yPos += 8;
                
                const renovationTotal = document.getElementById('renovationTotal')?.textContent || '0';
                const newbuildTotal = document.getElementById('newbuildTotal')?.textContent || '0';
                
                doc.setFontSize(11);
                doc.text(`Renovation: ${renovationTotal} tCO₂e`, 30, yPos);
                yPos += 6;
                doc.text(`New Build: ${newbuildTotal} tCO₂e`, 30, yPos);
                yPos += 10;
                
                // Savings
                const savingsAmount = document.getElementById('savingsAmount')?.textContent || '0';
                const savingsPercent = document.getElementById('savingsPercent')?.textContent || '0';
                
                doc.setTextColor(4, 120, 87);
                doc.text(`Savings: ${savingsAmount} ${savingsPercent}`, 30, yPos);
                yPos += 15;
                
                // Building inputs
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text('Building Inputs:', 20, yPos);
                yPos += 8;
                
                const formData = window.calculatorDebug?.formData || {};
                
                doc.setFontSize(10);
                doc.text(`Area: ${formData.buildingArea || 'N/A'} m²`, 30, yPos);
                yPos += 5;
                doc.text(`Lifespan: ${formData.lifespan || 'N/A'} years`, 30, yPos);
                yPos += 5;
                doc.text(`Material: ${formData.structuralMaterial || 'N/A'}`, 30, yPos);
                yPos += 5;
                doc.text(`Climate: ${formData.climateZone || 'N/A'}`, 30, yPos);
                yPos += 15;
                
                // ==========================================
                // CHARTS - ALL 4 VISUALIZATIONS
                // ==========================================
                
                console.log('📊 Capturing all charts...');
                
                const charts = [
                    { id: 'barChart', title: '1. Carbon Comparison (Bar Chart)' },
                    { id: 'pieChart', title: '2. Carbon Breakdown (Pie Chart)' },
                    { id: 'lineChart', title: '3. Lifecycle Timeline (Line Chart)' }
                ];
                
                for (let i = 0; i < charts.length; i++) {
                    const chart = charts[i];
                    const canvas = document.getElementById(chart.id);
                    
                    if (canvas) {
                        try {
                            // Check if we need a new page
                            if (yPos > pageHeight - 90) {
                                doc.addPage();
                                yPos = 20;
                            }
                            
                            // Chart title
                            doc.setFontSize(13);
                            doc.setTextColor(0, 0, 0);
                            doc.setFont('helvetica', 'bold');
                            doc.text(chart.title, 20, yPos);
                            yPos += 8;
                            doc.setFont('helvetica', 'normal');
                            
                            // Chart image
                            const chartImage = canvas.toDataURL('image/png', 1.0);
                            doc.addImage(chartImage, 'PNG', 20, yPos, 170, 70);
                            yPos += 78;
                            
                            console.log(`✅ ${chart.title} added to PDF`);
                        } catch (chartError) {
                            console.warn(`⚠️ ${chart.title} capture failed:`, chartError);
                            doc.setFontSize(10);
                            doc.setTextColor(150, 150, 150);
                            doc.text(`(${chart.title} not available)`, 30, yPos);
                            yPos += 10;
                        }
                    }
                }
                
                // ==========================================
                // COMPARISON TABLE (NEW PAGE)
                // ==========================================
                
                doc.addPage();
                yPos = 20;
                
                doc.setFontSize(13);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'bold');
                doc.text('4. Scenario Comparison Table', 20, yPos);
                yPos += 10;
                doc.setFont('helvetica', 'normal');
                
                // Get table data
                const table = document.getElementById('comparisonTable');
                if (table) {
                    try {
                        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
                        const rows = Array.from(table.querySelectorAll('tbody tr'));
                        
                        // Table settings
                        const colWidths = [50, 40, 40, 40];
                        const startX = 20;
                        let tableY = yPos;
                        
                        // Draw header
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        doc.setFillColor(248, 250, 252);
                        doc.rect(startX, tableY, 170, 8, 'F');
                        
                        let xPos = startX + 2;
                        headers.forEach((header, i) => {
                            doc.text(header, xPos, tableY + 5.5);
                            xPos += colWidths[i];
                        });
                        tableY += 8;
                        
                        // Draw rows
                        doc.setFont('helvetica', 'normal');
                        rows.forEach((row, rowIndex) => {
                            const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
                            
                            // Alternate row background
                            if (rowIndex % 2 === 0) {
                                doc.setFillColor(255, 255, 255);
                            } else {
                                doc.setFillColor(248, 250, 252);
                            }
                            doc.rect(startX, tableY, 170, 7, 'F');
                            
                            xPos = startX + 2;
                            cells.forEach((cell, i) => {
                                // Highlight best values in green
                                const tdElement = row.querySelectorAll('td')[i];
                                if (tdElement && tdElement.classList.contains('best-value')) {
                                    doc.setTextColor(4, 120, 87);
                                    doc.setFont('helvetica', 'bold');
                                } else if (i === 0) {
                                    doc.setTextColor(0, 0, 0);
                                    doc.setFont('helvetica', 'bold');
                                } else {
                                    doc.setTextColor(0, 0, 0);
                                    doc.setFont('helvetica', 'normal');
                                }
                                
                                doc.text(cell, xPos, tableY + 5);
                                xPos += colWidths[i];
                            });
                            
                            tableY += 7;
                        });
                        
                        console.log('✅ Comparison table added to PDF');
                        
                    } catch (tableError) {
                        console.warn('⚠️ Table capture failed:', tableError);
                        doc.setFontSize(10);
                        doc.setTextColor(150, 150, 150);
                        doc.text('(Comparison table not available)', 30, yPos);
                    }
                }
                
                // ==========================================
                // FOOTER (ALL PAGES)
                // ==========================================
                
                const totalPages = doc.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    doc.setFontSize(9);
                    doc.setTextColor(150, 150, 150);
                    doc.text('Generated by SustainaBuild v1.0', 20, pageHeight - 20);
                    doc.text('Academic Research Tool - Valentine Lhoest', 20, pageHeight - 15);
                    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 15);
                }
                
                // ==========================================
                // SAVE PDF
                // ==========================================
                
                console.log('💾 Saving PDF...');
                const fileName = `SustainaBuild_Report_${dateStr.replace(/\//g, '-')}.pdf`;
                doc.save(fileName);
                
                console.log('✅ PDF saved successfully!');
                this.showToast('✅ PDF with all charts downloaded!', 'success');
                
            } catch (error) {
                console.error('❌ PDF generation error:', error);
                this.showToast('❌ Error: ' + error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        },

        showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: ${type === 'success' ? '#047857' : '#dc2626'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                z-index: 9999;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            `;
            
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PDFExport.init());
    } else {
        PDFExport.init();
    }

    window.PDFExport = PDFExport;

})();
