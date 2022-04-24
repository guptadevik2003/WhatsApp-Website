const express = require('express')
const app = express()
const fs = require('fs')
require('dotenv').config()

const functions = fs.readdirSync('./functions').filter(file => file.endsWith('.js'))
for (file of functions) {
    require(`./functions/${file}`)({ app, express })
}

// Init Functions
express.appConfig()
express.useRoutes()

// Listening to PORT
const PORT = process.env.PORT
app.listen(PORT, async () => {

    // Init Main Functions
    await express.mongooseLogin()

    console.log(`Server Started at Port ${PORT}`)

})
