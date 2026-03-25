const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")



const router =express.Router()


// -Post /api/account -> Create a new account -> protected Route
router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)





module.exports = router