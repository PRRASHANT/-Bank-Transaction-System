const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require ("mongoose")

//2.32.26- Creating Transaction
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

// 1. Validate request part

    const {fromAccount, toAccount, amount ,idempotencyKey } = req.body

    if(!fromAccount || !toAccount  || !amount  || !idempotencyKey) {
        return res.status(400).json({
            message:"FromAccount, toAccount , amount and idempotencyKey are required "
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id : fromAccount,

    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,

    })

    if(!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            messgae: "Invalid fromAccount or toAccount"
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
            return res.status(200).jspn({
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
                messgae: "Transaction was reversed, please retry "
            })
        }
    }

// 3 .Check account status

    if(fromUserAccount.status !=="ACTIVE" || toUserAccount.status !=="ACTIVE"){
        return res(400).json({
            message :"Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }
    
//4. derive sender balance from ledger 

    const balance = await fromUserAccount.getBalance()

    if(balance <amount) {
        return res.status(400).json({
            message : `Insufficient balance. Current balance is ${balance}.Requested amount is ${amount}`
        })
    }

//5. Creating transaction(Pending)

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    },{ session })

    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount : amount,
        transaction: transaction._id,
        type:"DEBIT"
    },{ session })

    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount : amount,
        transaction: transaction._id,
        type:"CREDIT"
    },{ session })

    transaction.status =" COMPLETED "
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

// 10.Send email notification 

    await emailService.sendTransactionEmail(req.user.email,req.user.name,amount, toAccount )
        return res.status(201).json({
            message: "Transaction Completed Successfully",
            transaction : transaction
        })

}



