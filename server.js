import bodyParser from "body-parser"
import express from "express"
import adminRoute from "./routes/adminRoute.js"
import path from 'path'
import { fileURLToPath } from "url"
import env from "dotenv"


env.config()// load environment variables
const app = express()
const PORT = process.env.PORT || 5000



const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Define __dirname using import.meta.url

// Set the views directory
app.set('views', path.join(__dirname, 'views'));
// set view enjine
app.set("view engine","ejs")

// middelwares
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())

// Routes
app.use('/',adminRoute)

app.listen(PORT, '0.0.0.0', ()=>
    {
    console.log(`Server running on http://0.0.0.0:${PORT}`)
}
 )