// this file is used to start the server 

require("dotenv").config()


const app = require("./src/app") // we are not using import here bcoz all the previous companies used to have servers using require
const connectToDB  = require("./src/config/db")


connectToDB()


// To start the server
app.listen(3000,() =>{
    console.log("Server is Running on port 3000")
})

