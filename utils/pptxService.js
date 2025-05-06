const pptxgen = require('pptxgenjs');
const { generateAIContent } = require('../services/geminiHelper');
const path = require('path');
const fs = require('fs');

const generatePresentation = async (prompt) => {
    const pptx = new pptxgen();
    const fileName = `presentation-${Date.now()}.pptx`;

    const downloadsDir = path.join('C:', 'Users', 'ajuar', 'Desktop', 'proyecto-educativo', 'frontend', 'public', 'downloads');
    const filePath = path.join(downloadsDir, fileName);

    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // 🧠 1. Pide el contenido a la IA en formato limpio
    const aiContent = await generateAIContent(
        `Crea una presentación de 3 diapositivas sobre: ${prompt}. Devuelve el resultado en el siguiente formato:\n\nTítulo: ...\nContenido: ...\n---\nTítulo: ...\nContenido: ...\n---\n...`
    );

    // 🧼 2. Divide en secciones por separadores '---'
    const slidesContent = aiContent.split('---').map(section => {
        const titleMatch = section.match(/Título:\s*(.+)/i);
        const contentMatch = section.match(/Contenido:\s*([\s\S]+)/i);

        return {
            title: titleMatch ? titleMatch[1].trim() : 'Sin título',
            content: contentMatch ? contentMatch[1].trim() : ''
        };
    });

    // 🎨 3. Agrega una diapositiva por sección
    slidesContent.forEach(({ title, content }) => {
        const slide = pptx.addSlide();

        slide.addText(title, {
            x: 0.5, y: 0.5,
            fontSize: 28,
            bold: true,
            color: '003366'
        });

        slide.addText(content, {
            x: 0.5, y: 1.5,
            fontSize: 18,
            color: '444444',
            lineSpacingMultiple: 1.2,
            w: '90%',
            h: '70%'
        });
    });

    // 🧾 4. Guardar archivo
    try {
        await pptx.writeFile({ fileName: filePath });
        console.log(`✅ Archivo guardado: ${fileName}`);
        return {
            downloadUrl: `/api/documents/download/${fileName}`,
            localPath: filePath
        };
    } catch (err) {
        console.error('❌ Error al guardar:', err);
        throw new Error('Error al crear el archivo PPTX');
    }
};

module.exports = { generatePresentation };
