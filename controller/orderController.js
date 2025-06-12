import Order from "../model/orderModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendResponse from "../utils/sendResponse.js";

export const getMyOrders = async (req, res, next) => {
  try {
    const { userId } = req.query;

    const orders = await Order.find({ buyer: userId })
      .populate("product");

    if (!orders || orders.length === 0) {
      return next(new ErrorHandler("No orders found for this user", 404));
    }

    sendResponse({
      res,
      message: "Orders fetched successfully",
      data: orders
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};
