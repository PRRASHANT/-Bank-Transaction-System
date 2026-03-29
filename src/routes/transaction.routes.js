const {Router} = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller')


const transactionRoutes = Router();


// post/api/transactions
//Create a new Transaction

transactionRoutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction)

//Post/ api/ transactions/system/initial-funds
//create initial funds transaction from system user

transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction)

transactionRoutes.post("/system/initial-funds",
transactionController.createInitialFundsTransaction)

module.exports = transactionRoutes;
