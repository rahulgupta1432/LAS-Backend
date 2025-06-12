import fetch from "node-fetch";
import ErrorHandler from "../utils/errorHandler.js";

export const sendMessageFast2Sms = async ({ mobile, otp, signature = "english", next }) => {
    try {
        const apiKey = process.env.SMS_API_KEY;
        const message = process.env.MESSAGE;
        const senderId = process.env.SENDER_ID;
        if (!apiKey) {
            throw new Error('API key is required for Fast2SMS');
        }
        const response = await fetch(`
        https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=dlt&sender_id=${senderId}&message=${message}&variables_values=${otp}&flash=0&numbers=${mobile}`
        );
        if (!response) {
            throw new Error('Error Sending in Message');
        }
        return await response.json();
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

