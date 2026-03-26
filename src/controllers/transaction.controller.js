const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")



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
            res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status == "PENDING") {
            res.status(200).jspn({
                message: "Transaction is Processing",

            })
        }

        if(isTransactionAlreadyExists.status == "FAILED"){
            res.status(500).json({
                message: "Transaction processing failed previously, please retry"
            })
        }

        if(isTransactionAlreadyExists.status == "REVERSED"){
            res.status(500).json({
                messgae: "Transaction was reversed, please retry "
            })
        }
    }

// 3 .Check account status

    

}


