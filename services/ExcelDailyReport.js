const Excel = require('exceljs');

const exportData = (data) => {
    //console.log(data)
    let wb = new Excel.Workbook();
    let ws = wb.addWorksheet("Hoja1");

    let filaInicial = 5

    ws.getRow(filaInicial).values = [
        'NÚMERO DE CONTROL',
        'NÚMERO DE OFICIO',
        'FECHA DEL OFICIO',
        'FECHA DE RECEPCION',
        'HORA DE RECEPCION',
        'REMITIDO POR',
        'ORIGEN',
        'ASUNTO',
        'ASIGNADO',
        'SEGUIMIENTO',
        'VENCIMIENTO',
        'OBSERVACIÓN'
    ];

    ws.columns = [
        { key: 'folio', width: 7 },
        { key: 'num_oficio', width: 12 },
        { key: 'fecha_oficio', width: 10 },
        { key: 'fecha_recepcion', width: 10 },
        { key: 'hora_recepcion', width: 10 },
        { key: 'remitente', width: 12 },
        { key: 'institucion_origen', width: 13 },
        { key: 'asunto', width: 55 },
        { key: 'asignado', width: 14 },
        { key: 'estatus', width: 11 },
        { key: 'fecha_vencimiento', width: 11 },
        { key: 'observacion', width: 12 },
    ]
    
    ws.mergeCells('A1:L3');
    ws.getCell('A1').value =    'PODER EJECUTIVO DEL ESTADO DE CAMPECHE\n'+
                                'CONSEJERÍA JURÍDICA\n' +
                                'CONTROL DE RECEPCIÓN DE DOCUMENTOS DEL';

    ws.columns.forEach((columna, index) => {
        if (index == 5 && index == 6 && index == 7 && index == 8) {
            columna.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
        columna.font = { size: 8 };
        columna.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    })

    ws.getRow(filaInicial).font = { size: 8, bold: true };
    ws.getRow(filaInicial).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    data.forEach(function (item, index) {
        ws.addRow({
            folio: item.folio,
            asunto: item.asunto,
            num_oficio: item.num_oficio,
            fecha_oficio: item.fecha_oficio,
            fecha_recepcion: item.fecha_recepcion.split("T")[0],
            hora_recepcion: item.fecha_recepcion.split("T")[1],
            remitente: item.remitente,
            institucion_origen: item.institucion_origen,
            asunto: item.asunto,
            asignado: item.asignado,
            estatus: item.estatus,
            fecha_vencimiento: item.fecha_vencimiento,
            observacion: item.observacion
        })
    })

    for (var i = filaInicial; i < ws.actualRowCount + filaInicial; i++) {
        for (var j = 1; j < ws.actualColumnCount + 1; j++) {

            ws.getCell(i, j).border = {
                top: { style: "medium" },
                left: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" }
            };
        }
    }
    // let columns = data.reduce((acc, obj) => acc = Object.getOwnPropertyNames(obj), [])    

    // worksheet.columns = columns.map((el) => {
    //   return { header: el, key: el, width: 20 };
    // });  

    // worksheet.addRows(data);  
    return wb;
};

module.exports = exportData