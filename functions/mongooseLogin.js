const mongoose = require('mongoose')

module.exports = ({ app, express }) => {
    express.mongooseLogin = async () => {

        mongoose.Promise = global.Promise
        mongoose.connect(process.env.WHATSAPP_MONGODB_URL)

        mongoose.connection.on('connected', async () => {
            console.log(`Connected to Project WhatsApp Database.`)
        })

        mongoose.connection.on('disconnected', async () => {
            console.log(`Disconnected from Project WhatsApp Database.`)
        })

        mongoose.connection.on('err', async (error) => {
            console.log(error)
        })

    }
}
