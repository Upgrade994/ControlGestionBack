const Excel = require('exceljs');
var fs = require('fs'); 

const exportData = (data) => {
    // console.log(data);
    let wb = new Excel.Workbook();
    let ws = wb.addWorksheet("Hoja1");

    let filaInicial = 5

    var logoCampeche = wb.addImage({
        buffer: fs.readFileSync('img/ESCUDO_GRIS.png'),
        extension: 'png',
      });

      var logoCJ = wb.addImage({
        buffer: fs.readFileSync('img/CJHORIZONTAL.png'),
        extension: 'png',
      });

      ws.addImage(logoCampeche, {
        tl: { col: 4, row: 0 }, ext: {width: 57, height: 70} //Vertical   inicio-fin
      });

      ws.addImage(logoCJ, {
        tl: { col: 8, row: 0.5 }, ext: {width: 140, height: 45} //Vertical   inicio-fin
      });
      
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
        'SEGUIMIENTO (Revisión)',
        'TIEMPO ESTIMADO DE ENTREGA',
        'OBSERVACIONES'
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

    //Optimizacion de codigo y la fecha tornaba un dia anterior, asi que sume uno
    var fechaRecepcion = new Date(data[0].fecha_recepcion);
    if (data[0].fecha_recepcion.includes("T")) {
        // Dividir la cadena si contiene una "T" y tomar solo la parte de la fecha
        fechaRecepcion = new Date(data[0].fecha_recepcion.split("T")[0]);
    }
    fechaRecepcion.setDate(fechaRecepcion.getDate() + 1);
    
    ws.mergeCells('A1:L3');
    ws.getCell('A1').value =    'PODER EJECUTIVO DEL ESTADO DE CAMPECHE\n'+
                                'CONSEJERÍA JURÍDICA\n' +
                                'CONTROL DE RECEPCIÓN DE DOCUMENTOS DEL ' + fechaRecepcion.toLocaleDateString('es-MX') + '\n' +
                                'FORMATO PARA TURNAR DOCUMENTOS';

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
            hora_recepcion: item.hora_recepcion,
            remitente: item.remitente,
            institucion_origen: item.institucion_origen,
            asunto: item.asunto,
            asignado: item.asignado,
            estatus: item.estatus,
            fecha_vencimiento: item.fecha_vencimiento,
            observacion: item.observacion
        })
    })

    for (var i = filaInicial; i < ws.actualRowCount + 2; i++) {
        for (var j = 1; j < ws.actualColumnCount + 1; j++) {

            ws.getCell(i, j).border = {
                top: { style: "medium" },
                left: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" }
            };
        }
    }

    //console.log(ws.lastRow.actualCellCount)
    //Agregar guiones bajos para que el usuario tenga su lugar para firmar, y el no, si, etc
    //aparece en un recuadro pequeño
    var rows = [
        [],
        ['RECIBE:','','','','','HORA: '], // row by array
        [],
        ['NOMBRE:','','','','','ANEXOS: ', 'NO____ SI_____ DOCUMENTOS_____ RESPALDO MAGNÉTICO_____'],
        [],
        ['FECHA:','','','','','FIRMA: '],

    ];

    ws.addRows(rows);
    // Union por inicio de fila, inicio de columna, fila final y columna final

    // fila inicial, columna inicial, fila final, columna final, ajustandose a la cantidad de filas
    ws.mergeCells(ws.actualRowCount+2,ws.actualColumnCount-5,ws.actualRowCount+2,ws.actualColumnCount-4);
    //console.log(ws.actualRowCount+2,ws.actualColumnCount-5,ws.actualRowCount+2,ws.actualColumnCount-4)

    // let columns = data.reduce((acc, obj) => acc = Object.getOwnPropertyNames(obj), [])    

    // worksheet.columns = columns.map((el) => {
    //   return { header: el, key: el, width: 20 };
    // });  

    // worksheet.addRows(data);  
    return wb;
};

module.exports = exportData