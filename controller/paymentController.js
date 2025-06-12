import braintree from "braintree";
import ErrorHandler from "../utils/errorHandler.js";
import sendResponse from "../utils/sendResponse.js";
import Order from "../model/orderModel.js";
import crypto from "crypto";
import axios from "axios";
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANTID_PAYMENT,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY_PAYMENT,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY_PAYMENT
  });
  


export const getPaymentGatewayToken=async(req,res,next)=>{
    try {
        gateway.clientToken.generate({},function(err,result){
            if(err){
                return next(new ErrorHandler(err.message,500));
            }
            sendResponse({
                res,
                message:"Token Generated successfully",
                data:result
            })
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}


export const paymentForOrder=async(req,res,next)=>{
    try {
        const {paymentMode}=req.query;
        const {cart,nonce,quantity,totalPayment}=req.body;
        if(totalPayment==="$0.00"){
            return next(new ErrorHandler("You Cart is Emptry, add new item",400));
        }

        let total=0;

        cart.map((i)=>{
            total+=i.price;
        })
        if(paymentMode==="Paypal"){
        gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce[0],
            options: {
                submitForSettlement: true,
            }
        }, async (error, resp) => {
            if (error) {
                console.log(error);
                return next(new ErrorHandler(error.message, 500));
            }
            if (resp) {
                const order = await new Order({
                    product: cart,
                    payment: resp,
                    buyer: req.user._id,
                    status: "Processing",
                    totalPayment: totalPayment,
                    quantity: quantity,
                    paymentMode:paymentMode
                }).save();
                console.log("newTransaction",newTransaction,"end")
                console.log("order",order,"end")

                sendResponse({
                    res,
                    message: "Payment Successful",
                    data: order
                });
            }
        });
    }else if (paymentMode === 'COD') {
        // COD payment, no transaction processing
        const order = await new Order({
            product: cart,
            buyer: req.user._id,
            status: "Placed",
            totalPayment: totalPayment,
            quantity: quantity,
            paymentMode: paymentMode
        }).save();

        sendResponse({
            res,
            message: "Order placed successfully with COD",
            data: order
        });
    } else if(paymentMode==='CRYPTO'){
        const cryptoPay=await createInvoiceForCrypto(totalPayment);
        const order = await new Order({
            product: cart,
            buyer: req.user._id,
            status: "Placed",
            totalPayment: totalPayment,
            quantity: quantity,
            paymentMode: paymentMode,
            // orderId:cryptoPay.result.order_id
            orderId:order_id||Math.random(
                crypto.randomBytes(12).toString("base64")
            )
        }).save();

        sendResponse({
            res,
            message: "Order placed successfully with Crypto",
            data: order
        });
    }
    else {
        return next(new ErrorHandler("Invalid Payment mode. Only Paypal and COD are Accepted."))
    }    
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}

var order_id=crypto.randomBytes(12).toString("base64");
const cryptomus=axios.create({baseURL:'https://api.cryptomus.com/v1'});
export const createInvoiceForCrypto=async(amount)=>{
    try {
        const data={
            amount:amount,
            currency:"USD",
            // order_id:crypto.randomBytes(12).toString("base64"),
            order_id:order_id,
            url_return:'https://e-commerce-app-reactjs-ui.vercel.app/',
            url_success:'https://e-commerce-app-reactjs-ui.vercel.app/dashboard/user/orders',
            lifetime:300
        };
        const sign=crypto.createHash('md5').update(Buffer.from(JSON.stringify(data)).toString("base64")
        +process.env.PAYMENT_CRYPTO_API_KEY).digest("hex");
        const headers={
            merchant:process.env.MERCHANT_CRYPTO_ID,
            sign
        };
        const resp=await cryptomus.post('/payment',data,{
            headers
        })
        return resp.data;

    } catch (error) {
        console.log(error);
        return error;
    }
}