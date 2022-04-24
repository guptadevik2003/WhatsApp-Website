module.exports = ({ app, express }) => {
    express.useRoutes = async () => {

        // Import Routes
        const rootRoute = require(`${process.cwd()}/routes/rootRoute`)
        const apiRoute = require(`${process.cwd()}/routes/apiRoute`)

        // Using Routes
        app.use('/api', apiRoute)
        app.use('/', rootRoute)

    }
}
