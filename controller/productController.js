import slugify from "slugify";
import { addProductValidation } from "../helper/validation.js";
import Categories from "../model/categoriesModel.js";
import Product from "../model/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendResponse from "../utils/sendResponse.js";
import mongoose from "mongoose";
import wishListModel from "../model/wishListModel.js";
import User from "../model/userModel.js";



export const createProduct = async (req, res, next) => {
        try {
            const { name, price, description, category, quantity } = req.body;
            const validate = await addProductValidation(req.body);
            if (!validate || (validate && validate.error)) {
                return next(new ErrorHandler(validate.error, 400));
            }

            const checkCategory = await Categories.findById(category);
            if (!checkCategory) {
                return next(new ErrorHandler("Category Not Found", 400));
            }

            const checkExistProduct = await Product.findOne({ name });
            if (checkExistProduct) {
                return next(new ErrorHandler("Product Already Exists", 400));
            }

            const productImageUrl=await req.files?.map((data)=>{
                return data.path;
            })

            const product = await Product.create({
                name,
                slug:slugify(name),
                price,
                description,
                category,
                imageList: productImageUrl,
                quantity
            });

            if (!product) {
                return next(new ErrorHandler("Product Not Created", 400));
            }

            sendResponse({
                res,
                message: "Product Created Successfully",
                data: product
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
};



export const updateProduct=async(req,res,next)=>{
    try{
        const {productId}=req.query;
        let {name,price,description,category,quantity,indices = [0] }=req.body;
        

        const checkProduct=await Product.findById(productId);
        if(!checkProduct){
            return next(new ErrorHandler("Product Not Found",404));
        }
        
        const productImagePaths = req.files ? await Promise.all(req.files.map(async (file) => {
            return file.path;
        })) : [];

        if(typeof indices==='string'){
            indices=JSON.parse(indices);
        }
        

        const updatedImages = [...checkProduct.imageList]; // Get the current image list

    
        if (Array.isArray(indices)) {
            indices.forEach((index, i) => {

                if (index >= 0 && index < updatedImages.length && productImagePaths[i]) {
                    updatedImages[index] = productImagePaths[i]; // Replace the image
                } else {
                }
            });
        }

        
        let product=await Product.findByIdAndUpdate(productId,{
            name,
            slug:slugify(name),
            price,
            description,
            category,
            quantity,
            imageList:updatedImages
        },{new:true});
        if(!product){
            return next(new ErrorHandler("Product Not Updated",400));
        }
        product = { ...product.toObject(), ...req.body };

        sendResponse({
            res,
            message:"Product Updated Successfully",
            data:product
        })

    }catch(error){
    return next(new ErrorHandler(error.message,500));
    }
}



export const getProduct=async(req,res,next)=>{
    try {
        const {productId}=req.query;
        const product=await Product.findById(productId).populate({
            path:'category'
        })
        if(!product){
            return next(new ErrorHandler("ProductNot Found",404));
        }
        sendResponse({
            res,
            message:"Product Fetched successfully",
            data:product
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}

export const getAllProducts=async(req,res,next)=>{
    const page = parseInt(req.query.page) || 1;
    let limit;
    const skip=(page-1)*limit;
    const type=req.query.type;
    const {userId}=req.query;

    try{
        let getProducts=[]
        if (type === 'Admin') {
            limit = parseInt(req.query.limit) || 1000; // Default limit for Admin 10
        } else {
            limit = 5000; // Default limit for non-Admin or missing type 50
        }

        getProducts = await Product.find({ isDeleted: false })
            .populate({
                path: "category",
                select: "name"
            })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .exec();

        if(!getProducts||getProducts.length===0){
            sendResponse({
                res,
                message:"No Products Found",
                data:[]
            })
        }
        const totalProducts = await Product.countDocuments({ isDeleted: false });
        const pagination = {
            limit,
            page,
            pages: Math.ceil(totalProducts / limit),
            nextPage: page < Math.ceil(totalProducts / limit) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil(totalProducts / limit)
        };

        const data=await Promise.all(
            getProducts?.map(async(product)=>{
                const wishList=await wishListModel.findOne({user:userId});
                        const isWishListed = wishList && wishList.product.includes(product._id);
                        return {
                            ...product?.toObject(),
                            isWishListed:isWishListed?true:false
                        }
                    })
                )
                
                // getProducts.push(pagination);
                data.push(pagination)

        sendResponse({
            res,
            message:"All Products are Fetched successfully",
            data:data
        })
        
    }catch(error){
        return next(new ErrorHandler(error.message,500));
    }
}


export const deleteProductById=async(req,res,next)=>{
    try{
        const {productId}=req.query;
        const product=await Product.findByIdAndUpdate(productId,{
            isDeleted:true
        })
        if(!product){
            return next(new ErrorHandler("Product Not Found",400));
        }
        sendResponse({
            res,
            message:"Product Deleted successfully",
            data:[{ProductDeleted:product.isDeleted}]
        })
    }catch(error){
    return next(new ErrorHandler(error.message,500));
    }
}




export const productFilters=async(req,res,next)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        let limit=req.body.limit||50;
        const skip=(page-1)*limit;
        const {checked,radioMin,radioMax,search,userId}=req.body;
        
        let args = {};       
        if (checked && Array.isArray(checked) && checked.length > 0) {
            const categoryIds = checked.map(id => new mongoose.Types.ObjectId(id));
            args.category = { $in: categoryIds }; 
        }
        if (radioMin !== undefined && radioMax !== undefined) {
            args.price = { $gte: parseFloat(radioMin), $lte: parseFloat(radioMax) };
        }
        if(search){
            args.name = { $regex: search, $options: 'i' };
        }

        let filterProducts;
        filterProducts = await Product.find({
            isDeleted: false,
            ...args
        })
        .limit(typeof limit==="number"?limit:null)
        .skip(skip).sort({createdAt:-1})
        .populate({
            path: 'category',
            select: 'name'
        });

        const totalProducts=await Product.countDocuments({
            isDeleted:false,
            ...args
        });
        const pagination={
            limit,
            page,
            pages:Math.ceil(totalProducts/limit),
            nextPage:page<Math.ceil(totalProducts/limit)?page+1:null,
            prevPage:page>1?page-1:null,
            hasPrevPage:page>1,
            hasNextPage:page<Math.ceil(totalProducts/limit)
        }
        const data=await Promise.all(filterProducts?.map(async(product)=>{
            const checkWishlist=await wishListModel.findOne({user:userId});
            const isWishListed=checkWishlist&&checkWishlist.product.includes(product._id)?true:false
            return {
                ...product.toObject(),
                isWishListed:isWishListed?true:false
            }
        }))

        data.push(pagination);
        


        if(!filterProducts||filterProducts.length===0){
            sendResponse({
                res,
                message:"No Filter Data Found",
                data:[]
            })
        }

        sendResponse({
            res,
            message:"Filter Data Fetched successfully",
            data:data
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}




// wishlist
export const toggleWishlist=async(req,res,next)=>{
    try {
        const {productId,userId}=req.query;
        if(!productId||!userId){
            return next(new ErrorHandler("Please Provide Product Id and User Id",400));
        }
        const checkUser=await User.findById(userId);
        if(!checkUser){
            return next(new ErrorHandler("User Not Found",400));    
        }
        const product=await Product.findById(productId);
        if(!product){
            return next(new ErrorHandler("Product Not Found",400));
        }
        let message;
        const checkProductInWishlist=await wishListModel.findOne({user:userId});
        if(!checkProductInWishlist){
            const createWishlist=await wishListModel.create({
                user:userId,
                product:productId,
                isActive:true
            })
            message="Wishlist item added successfully"
        }else{
            const productIndex=checkProductInWishlist.product.indexOf(productId);
            if(productIndex===-1){
                checkProductInWishlist.product.push(productId);
                message = "Wishlist item added successfully.";
            }else{
                // checkProductInWishlist.product.splice(productIndex, 1);
                checkProductInWishlist.product.pull(productId);
                message = "Wishlist item removed successfully.";

            }
            await checkProductInWishlist.save();
        }
        sendResponse({
            res,
            message:message,
            data:checkProductInWishlist
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}


export const searchAllProducts=async(req,res,next)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit)||50;
        const skip=(page-1)*limit;
        const {search,userId}=req.query;
        let query = { isDeleted: false };
        const checkUser=await User.findById(userId);

        if(userId){
            if(!checkUser){
                return next(new ErrorHandler("User Not Found",400));
            }
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            query = {
                ...query,
                $or: [
                    { name: regex },
                    { description: regex },
                    { comment: regex }
                    // { name: new RegExp(searchKeyword, 'i') },
                    // { description: new RegExp(searchKeyword, 'i') },
                    // { comment: new RegExp(searchKeyword, 'i') }
            
                ]
            };
        }
        // if (userId) {
        //     query.userId = userId; // Ensure that this matches how the userId is stored in the Product model
        // }        
        let products = await Product.find(query)
        .limit(limit).skip(skip).sort({ createdAt: -1 }).populate({
            path: 'category',
            select: 'name'
        })
        .exec();

        const totalProducts=await Product.countDocuments(query);
        if(!products||products.length===0){
            sendResponse({
                res,
                message:"No Products Found",
                data:[]
            })
        }

        const pagination={
            limit,
            page,
            pages:Math.ceil(totalProducts/limit),
            nextPage:page<Math.ceil(totalProducts/limit)?page+1:null,
            prevPage:page>1?page-1:null,
            hasPrevPage:page>1,
            hasNextPage:page<Math.ceil(totalProducts/limit)
        }
        const data=await Promise.all(products?.map(async(product)=>{
            const checkWishlist=await wishListModel.findOne({user:userId});
            const isWishListed=checkWishlist&&checkWishlist.product.includes(product._id)?true:false
            return {
                ...product.toObject(),
                isWishListed:isWishListed?true:false
            }
        }))

        data.push(pagination);

        sendResponse({
            res,
            message:"All Products Fetched successfully",
            data:data
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}



export const getSingleProductDetails=async(req,res,next)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit)||50;
        const skip=(page-1)*limit;
        const {productId,userId}=req.query;
        if(!productId){
            return next(new ErrorHandler("Please Provide Product Id",400));
        }

        let products = await Product.findById(productId)
        .limit(limit).skip(skip).sort({ createdAt: -1 }).populate({
            path: 'category',
            select: 'name'
        })
        .exec();

        const totalProducts=await Product.countDocuments(productId);
        if(!products||products.length===0){
            sendResponse({
                res,
                message:"No Products Found",
                data:[]
            })
        }

        const similarProducts = await Product.find({
            category: products.category._id,
            _id: { $ne: products._id } // Exclude the current product
        })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .populate({
                path: 'category',
                select: 'name'
            });


        const pagination={
            limit,
            page,
            pages:Math.ceil(totalProducts/limit),
            nextPage:page<Math.ceil(totalProducts/limit)?page+1:null,
            prevPage:page>1?page-1:null,
            hasPrevPage:page>1,
            hasNextPage:page<Math.ceil(totalProducts/limit)
        }
        const isWishlisted=await wishListModel.findOne({
            user:userId,
            product:products._id
        });
        const data=[];
        data.push({
            ...products.toObject(),
            isWishListed:isWishlisted?true:false
        },
        {similarProducts},
        {
            ...pagination
        })
        sendResponse({
            res,
            message:"All Products Fetched successfully",
            data:data
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}



export const categoryBasedProduct = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit); 
    const skip = (page - 1) * (limit || 1000);
    try {
        const { categoryId } = req.query;
        const {checked,colors}=req.body;
        if (!categoryId) {
            return next(new ErrorHandler("Please Provide Category Id", 400));
        }
        let args={
            category:categoryId,
            isDeleted: false
        };
        if(checked&&Array.isArray(checked)&&checked.length>0){
            if (!checked.includes("All Price")) {
            const priceRange=checked[0].split(' - ');
        const minPrice=parseFloat(priceRange[0].replace('$','').trim());
        const maxPrice = parseFloat(priceRange[1].replace('$', '').trim());
            args.price={
                $gte:minPrice,
                $lte:maxPrice
            }
        }
    }
        if(colors&&Array.isArray(colors)&&colors.length>0){
            if (!colors.includes("all colors")) {
            args.colors={
                    $in:colors
                }
            }
        }
        
        const totalProducts = await Product.countDocuments(args);
        // Set limit to totalProducts if limit is not provided
        const productLimit = limit ? limit : totalProducts;

        // Fetch products with pagination
        const products = await Product.find({
            ...args
        })
            .limit(productLimit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .populate({
                path: 'category',
                select: 'name'
            });

        // Create pagination object
        const pagination = {
            limit: productLimit,
            page,
            pages: Math.ceil(totalProducts / (limit || totalProducts)), // Handle no limit case
            nextPage: page < Math.ceil(totalProducts / (limit || totalProducts)) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil(totalProducts / (limit || totalProducts))
        };

        // Check wishlist status for each product
        const data = await Promise.all(
            products.map(async (product) => {
                const checkWishlist = await wishListModel.findOne({ user: req.query.userId });
                const isWishListed = checkWishlist && checkWishlist.product.includes(product._id);
                return {
                    ...product.toObject(),
                    isWishListed
                };
            })
        );
        data.push(pagination);

        // Send response
        sendResponse({
            res,
            message: "All Products Fetched successfully",
            data: data
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};



const colorNames = ['red', 'blue', 'green', 'yellow', 'black', 'white']; // Array of color names

export const updateProductColors = async (req, res, next) => {
    try {
        // Fetch all products
        const products = await Product.find();

        // Loop through each product
        for (const product of products) {
            // Find matching colors
            const matchedColors = colorNames.filter(color => 
                product.name.toLowerCase().includes(color)
            );

            // Update the product if colors are found
            if (matchedColors.length > 0) {
                // Push matched colors into the colors array, avoiding duplicates
                matchedColors.forEach(color => {
                    if (!product.colors.includes(color)) {
                        product.colors.push(color); // Add the color to the colors array
                    }
                });

                await product.save();
                // console.log(`Updated product ${product._id} with colors: ${matchedColors}`);
            }
        }


        // Send response
        sendResponse({
            res,
            message: "Products updated with colors successfully",
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};


