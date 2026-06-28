import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import notFound from './middlewares/notFound.middleware.js'
import errorHandler from './middlewares/error.middleware.js'

// Routes
import routes from "./routes/index.js"

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use(cors())
app.use(helmet())
app.use(compression())
app.use(cookieParser())

app.use(morgan('dev'))




// Health check route
// app.get('/' , (req , res) => {
//     res.status(200).json({
//         success: true,
//         message: "server is running"
//     })
// })

app.use("/api/v1", routes)

// 404 Handler
app.use(notFound)

// Global Error Handler
app.use(errorHandler)



export default app