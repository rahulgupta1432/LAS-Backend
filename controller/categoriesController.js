import ErrorHandler from "../utils/errorHandler.js";
import sendResponse from "../utils/sendResponse.js";
import Categories from "../model/categoriesModel.js";
import slugify from "slugify";
export const CreateCategories=async(req,res,next)=>{
    try {
        const {name,parent_category_id}=req.body;
        if(!name){
            return next(new ErrorHandler("Name is Required",400))
        }
        const checkExistCategory=await Categories.findOne({
            name
        });
        if(checkExistCategory){
            return next(new ErrorHandler("Category Already Exist",400))
        }
        const categories=await Categories.create({
            name,
            slug:slugify(name),
            image:req.file?.path,
            parent_category_id
        });
        if(!categories){
            return next(new ErrorHandler("Categories Not Created",400))
        }
        sendResponse({
            res,
            message:"New Categories Added successfully",
            data:categories
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500))
    }
}

export const updateCategories=async(req,res,next)=>{
    try {
        const {categoryId}=req.query;
        const {name,parent_category_id}=req.body;
        
        if(!categoryId){
            return next(new ErrorHandler("Category Id is Required",400))
        }
        const checkExistCategory=await Categories.findById(categoryId);
        if(!checkExistCategory){
            return next(new ErrorHandler("Category Not Found",404))
        }
        const categories=await Categories.findByIdAndUpdate(categoryId,{
            name,
            slug:slugify(JSON.stringify(name)),
            image:req.file?.path,
            parent_category_id
        },{new:true});
        if(!categories){
            return next(new ErrorHandler("Categories Not Updated",400))
        }
        sendResponse({
            res,
            message:"Categories Updated successfully",
            data:categories
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}


export const getCategories=async(req,res,next)=>{
    try {
        const {categoryId}=req.query;
        const categories=await Categories.findById(categoryId);
        if(!categories){
            return next(new ErrorHandler("Categories Not Found",404));
        }
        sendResponse({
            res,
            message:"Categories Fetched successfully",
            data:categories
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}

// export const getAllCategories = async (req, res, next) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
//     let pipeline = [];

//     try {
//         // Construct search pipeline if applicable
//         if (req.searchPipeline.length > 0) {
//             pipeline.push({ $match: { $or: req.searchPipeline,isDeleted:false } });
//         }
        

//         // console.log("Final Pipeline before count:", JSON.stringify(pipeline, null, 2));

//         // Count total categories for pagination
//         const totalCategories = await Categories.countDocuments(
//             pipeline.length > 0 ? { $or: req.searchPipeline } : { isDeleted: false }
//         );

//         // Perform aggregation with the constructed pipeline
//         let getCategories = await Categories.aggregate([
//             ...pipeline,
//             { $sort: { createdAt: -1 } },
//             { $skip: skip },
//             { $limit: limit }
//         ]).exec();

//         // console.log("Categories Retrieved:", JSON.stringify(getCategories, null, 2)); // Log here

//         if (!getCategories || getCategories.length === 0) {
//             return sendResponse({
//                 res,
//                 message: "No Categories Found",
//                 data: []
//             });
//         }

//         // Construct pagination object
//         const pagination = {
//             limit: limit,
//             page: page,
//             pages: Math.ceil(totalCategories / limit),
//             nextPage: page < Math.ceil(totalCategories / limit) ? page + 1 : null,
//             prevPage: page > 1 ? page - 1 : null,
//             hasPrevPage: page > 1,
//             hasNextPage: page < Math.ceil(totalCategories / limit)
//         };

//         // Append pagination data
//         getCategories.push(pagination);
        
//         // Send the response
//         sendResponse({
//             res,
//             message: "All Categories are Fetched successfully",
//             data: getCategories
//         });

//     } catch (error) {
//         console.error("Error in getAllCategories:", error);
//         return next(new ErrorHandler(error.message, 500));
//     }
// };



export const getAllCategories = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    let pipeline = [];

    try {
        // Ensure searchPipeline is initialized properly
        req.searchPipeline = req.searchPipeline || [];

        // Construct search pipeline if applicable, ensuring isDeleted: false is included
        if (req.searchPipeline.length > 0) {
            pipeline.push({
                $match: {
                    $or: req.searchPipeline,
                    isDeleted: false
                }
            });
        } else {
            // If no search, just filter out deleted categories
            pipeline.push({ $match: { isDeleted: false } });
        }

        // Count total categories for pagination, only counting non-deleted categories
        const totalCategories = await Categories.countDocuments({ isDeleted: false });

        // Perform aggregation with the constructed pipeline
        let getCategories = await Categories.aggregate([
            ...pipeline,
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
        
        if (!getCategories || getCategories.length === 0) {
            return sendResponse({
                res,
                message: "No Categories Found",
                data: []
            });
        }

        // Construct pagination object
        const pagination = {
            limit: limit,
            page: page,
            pages: Math.ceil(totalCategories / limit),
            nextPage: page < Math.ceil(totalCategories / limit) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil(totalCategories / limit)
        };

        getCategories.push(pagination);
        
        sendResponse({
            res,
            message: "All Categories are Fetched successfully",
            data: getCategories
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};


export const deleteCategoriesById=async(req,res,next)=>{
    try{
        const {categoryId}=req.query;
        const categories=await Categories.findByIdAndUpdate(categoryId,{
            isDeleted:true
        })
        if(!categories){
            return next(new ErrorHandler("Categories Not Found",400));
        }
        sendResponse({
            res,
            message:"Categories Deleted successfully",
            data:[{CategoryDeleted:categories.isDeleted}]
        })
    }catch(error){
    return next(new ErrorHandler(error.message,500));
    }
}


