//this file is used to create the instance of server and to config the server(which middlewere is being used , How many types of api's will be going to be here)

const express = require("express"); // aquiring the package
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");

const app = express(); // server instance

app.use(express.json()); // Middleware
app.use(cookieParser());

app.use("/api/auth", authRouter); // api

module.exports = app;
