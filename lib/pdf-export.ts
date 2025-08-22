import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportData {
  name: string;
  date: string;
  oceanScores: Record<string, number>;
  cultureScores: Record<string, number>;
  valuesScores: Record<string, number>;
  insights: {
    ocean: string[];
    culture: string[];
    values: string[];
  };
  recommendations: {
    ocean: Array<{
      title: string;
      description: string;
      priority: string;
      actionable: string;
    }>;
    culture: Array<{
      title: string;
      description: string;
      priority: string;
      actionable: string;
    }>;
    values: Array<{
      title: string;
      description: string;
      priority: string;
      actionable: string;
    }>;
  };
}

export async function generateAssessmentPDF(data: PDFExportData): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;

  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(59, 130, 246); // Blue
  pdf.text('Culture Mapping Assessment Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Subtitle
  pdf.setFontSize(14);
  pdf.setTextColor(107, 114, 128); // Gray
  pdf.text(`Generated for ${data.name} on ${data.date}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 25;

  // Executive Summary
  pdf.setFontSize(16);
  pdf.setTextColor(17, 24, 39); // Dark gray
  pdf.text('Executive Summary', margin, yPosition);
  
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(55, 65, 81);
  
  const oceanAvg = Object.values(data.oceanScores).reduce((a, b) => a + b, 0) / 5;
  const cultureAvg = Object.values(data.cultureScores).reduce((a, b) => a + b, 0) / 6;
  const valuesAvg = Object.values(data.valuesScores).reduce((a, b) => a + b, 0) / 5;
  
  const summaryText = [
    `This comprehensive assessment reveals your personality profile across three key dimensions:`,
    `• Personality Traits (OCEAN): Average score of ${Math.round(oceanAvg)}/100`,
    `• Cultural Preferences: Average score of ${Math.round(cultureAvg)}/100`,
    `• Work Values: Average score of ${Math.round(valuesAvg)}/100`,
    '',
    'Your results provide insights into your work style, communication preferences, and professional motivations.'
  ];
  
  summaryText.forEach(line => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;

  // OCEAN Scores Section
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = margin;
  }
  
  pdf.setFontSize(14);
  pdf.setTextColor(17, 24, 39);
  pdf.text('Personality Traits (OCEAN)', margin, yPosition);
  
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(55, 65, 81);
  
  Object.entries(data.oceanScores).forEach(([trait, score]) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
    }
    
    const label = trait.charAt(0).toUpperCase() + trait.slice(1);
    const level = score >= 70 ? 'High' : score >= 40 ? 'Moderate' : 'Low';
    pdf.text(`${label}: ${level} (${score}/100)`, margin, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // OCEAN Insights
  if (data.insights.ocean.length > 0) {
    pdf.setFontSize(12);
    pdf.setTextColor(17, 24, 39);
    pdf.text('Key Insights:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    
    data.insights.ocean.forEach(insight => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`• ${insight}`, margin + 5, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
  }

  // Cultural Preferences Section
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = margin;
  }
  
  pdf.setFontSize(14);
  pdf.setTextColor(17, 24, 39);
  pdf.text('Cultural Preferences', margin, yPosition);
  
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(55, 65, 81);
  
  Object.entries(data.cultureScores).forEach(([preference, score]) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
    }
    
    const label = preference.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const level = score >= 70 ? 'High' : score >= 40 ? 'Moderate' : 'Low';
    pdf.text(`${label}: ${level} (${score}/100)`, margin, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Cultural Insights
  if (data.insights.culture.length > 0) {
    pdf.setFontSize(12);
    pdf.setTextColor(17, 24, 39);
    pdf.text('Cultural Insights:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    
    data.insights.culture.forEach(insight => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`• ${insight}`, margin + 5, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
  }

  // Work Values Section
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = margin;
  }
  
  pdf.setFontSize(14);
  pdf.setTextColor(17, 24, 39);
  pdf.text('Work Values', margin, yPosition);
  
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(55, 65, 81);
  
  Object.entries(data.valuesScores).forEach(([value, score]) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
    }
    
    const label = value.charAt(0).toUpperCase() + value.slice(1);
    const level = score >= 70 ? 'High' : score >= 40 ? 'Moderate' : 'Low';
    pdf.text(`${label}: ${level} (${score}/100)`, margin, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Values Insights
  if (data.insights.values.length > 0) {
    pdf.setFontSize(12);
    pdf.setTextColor(17, 24, 39);
    pdf.text('Values Insights:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    
    data.insights.values.forEach(insight => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`• ${insight}`, margin + 5, yPosition);
      yPosition += 6;
    });
    
    yPosition += 15;
  }

  // Recommendations Section
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = margin;
  }
  
  pdf.setFontSize(16);
  pdf.setTextColor(17, 24, 39);
  pdf.text('Actionable Recommendations', margin, yPosition);
  
  yPosition += 15;
  
  // Combine all recommendations
  const allRecommendations = [
    ...data.recommendations.ocean.map(r => ({ ...r, category: 'Personality' })),
    ...data.recommendations.culture.map(r => ({ ...r, category: 'Cultural' })),
    ...data.recommendations.values.map(r => ({ ...r, category: 'Values' }))
  ];
  
  allRecommendations.forEach((rec, index) => {
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(12);
    pdf.setTextColor(59, 130, 246);
    pdf.text(`${index + 1}. ${rec.title}`, margin, yPosition);
    
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    pdf.text(rec.description, margin, yPosition);
    
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Action: ${rec.actionable}`, margin + 5, yPosition);
    
    yPosition += 12;
  });

  // Footer
  const lastPage = pdf.getNumberOfPages();
  pdf.setPage(lastPage);
  
  pdf.setFontSize(8);
  pdf.setTextColor(156, 163, 175);
  pdf.text('Generated by Culture Mapping - Science-backed personality and team assessment platform', pageWidth / 2, pageHeight - 10, { align: 'center' });
  pdf.text(`Page ${lastPage} of ${lastPage}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

  return pdf.output('blob');
}

export async function exportResultsAsPDF(elementId: string, filename: string = 'assessment-results.pdf'): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
