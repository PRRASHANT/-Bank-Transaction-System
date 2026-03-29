const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")



const router =express.Router()


// -Post /api/account -> Create a new account -> protected Route
router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

//GET/api/accounts
// get all accounts of the logged-in user
// Protected Route

router.get("/",authMiddleware.authMiddleware, accountController.getUserAccountsController)

//get/api/accounts/balance/:accountId

router.get("/balance/:accountId",authMiddleware.authMiddleware, accountController.getUserAccountsController)



module.exports = router