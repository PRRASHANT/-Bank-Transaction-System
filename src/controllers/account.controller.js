// const accountModel = require("../models/account.model");




// async function createAccountController(req,res){

//     const user = req.user;

//     const account = await accountModel.create({
//         user: user._id
//     })


//     res.status(201).json({
//         account
//     })

// }

// async function getUserAccountsController(req, res) {
//     const accpunts = await accountModel.find({ user: req.user._id});

//     return res.status(200).json({
//         accounts
//     })
// }

// async function getAccountBalanceController(req, res ){
//     const { accountId } = req.params;

//     const account = await accountModel.findOne({
//         _id:accountId,
//         user: req.user._id
    
//     })

//     If(!account)
//         return res.status(404).json({
//             message: "Account not found"
//         })
//     }

//     const balance = await account.getBalance();

//     res.status(200).json({
//         accountId: account._id,
//         balance: balance
//     })
// }


// module.exports = {
//     createAccountController,
//     getUserAccountsController,
//     getAccountBalanceController
// }

const accountModel = require("../models/account.model");

async function createAccountController(req, res) {
    const user = req.user;

    const account = await accountModel.create({
        user: user._id
    });

    res.status(201).json({ account });
}

async function getUserAccountsController(req, res) {
    const accounts = await accountModel.find({ user: req.user._id });

    return res.status(200).json({ accounts });
}

async function getAccountBalanceController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    });

    if (!account) {
        return res.status(404).json({ message: "Account not found" });
    }

    // Make sure getBalance exists or replace with field
    const balance = typeof account.getBalance === 'function' 
        ? await account.getBalance()
        : account.balance;

    res.status(200).json({
        accountId: account._id,
        balance
    });
}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController
};