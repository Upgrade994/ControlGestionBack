const ExcelJS = require('exceljs');

const generateExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hoja1');

    worksheet.mergeCells('A1:N1');
    worksheet.mergeCells('O1:Y1');
    worksheet.getCell('A1').value = 'Entradas';
    worksheet.getCell('P1').value = 'Seguimientos';

    worksheet.columns = [
        { key: 'Año', width: 5 },
        { key: 'Folio', width: 8 },
        { key: 'Num Oficio', width: 13 },
        { key: 'Fecha Oficio', width: 10 },
        { key: 'Fecha de Vencimiento', width: 10 },
        { key: 'Fecha de Recepcion', width: 10 },
        { key: 'Hora de Recepcion', width: 8 },
        { key: 'Instrumento Jurídico', width: 13 },
        { key: 'Remitente', width: 13 },
        { key: 'Institucion de Origen', width: 15 },
        { key: 'Asunto', width: 20 },
        { key: 'Asignado', width: 15 },
        { key: 'Estatus', width: 8 },
        { key: 'Observaciones', width: 15 },
        { key: 'Oficio Salida', width: 13 },
        { key: 'Fecha Respuesta', width:10 },
        { key: 'Num. Expediente', width: 8 },
        { key: 'Fecha Oficio Salida', width: 10 },
        { key: 'Fecha Acuse Recibido', width: 10 },
        { key: 'Destinatario', width: 15 },
        { key: 'Cargo', width: 13 },
        { key: 'Atencion Otorgada', width: 15 },
        { key: 'Anexo', width: 10 },
        { key: 'Firma Visado', width: 10 },
        { key: 'Comentarios', width: 20 }
    ];

    worksheet.columns.forEach((columna, index) => {
        if (index == 5 && index == 6 && index == 7 && index == 8) {
            columna.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
        columna.font = { size: 8 };
        columna.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    });

    worksheet.addRow([
        'Año', 'Folio', 'Num Oficio', 'Fecha Oficio', 'Fecha de Vencimiento', 'Fecha de Recepcion', 'Hora de Recepcion', 'Instrumento Jurídico', 'Remitente', 'Institucion de Origen', 'Asunto', 'Asignado', 'Estatus', 'Observaciones',
        'Oficio Salida', 'Fecha Respuesta', 'Num. Expediente', 'Fecha Oficio Salida', 'Fecha Acuse Recibido', 'Destinatario', 'Cargo', 'Atencion Otorgada', 'Anexo', 'Firma Visado', 'Comentarios',
    ]);

    data.forEach(input => {
        const row = [];
        row.push(
        input.anio,
        input.folio,
        input.num_oficio,
        input.fecha_oficio,
        input.fecha_vencimiento,
        input.fecha_recepcion,
        input.hora_recepcion,
        input.instrumento_juridico,
        input.remitente,
        input.institucion_origen,
        input.asunto,
        input.asignado,
        input.estatus,
        input.observacion,
        );

        if (input.seguimientos) {
            row.push(
                input.seguimientos.oficio_salida,
                input.seguimientos.fecha_respuesta,
                input.seguimientos.num_expediente,
                input.seguimientos.fecha_oficio_salida,
                input.seguimientos.fecha_acuse_recibido,
                input.seguimientos.destinatario,
                input.seguimientos.cargo,
                input.seguimientos.atencion_otorgada,
                input.seguimientos.anexo,
                input.seguimientos.firma_visado,
                input.seguimientos.comentarios
            );
        } else {
            row.push(null, null, '');
        }

        worksheet.addRow(row);
    });

    return workbook;
};

module.exports = { generateExcel };