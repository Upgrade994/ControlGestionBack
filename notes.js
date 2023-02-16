// db.inventory.find( {
//     $and: [
//         { $or: [ { qty: { $lt : 10 } }, { qty : { $gt: 50 } } ] },
//         { $or: [ { sale: true }, { price : { $lt : 5 } } ] }
//     ]
// } )

//{ asignado: { $regex: "oficina del consejero jur[ií]dico", $options: "i"}}

// Input.find({
//     $and: [
//         {
//             "$or":[
//                 { num_oficio: { $regex: "sg", $options:"i" }}
//             ]
//         },
//         {
//             "$or":[
//                 { asunto: { $regex: "dictamen", $options:"i" }}
//             ]
//         }
//     ]
// })

// { num_oficio: { $regex: "sg", $options:"i" }, asunto: { $regex: "dictamen", $options: "i"}}