import axios from 'axios';

export const sendEmail = async (otp, ip, date,email) => {
    try {
        const templateData = {
            otp: otp,
            ip: ip,
            date: date,
            email: email
        };

    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
            service_id: process.env.SERVICE_ID,
            template_id: process.env.TEMPLATE_ID,
            user_id: process.env.PUBLIC_KEY,  // Your public key
            accessToken: process.env.PRIVATE_KEY,  // Ensure this field is correct for authentication
            template_params: templateData
        });        
        console.log("Email sent successfully:", response);

        console.log(response.data);
        return response.data; // You can return or handle the response as needed
    } catch (error) {
        console.error("Error sending email:", error.response ? error.response.data : error);
        // throw new Error("Error sending email");
    }
};


export const sendResetLink=async(reset_link,sender_email)=>{
    try {
        const templateData = {
            reset_link: reset_link,
            sender_email: sender_email
        };

    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
            service_id: process.env.SERVICE_ID,
            template_id: process.env.TEMPLATE_FORGET_ID,
            user_id: process.env.PUBLIC_KEY,  // Your public key
            accessToken: process.env.PRIVATE_KEY,  // Ensure this field is correct for authentication
            template_params: templateData
        });        
        console.log("Email sent successfully:");

        console.log(response.data);
        return response.data; // You can return or handle the response as needed
    } catch (error) {
        console.error("Error sending email:", error.response ? error.response.data : error);
        // throw new Error("Error sending email");
    }
}

// sendResetLink("https://chatgpt.com/","programmer.rahulgupta@gmail.com")
// sendEmail("1234","127.0.0.1",Date.now().toString())