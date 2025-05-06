const PDFDocument = require('pdfkit');
const fs = require('fs');
const { generateAIContent } = require('../services/geminiHelper');
const path = require('path');

const generatePDF = async (prompt) => {
  try {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      layout: 'portrait',
      info: {
        Title: `Documento Educativo: ${prompt}`,
        Author: 'Plataforma Educativa',
        Creator: 'PDFKit'
      }
    });

    const fileName = `content-${Date.now()}.pdf`;
    const downloadsDir = path.join('C:', 'Users', 'ajuar', 'Desktop', 'proyecto-educativo', 'frontend', 'public', 'downloads');
    const filePath = path.join(downloadsDir, fileName);

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
      console.log(`📂 Carpeta creada en: ${downloadsDir}`);
    }

    console.log(`🛠️ Ruta completa del archivo: ${filePath}`);

    // Generar contenido con IA
    const aiContent = await generateAIContent(`Genera un documento educativo bien estructurado sobre: ${prompt}. Incluye secciones con títulos, subtítulos y contenido organizado en párrafos.`);

    // Pipe del documento
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ----------------- PORTADA SIMPLIFICADA -----------------
    doc.fillColor('#4F46E5')
       .rect(0, 0, doc.page.width, doc.page.height)
       .fill();
    
    doc.fillColor('#ffffff')
       .fontSize(36)
       .text('Documento Educativo', {
         align: 'center',
         valign: 'center',
         lineGap: 10,
         width: doc.page.width - 100,
         height: doc.page.height - 200,
         x: 50,
         y: 150
       });
    
    doc.fontSize(24)
       .text(prompt, {
         align: 'center',
         lineGap: 5,
         width: doc.page.width - 100,
         x: 50,
         y: 250
       });
    
    doc.addPage();

    // ----------------- ESTILOS -----------------
    const styles = {
      h1: { size: 24, color: '#4F46E5', font: 'Helvetica-Bold' },
      h2: { size: 20, color: '#1E40AF', font: 'Helvetica-Bold' },
      h3: { size: 16, color: '#1E40AF', font: 'Helvetica-Bold' },
      paragraph: { size: 12, color: '#1F2937', font: 'Helvetica' },
      quote: { size: 12, color: '#6B7280', font: 'Helvetica-Oblique' },
      highlight: { size: 12, color: '#065F46', font: 'Helvetica-Bold' }
    };

    // ----------------- CABECERA -----------------
    doc.fillColor('#4F46E5')
       .rect(0, 0, doc.page.width, 40)
       .fill();
    
    doc.fillColor('#ffffff')
       .fontSize(14)
       .text('Plataforma Educativa', 50, 10);

    // ----------------- CONTENIDO -----------------
    let yPosition = 60;
    let pageNumber = 1;
    
    const addFooter = () => {
      const footerY = doc.page.height - 40;
      doc.fillColor('#4F46E5')
         .rect(0, footerY, doc.page.width, 40)
         .fill();
      
      doc.fillColor('#ffffff')
         .fontSize(10)
         .text(`Página ${pageNumber}`, 50, footerY + 10);
      
      doc.text(new Date().toLocaleDateString(), doc.page.width - 150, footerY + 10, {
        align: 'right'
      });
    };

    // Procesar el contenido en trozos más pequeños
    const processContent = (content) => {
      const sections = content.split('\n\n');
      
      sections.forEach(section => {
        if (section.trim() === '') return;
        
        // Verificar si necesitamos nueva página
        if (yPosition > doc.page.height - 100) {
          addFooter();
          doc.addPage();
          pageNumber++;
          yPosition = 60;
          
          // Añadir cabecera en nueva página
          doc.fillColor('#4F46E5')
             .rect(0, 0, doc.page.width, 40)
             .fill();
          
          doc.fillColor('#ffffff')
             .fontSize(14)
             .text('Plataforma Educativa', 50, 10);
        }

        // Procesar sección según su tipo
        if (section.startsWith('# ')) {
          doc.font(styles.h1.font)
             .fontSize(styles.h1.size)
             .fillColor(styles.h1.color)
             .text(section.replace('# ', ''), 50, yPosition, {
               underline: true,
               align: 'left'
             });
          yPosition += 40;
        } else if (section.startsWith('## ')) {
          doc.font(styles.h2.font)
             .fontSize(styles.h2.size)
             .fillColor(styles.h2.color)
             .text(section.replace('## ', ''), 50, yPosition, {
               align: 'left'
             });
          yPosition += 30;
        } else if (section.startsWith('### ')) {
          doc.font(styles.h3.font)
             .fontSize(styles.h3.size)
             .fillColor(styles.h3.color)
             .text(section.replace('### ', ''), 50, yPosition, {
               align: 'left'
             });
          yPosition += 25;
        } else {
          const isQuote = section.startsWith('> ');
          const isHighlight = section.startsWith('! ');
          
          doc.font(isQuote ? styles.quote.font : 
                  isHighlight ? styles.highlight.font : styles.paragraph.font)
             .fontSize(styles.paragraph.size)
             .fillColor(isQuote ? styles.quote.color : 
                       isHighlight ? styles.highlight.color : styles.paragraph.color)
             .text(isQuote ? section.replace('> ', '') : 
                  isHighlight ? section.replace('! ', '') : section, {
               align: 'justify',
               width: doc.page.width - 100,
               indent: 30,
               paragraphGap: 10,
               lineGap: 5,
               x: 50,
               y: yPosition
             });
          
          yPosition += doc.heightOfString(section, {
            width: doc.page.width - 100
          }) + 20;
        }
      });
    };

    // Procesar el contenido en partes más pequeñas si es muy grande
    const chunkSize = 1000; // Caracteres por chunk
    for (let i = 0; i < aiContent.length; i += chunkSize) {
      const chunk = aiContent.substring(i, i + chunkSize);
      processContent(chunk);
    }

    // Añadir pie de página final
    addFooter();

    // Finalizar documento
    doc.end();

    // Esperar a que se complete la escritura
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return { downloadUrl: `/api/documents/download/${fileName}` };

  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el documento PDF');
  }
};

module.exports = { generatePDF };