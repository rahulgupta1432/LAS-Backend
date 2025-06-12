import jwt from "jsonwebtoken";
import { encryptToken } from "./aes.js";

    // jwt.sign({userId,randomness:Math.random(),expiresOn:Date.now()+1*24*60*60*1000,createdOn:Date.now(),isAdmin,role},
    // process.env.JWT_SECRET,{expiresIn:'1d'});
    // (jwt.sign({userId,randomness:Math.random(),expiresOn:Date.now()+1*24*60*60*1000,createdOn:Date.now(),isAdmin,role}
    // ,process.env.JWT_SECRET,{expiresIn:'1d'}));
    
const generateToken = async (userId, isAdmin, role,tokenVersion) => {
        const payload = {
            userId,
            randomness: Math.random(),
            expiresOn: Date.now() + 1 * 24 * 60 * 60 * 1000,
            createdOn: Date.now(),
            isAdmin,
            role,
            tokenVersion: tokenVersion
        };
        const secret = process.env.JWT_SECRET;
        const options = { expiresIn: '1d' };
    
        // Generate JWT
        const token = jwt.sign(payload, secret, options);
        // console.log("token",token);
        
        return encryptToken(token);
};


export default generateToken;