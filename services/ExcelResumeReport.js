const Excel = require('exceljs');

const exportData = (data) => {

    const wb = new Excel.Workbook();
const ws = wb.addWorksheet('Hoja1',{properties: {showGridLines: true}});
let filaInicial = 5

ws.mergeCells('A1:B3');

ws.getCell('A1').value = {
    richText: [
      {'font': {'size': 10},'text': 'TARJETA DE RESUMEN\n'+'RECEPCIÓN DE DOCUMENTOS\n'},
    ]
}

ws.columns = 
[  
    { width: 80 },  { width: 10 }
];

  ws.columns.forEach((columna, index) => {
    columna.font = { size: 8 };
    columna.alignment = { vertical: 'middle', horizontal: 'justify', wrapText: true }
    if (index == 1) {
        columna.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
})

let sumaDeFilas = []; 
let LugarDeDirecciones = []

ws.addRow(['']);

data.forEach((origen, indexs) =>{
    
    ws.addRow([ origen._id, origen.cantidad])
    sumaDeFilas.push(indexs)

    origen.asunto.forEach( (asuntos,index) => {
        ws.addRow([ asuntos, 1]);
        sumaDeFilas.push(index)
    })
    
    LugarDeDirecciones.push(sumaDeFilas.length)
    
})

//console.log(LugarDeDirecciones)

//Eliminacion de ultimo lugar del arreglo
LugarDeDirecciones.pop()
//Agregacion del lugar 0 al principio del arreglo
LugarDeDirecciones.unshift(0)

//Calculo correcto de las posiciones de los titulos
LugarDeDireccionesCorrectas = LugarDeDirecciones.map( x => {
    return x + filaInicial;
})


LugarDeDireccionesCorrectas.forEach(x => {
    let row = ws.getRow(x)

    row.font = { bold: true };

    row.eachCell(function(cell) {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
                argb: 'BFBFBF'
            }
        };
    });
})

for (var i = filaInicial; i < ws.actualRowCount + 1; i++) {
    for (var j = 1; j < ws.actualColumnCount + 1; j++) {
        
        ws.getCell(i, j).border = {
            top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
        };
    }
}


    return wb;
};

module.exports = exportData;