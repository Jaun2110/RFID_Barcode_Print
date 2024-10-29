import express,{Router} from 'express'
import { renderHomePage,getScanData } from '../controller/scannerController.js'

// setup the Router
const router = express.Router()

// get and post requests that redirects to the controller
router.get('/',renderHomePage)

router.post('/scan',getScanData)


export default router