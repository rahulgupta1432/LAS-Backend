import express from "express";
import Auth, { Admin } from "../middleware/authMiddleware.js";
import { CreateCategories, deleteCategoriesById, getAllCategories, getCategories, updateCategories } from "../controller/categoriesController.js";
import searchQueryOnSingleField from "../middleware/utility.js"
import { upload } from "../utils/uploadFile.js";
const router=express.Router();


router.post("/add-category",upload.single('image'),CreateCategories);//Auth,Admin,

router.put("/update-category",upload.single('image'),updateCategories);

router.get("/get-category",getCategories);

// router.get("/all-category", searchQueryOnSingleField(['name', 'slug']), getAllCategories);

router.get("/all-category", getAllCategories);

router.delete("/delete-category",deleteCategoriesById);


router.get("/user-auth",Auth,(req,res)=>{
    res.send({
        ok:true
    });
})

router.get("/admin-auth",Auth,Admin,(req,res)=>{
    res.send({
        ok:true
    });
})



export default router;