import { response } from "express";

class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }


// module.exports = ErrorHandler;
export default ErrorHandler;

/*

const message = {
  status: 'success',
  code: 200,
  message: 'Welcome To VileVilla',
  data:
    mongoose.connection.readyState === 1
      ? 'Connected to MongoDB'
      : 'Not connected to MongoDB',
};
//   res.status(200).json(message);

*/

