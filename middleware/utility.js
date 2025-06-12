// export default function searchQueryOnSingleField(fields){
//     return (req,res,next)=>{
//         const query=req.query.search;

//         if(query){
//             const matchStages=fields.map(fields=>({
//                 [fields]:{$regex:new RegExp(query,'i')}
//             }));
//             req.searchPipeline=matchStages;
//         }else{
//             req.searchPipeline=[];
//         }
//         next();

//     }
// }
export default function searchQueryOnSingleField(fields) {
    return (req, res, next) => {
        const query = req.query.search;
        console.log("Search query received:", query); // Log the received search query

        if (query) {
            const matchStages = fields.map(field => ({
                [field]: { $regex: new RegExp(query, 'i') }
            }));
            req.searchPipeline = matchStages;
        } else {
            req.searchPipeline = [];
        }
        
        console.log("Search Pipeline set:", JSON.stringify(req.searchPipeline, null, 2)); // Log here
        next();
    }
}
