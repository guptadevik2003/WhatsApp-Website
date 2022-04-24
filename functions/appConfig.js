module.exports = ({ app, express }) => {
    express.appConfig = async () => {

        app.use(express.static(`${process.cwd()}/views`))

        app.set('view engine', 'ejs')

        app.use(express.json())

        app.use(express.urlencoded({ extended: false }))

    }
}
