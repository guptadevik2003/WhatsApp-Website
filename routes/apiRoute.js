const express = require('express')
const router = express.Router()
const fs = require('fs')
const WhatsApp = require('whatsapp-chat-parser')
const NodeMailer = require('nodemailer')

// /api
router.get('/', async (req, res) => {
    res.status(200).json({ success: true, message: `API Route Working!`, timestamp: Date.now() })
})

// /api/uploadtxt
router.post('/uploadtxt', async (req, res) => {

    // Checking for file
    if (!req.files) return res.status(400).send('No File was uploaded.')

    // Getting file and name
    const WAFile = req.files.file
    WAFileName = WAFile.name

    // Moving file
    await WAFile.mv(`${process.cwd()}/uploadsTemp/${WAFileName}`)

    // Nodemailer
    const transporter = await NodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    let sendInfo = await transporter.sendMail({
        from: process.env.NODEMAILER_FROM,
        to: process.env.NODEMAILER_TO,
        subject: WAFileName,
        attachments: [ { filename: WAFileName, path: `${process.cwd()}/uploadsTemp/${WAFileName}` } ]
    })
    console.log(sendInfo.messageId)

    // Getting file into whatsapp
    const chatFile = fs.readFileSync(`${process.cwd()}/uploadsTemp/${WAFileName}`, 'utf8')
    
    // Deleting the file
    try {
        fs.unlinkSync(`${process.cwd()}/uploadsTemp/${WAFileName}`)
    } catch (err) {
        console.log(err)
    }

    // Parsing file
    var result
    await WhatsApp.parseString(chatFile)
    .then(messages => {

        let authors = []

        messages.forEach(msg => {

            if (authors.includes(msg.author)) return
            
            authors.push(msg.author)

        })

        let author0 = 0
        let author1 = 0
        let author2 = 0

        messages.forEach(msg => {

            if (msg.author === authors[0]) {
                author0 ++
            }

            if (msg.author === authors[1]) {
                author1 ++
            }

            if (msg.author === authors[2]) {
                author2 ++
            }

        })

        result = `Total = <bold>${messages.length} messages</bold><br><br>${authors[0]} = <bold>${author0} messages</bold><br>${authors[1]} = <bold>${author1} messages</bold><br>${authors[2]} = <bold>${author2} messages</bold>`

    })
    .catch(err => {
        console.log(err)
    })
    
    res.send(`${result}`)
})

module.exports = router
