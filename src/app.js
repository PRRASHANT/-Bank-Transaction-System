//this file is used to create the instance of server and to config the server(which middlewere is being used , How many types of api's will be going to be here)

const express = require("express"); // aquiring the package
const cookieParser = require("cookie-parser");

const app = express(); // server instance
app.use(express.json()); // Middleware
app.use(cookieParser());


//suggested by gpt
app.use((req,res,next)=>{
    console.log("URL:", req.method, req.originalUrl);
    next();
});

//ROUTES REQUIRED
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes")

//USE ROUTES

app.use("/api/auth", authRouter); // api
app.use("/api/accounts", accountRouter);
app.use("/api/transactions",transactionRoutes)

module.exports = app;
