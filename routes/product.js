import express from "express";
import Auth, { Admin } from "../middleware/authMiddleware.js";
import { categoryBasedProduct, createProduct, deleteProductById, getAllProducts, getProduct, getSingleProductDetails, productFilters, searchAllProducts, toggleWishlist, updateProduct, updateProductColors } from "../controller/productController.js";
import { upload } from "../utils/uploadFile.js";
// import searchQueryOnSingleField from "../middleware/utility.js"

const router=express.Router();

router.post('/add-product', upload?.array('imageList'),createProduct);
router.put('/update-product', upload?.array('imageList'), updateProduct);
router.get('/get-product',getProduct);
router.get('/all-products',getAllProducts);
router.delete('/delete-product',deleteProductById);

router.post('/product-filters',productFilters);


router.get('/toggle-product-wishlist',toggleWishlist);

router.get('/search-product',searchAllProducts);

router.get('/get-details',getSingleProductDetails);

router.post('/category-based',categoryBasedProduct);

// router.get('/get-color',updateProductColors);

export default router;