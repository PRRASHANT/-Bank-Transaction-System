const mongoose = require("mongoose")


const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required:  [true, "Transaction must be associated with a from account "],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required:  [true, "Transaction must be associated with a To account "],
        index: true
    },
    Status:{
        type: String,
        enum: {
            values : ["PENDING","COMPLETED","FAILED", "REVERSED"],
            message: "ststus can be either PENDING,COMPLETED,FAILED OR REVERSED",
        },
        default: "PENDING"
    },
    amount : {
        type: Number,
        required: [true, "Amount is required for creating a transaction " ],
        min:[ 0, "Transaction amount cannot be neggative "]
    },
    //it stops the payment if it is being done twice or stops doing multiple payments id one transaction fails 

    idempotencyKey: {
        type: String,
        required: [ true, "Idempotency key is required for creating a transaction" ],
        index: true,
        unique: true
    },
    timestamps: true
})


const transactionModel = mongoose.model("transaction",transactionSchema)

module.exports = transactionModel