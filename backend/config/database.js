const db = require('../server');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuração do transportador
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'luz.cruickshank87@ethereal.email',
        pass: process.env.SMTP_PASS || 'KaukHzWFmJF8F1FDjU'
    }
});

/**
 * Gera PDF formatado com a lista de itens em falta.
 */
function gerarPDF(itens) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const caminho = path.join(os.tmpdir(), `itens-falta-${Date.now()}.pdf`);
        const stream = fs.createWriteStream(caminho);
        doc.pipe(stream);

        doc.fontSize(18).fillColor('#1e40af').text('MARKCAMP - Itens em Falta', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#4b5563').text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
        doc.moveDown(1);

        const colunas = [
            { header: 'Obra', width: 140 },
            { header: 'Material', width: 120 },
            { header: 'Unid.', width: 50 },
            { header: 'Atual', width: 60, align: 'right' },
            { header: 'Mínimo', width: 60, align: 'right' },
            { header: 'Faltam', width: 60, align: 'right' }
        ];

        const topoTabela = doc.y;
        let x = doc.x;
        const inicioX = x;

        doc.fontSize(10).fillColor('#ffffff');
        colunas.forEach(col => {
            doc.rect(x, topoTabela, col.width, 18).fill('#1e40af');
            doc.fillColor('#ffffff').text(col.header, x + 2, topoTabela + 3, { width: col.width - 4, align: col.align || 'left' });
            x += col.width;
        });

        let y = topoTabela + 18;
        doc.fillColor('#000000').fontSize(9);
        itens.forEach((item, i) => {
            if (i % 2 === 0) doc.rect(inicioX, y, colunas.reduce((s, c) => s + c.width, 0), 18).fill('#f3f4f6');
            const faltam = item.estoque_minimo - item.quantidade;
            const linha = [item.obra_nome, item.material, item.unidade_medida, item.quantidade.toString(), item.estoque_minimo.toString(), faltam.toString()];
            x = inicioX;
            doc.fillColor('#111827');
            colunas.forEach((col, idx) => { doc.text(linha[idx], x + 2, y + 3, { width: col.width - 4, align: col.align || 'left' }); x += col.width; });
            y += 18;
        });

        doc.end();
        stream.on('finish', () => resolve(caminho));
        stream.on('error', reject);
    });
}

/**
 * Verifica estoque, agrupa por gestor e envia e‑mails com PDF anexo.
 */
async function verificarEnviarAlertas() {
    try {
        const query = `
            SELECT m.material, m.unidade_medida, m.quantidade, m.estoque_minimo,
                   o.nome AS obra_nome, o.gestor, c.email AS gestor_email
            FROM materiais_obra m
            JOIN obras o ON m.obra_id = o.id
            JOIN colaboradores c ON o.gestor = c.nome AND c.role = 'gestor'
            WHERE m.estoque_minimo > 0
              AND m.quantidade < m.estoque_minimo
              AND o.status != 'Concluída'
            ORDER BY c.email, o.nome, m.material
        `;

        db.query(query, async (err, rows) => {
            if (err) {
                console.error('Erro SQL:', err);
                return;
            }

            if (rows.length === 0) {
                console.log('Nenhum item em falta.');
                return;
            }

            const agrupado = {};
            rows.forEach(item => {
                if (!agrupado[item.gestor_email]) agrupado[item.gestor_email] = [];
                agrupado[item.gestor_email].push(item);
            });

            for (const [email, itens] of Object.entries(agrupado)) {
                try {
                    const pdfPath = await gerarPDF(itens);
                    const nomeGestor = itens[0].gestor;

                    let listaItens = '';
                    let obraAtual = '';
                    itens.forEach(item => {
                        if (item.obra_nome !== obraAtual) {
                            obraAtual = item.obra_nome;
                            listaItens += `\n📌 Obra: ${obraAtual}\n`;
                        }
                        const faltam = item.estoque_minimo - item.quantidade;
                        listaItens += `  • ${item.material} (${item.unidade_medida}): ${item.quantidade} em estoque | Mínimo: ${item.estoque_minimo} | Comprar: ${faltam}\n`;
                    });

                    const corpo = `Olá ${nomeGestor},\n\n` +
                        `Os seguintes materiais estão abaixo do estoque mínimo nas obras sob sua responsabilidade:\n` +
                        listaItens +
                        `\nAcesse o Markcamp para mais detalhes.`;

                    await transporter.sendMail({
                        from: '"Markcamp - Alerta de Estoque" <estoque@markcamp.com>',
                        to: email,
                        subject: '⚠️ Alerta de Estoque Baixo - Itens em Falta',
                        text: corpo,
                        attachments: [{
                            filename: `itens-falta-${new Date().toISOString().slice(0, 10)}.pdf`,
                            path: pdfPath
                        }]
                    });

                    console.log(`Alerta enviado para ${email} (Gestor: ${nomeGestor})`);
                    fs.unlink(pdfPath, () => {});
                } catch (err) {
                    console.error(`Erro ao enviar para ${email}:`, err.message);
                }
            }
        });
    } catch (error) {
        console.error('Erro geral:', error);
    }
}

function iniciarVerificacaoEstoque(intervaloMs = 30 * 60 * 1000) {
    console.log(`Verificação de estoque iniciada (${intervaloMs / 60000} min).`);
    verificarEnviarAlertas();
    setInterval(verificarEnviarAlertas, intervaloMs);
}

module.exports = { iniciarVerificacaoEstoque };