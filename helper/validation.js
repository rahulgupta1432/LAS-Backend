import joi from "joi";
const registerUserValidation=async(user)=>{
    const schema=joi.object({
        name:joi.string().required(),
        email:joi.string().email(),
        password:joi.string().min(8).required(),
        // mobile:joi.string().min(10).max(10)
    });
    let valid = await schema
    .validateAsync(user, { abortEarly: false })
    .catch((error) => {
        console.log("err",error)
      return { error };
    });
  if (!valid || (valid && valid.error)) {
    let msg = [];
    for (let i of valid.error.details) {
        console.log(valid.error)
      msg.push(i.message);
    }
    return { error: msg };
  }
  return { data: valid };
};



const verifyOtpValidation=async(user)=>{
  const schema=joi.object({
    email:joi.string().email(),
    mobile:joi.string().min(10).max(10),
    otp:joi.string().min(4).max(4).required()
  })
  let valid = await schema
  .validateAsync(user, { abortEarly: false })
  .catch((error) => {
    return { error };
  });
if (!valid || (valid && valid.error)) {
  let msg = [];
  for (let i of valid.error.details) {
    msg.push(i.message);
  }
  return { error: msg };
}
return { data: valid };
}

const loginValidation=async(user)=>{
    const schema=joi.object({
        email:joi.string().email(),
        mobile:joi.string().min(10).max(10),
        password:joi.string().required()
    })
    let valid = await schema
    .validateAsync(user, { abortEarly: false })
    .catch((error) => {
      return { error };
    });
  if (!valid || (valid && valid.error)) {
    let msg = [];
    for (let i of valid.error.details) {
      msg.push(i.message);
    }
    return { error: msg };
  }
  return { data: valid };
}



const resetPasswordValidation=async(user)=>{
    const schema=joi.object({
        otp:joi.string().min(4).max(4).required(),
        password:joi.string().min(8).required()
    })
    let valid = await schema
    .validateAsync(user, { abortEarly: false })
    .catch((error) => {
      return { error };
    });
  if (!valid || (valid && valid.error)) {
    let msg = [];
    for (let i of valid.error.details) {
      msg.push(i.message);
    }
    return { error: msg };
  }
  return { data: valid };
}


export const addProductValidation=async(data)=>{
  const schema=joi.object({
    name:joi.string().required(),
    price:joi.number().required(),
    description:joi.string().required(),
    category:joi.string().required(),
    quantity:joi.number().required(),
    imageList:joi.array(),
  });

  let valid = await schema
  .validateAsync(data, { abortEarly: false })
  .catch((error) => {
    return { error };
  });

if (!valid || (valid && valid.error)) {
  let msg = [];
  for (let i of valid.error.details) {
    msg.push(i.message);
  }
  return { error: msg };
}
return { data: valid };
}

export {registerUserValidation,loginValidation,verifyOtpValidation,resetPasswordValidation}