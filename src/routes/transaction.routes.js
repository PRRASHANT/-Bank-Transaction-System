const {Router} = require('express');
const authMiddleware = require('../middleware/auth.middleware');



const transactionRoutes = Router();


// post/api/transactions
//Create a new Transaction

transactionRoutes.post("/",authMiddleware.authMiddleware)


module.exports = transactionRoutes;
