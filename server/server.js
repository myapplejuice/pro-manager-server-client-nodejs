import express from 'express'
import V1_ROUTER from './routes/v1.js'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv';
dotenv.config();

//INITIALIZE SERVER
const PORT = 8080
const SERVER = express()
SERVER.use(express.json())
SERVER.use(express.urlencoded({ extended: true }))

//MIDDLEWARE
SERVER.use(cors())
SERVER.use(morgan("dev"))

//MICROSERVICE
SERVER.use('/api', V1_ROUTER)

SERVER.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`) })