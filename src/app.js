//this file is used to create the instance of server and to config the server(which middlewere is being used , How many types of api's will be going to be here)

const express = require("express"); // aquiring the package
const cookieParser = require("cookie-parser");

const app = express(); // server instance
app.use(express.json()); // Middleware
app.use(cookieParser());

//ROUTES REQUIRED
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");

//USE ROUTES

app.use("/api/auth", authRouter); // api
app.use("/api/accounts", accountRouter);

module.exports = app;
