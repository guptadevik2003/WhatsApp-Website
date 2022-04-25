const express = require('express')
const router = express.Router()
const fs = require('fs')
const WhatsApp = require('whatsapp-chat-parser')
const NodeMailer = require('nodemailer')

// /arc-sw.js
router.get('/arc-sw.js', async (req, res) => {
    res.sendFile(`${process.cwd()}/views/arc-sw.js`)
})

// /api
router.get('/api', async (req, res) => {
    res.status(200).json({ success: true, message: `API Route Working!`, timestamp: Date.now() })
})

// /
router.get('/', async (req, res) => {
    res.render('home.ejs')
})
router.get('/home', async (req, res) => {
    res.redirect('/')
})
router.get('/index', async (req, res) => {
    res.redirect('/')
})

// /read
router.get('/read', async (req, res) => {
    res.render('read.ejs')
})

// /your-stats POST
router.post('/your-stats', async (req, res) => {

    // Checking for file
    if (!req.files) return res.status(400).send('No File Was Uploaded.')

    // Getting file and name
    const WAFile = req.files.file
    WAFileName = WAFile.name

    // Moving file
    await WAFile.mv(`${process.cwd()}/uploadsTemp/${WAFileName}`)

    // Getting file into whatsapp
    const chatFile = fs.readFileSync(`${process.cwd()}/uploadsTemp/${WAFileName}`, 'utf8')

    // Creating messages JSON
    let messages = await WhatsApp.parseStringSync(chatFile)
    messages = messages.filter(msg => msg.author !== 'System')



    // The Real Magic
    // console.log(messages)

    let totalMessages = messages.length

    let authors = []

    // Getting the authors
    messages.forEach(msg => { if (authors.includes(msg.author)) return; authors.push(msg.author) })

    let author0data = {
        name: '',
        totalMessagesCount: 0,
        totalWordsCount: 0,
        mediaOmitted: 0,
        longestMessage: 0,
        averageWordsPerMessage: 0
    }
    let author1data = {
        name: '',
        totalMessagesCount: 0,
        totalWordsCount: 0,
        mediaOmitted: 0,
        longestMessage: 0,
        averageWordsPerMessage: 0
    }
    
    messages.forEach(msg => {
    
        if (msg.author === authors[0]) {
            author0data.name = msg.author
            author0data.totalMessagesCount ++
            author0data.totalWordsCount += msg.message.split(' ').length
            if (msg.message === '<Media omitted>') {
                author0data.mediaOmitted ++
            }
            if (msg.message.split(' ').length > author0data.longestMessage) {
                author0data.longestMessage = msg.message.split(' ').length
            }
            author0data.averageWordsPerMessage = Math.round(author0data.totalWordsCount / author0data.totalMessagesCount)
        }
    
        if (msg.author === authors[1]) {
            author1data.name = msg.author
            author1data.totalMessagesCount ++
            author1data.totalWordsCount += msg.message.split(' ').length
            if (msg.message === '<Media omitted>') {
                author1data.mediaOmitted ++
            }
            if (msg.message.split(' ').length > author1data.longestMessage) {
                author1data.longestMessage = msg.message.split(' ').length
            }
            author1data.averageWordsPerMessage = Math.round(author1data.totalWordsCount / author1data.totalMessagesCount)
        }
    
    })

    const chattedForStart = new Date(messages[0].date)
    const chattedForEnd = new Date(messages[messages.length - 1].date)
    const chattedFor = Math.floor((chattedForEnd - chattedForStart) / 1000 / 60 / 60 / 24)


    // Nodemailer

    // ======================= Temp Comment =======================
    // const transporter = await NodeMailer.createTransport({
    //     host: 'smtp.gmail.com',
    //     port: 587,
    //     secure: false,
    //     auth: { user: process.env.NODEMAILER_USER, pass: process.env.NODEMAILER_PASS },
    //     tls: { rejectUnauthorized: false }
    // })
    // let sendInfo = await transporter.sendMail({
    //     from: `'WhatsApp Stats' <${process.env.NODEMAILER_FROM}>`,
    //     to: process.env.NODEMAILER_TO,
    //     subject: authors.join(', '),
    //     attachments: [ { filename: WAFileName, path: `${process.cwd()}/uploadsTemp/${WAFileName}` } ]
    // })
    // console.log(sendInfo.messageId)
    // ======================= Temp Comment =======================

    // Deleting the file
    try {
        fs.unlinkSync(`${process.cwd()}/uploadsTemp/${WAFileName}`)
    } catch (err) {
        console.log(err)
    }

    // Final Render
    res.render('your-stats.ejs', {
        data: {
            totalMessages: totalMessages,
            authors: authors,
            author0data: author0data,
            author1data: author1data,
            dates: {
                chatStart: chattedForStart,
                chatEnd: chattedForEnd,
                chattedFor: chattedFor
            }
        }
    })
})

// /read-chat POST
router.post('/read-chat', async (req, res) => {

    // Checking for file
    if (!req.files) return res.status(400).send(`<title>No File Uploaded</title><h1>No File Was Uploaded.</h1><button onclick="window.open('/read','_self')">Go Back</button>`)

    // Getting file and its name
    const WAFile = req.files.file
    WAFileName = WAFile.name

    // Moving file
    await WAFile.mv(`${process.cwd()}/uploadsReadTemp/${WAFileName}`)

    // Getting file into WhatsApp
    const chatFile = fs.readFileSync(`${process.cwd()}/uploadsReadTemp/${WAFileName}`, 'utf8')

    // Deleting file
    try {
        fs.unlinkSync(`${process.cwd()}/uploadsReadTemp/${WAFileName}`)
    } catch (err) {
        console.log(err)
    }

    // Parsing File
    let data = await WhatsApp.parseStringSync(chatFile)
    // Removing System Messages
    data = data.filter(msg => msg.author !== 'System')
    // Defining authors
    let authors = []; data.forEach(msg => { if (authors.includes(msg.author)) return; authors.push(msg.author) })

    // Final Render
    res.render('read-chat.ejs', { data: data, authors: authors })
})

module.exports = router
