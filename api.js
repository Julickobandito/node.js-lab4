// import {filterByType, findEntityById, instantinateClass} from "./utils.js";
//
// const getEntityById = function(entities, req, res) {
//     const { id } = req.params;
//     let [entity, index] = findEntityById(entities, id);
//     let obj = instantinateClass(entity); // {type: entity.type}
//     let attributes = obj.getAttributes();
//     res.json({entity, attributes,  noteIndex: id});
// }
//
// const getEntityList = function(req, res) {
//     const type = req.query.type;
//     res.json(res.paginatedResults)
// }
//
// function paginatedResults(model) {
//     // middleware function
//     return (req, res, next) => {
//         model = filterByType(entities, req.query.type)
//         const page = parseInt(req.query.page);
//         const limit = parseInt(req.query.limit);
//         // calculating the starting and ending index
//         const startIndex = (page - 1) * limit;
//         const endIndex = page * limit;
//         const results = {};
//         if (endIndex < model.length) {
//             results.next = {
//                 page: page + 1,
//                 limit: limit
//             };
//         }
//         if (startIndex > 0) {
//             results.previous = {
//                 page: page - 1,
//                 limit: limit
//             };
//         }
//         results.results = model.slice(startIndex, endIndex);
//         res.paginatedResults = results;
//         next();
//     };
// }
//
// export { getEntityList, getEntityById };
