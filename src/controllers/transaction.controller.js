const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require ("mongoose")

//03.04.05  creating transaction api 
/**
 * Create a new transaction 
 * 10 steps  Transfer Flow:
 * 1. Validate request
 * 2. validate idempotency key
 * 3. check account Status
 * 4. derive sender balance from ledger
 * 5. Create transaction(PENDING)
 * 6. create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MONGODB Session 
 * 10. Send email notification
 */

async function createTransaction(req, res){

try{

// 1. Validate request part

    const {fromAccount, toAccount, amount ,idempotencyKey } = req.body

    if(!fromAccount || !toAccount  || !amount  || !idempotencyKey) {
        return res.status(400).json({
            message:"FromAccount, toAccount , amount and idempotencyKey are required "
        })
    }

    const fromUserAccount = await accountModel.findById(fromAccount)

    const toUserAccount = await accountModel.findById(toAccount)

    if(!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }


//2. validation of idempotency key 

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey : idempotencyKey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status == "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status == "PENDING") {
            return res.status(200).json({
                message: "Transaction is Processing",
            })
        }

        if(isTransactionAlreadyExists.status == "FAILED"){
            return res.status(500).json({
                message: "Transaction processing failed previously, please retry"
            })
        }

        if(isTransactionAlreadyExists.status == "REVERSED"){
            return res.status(500).json({
                message: "Transaction was reversed, please retry "
            })
        }
    }

// 3 .Check account status

    if(fromUserAccount.status !=="ACTIVE" || toUserAccount.status !=="ACTIVE"){
        return res.status(400).json({
            message :"Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }
    
//4. derive sender balance from ledger 

    const balance = await fromUserAccount.getBalance()

    if(balance <amount) {
        return res.status(400).json({
            message : `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

//5. Creating transaction(Pending)

    const session = await mongoose.startSession()
    session.startTransaction()

    const [transaction] = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }],{ session })

    await ledgerModel.create([{
        account: fromAccount,
        amount : amount,
        transaction: transaction._id,
        type:"DEBIT"
    }],{ session })

    await ledgerModel.create([{
        account: toAccount,
        amount : amount,
        transaction: transaction._id,
        type:"CREDIT"
    }],{ session })

    transaction.status ="COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

// 10.Send email notification 

    await emailService.sendTransactionEmail(req.user.email,req.user.name,amount, toAccount )

    return res.status(201).json({
        message: "Transaction Completed Successfully",
        transaction : transaction
    })

}catch(error){

    return res.status(500).json({
        message:"Transaction failed",
        error:error.message
    })

}

}


async function createInitialFundsTransaction(req,res){

try{

    const{ toAccount, amount ,idempotencyKey } = req.body

    if(!toAccount  || !amount  || !idempotencyKey){
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findById(toAccount)

    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid Account"
        })
    }


    // const fromUserAccount = await accountModel.findOne({
    //     user: req.user._id
    // })

    const fromUserAccount = await accountModel.findOne()

    if(!fromUserAccount) {
       return res.status(400).json({
        message: "System user account not found "
       }) 
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const [transaction] = await transactionModel.create([{
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }],{ session })

    await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }],{ session })

    await ledgerModel.create([{
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }],{ session })

    transaction.status ="COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "initial funds transaction completed successfully !",
        transaction: transaction 
    })

}catch(error){

    return res.status(500).json({
        message:"Initial funds transaction failed",
        error:error.message
    })

}

}



module.exports ={
    createTransaction,
    createInitialFundsTransaction
}