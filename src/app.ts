import express, { Express } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import { cleanUpFilesFromServer } from "./middlewares/cleanup.middleware"
import { notFound } from "./middlewares/not-found.middleware"
import { errorHandlerMiddleware } from "./middlewares/error.middleware"

/**
 *  Initialize Express App Instance
 */
const app: Express = express()

/**
 *  Necessary Middlewares
 *  1. CORS
 *  2. EXPRESS JSON BODY PARSING
 *  3. EXPRESS URL ENCODED ENABLE
 *  4. EXPRESS STATIC FILE SERVING ENABLE
 *  5. COOKIE PARSER
 */
app.use(cors({ origin: ["*"], credentials: true }))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

/**
 *  All the routes import
 */
import { userRouter } from "./routes/user.route"

/**
 *  Add all the valid routes here
 */
app.use("/api/v1/user", userRouter)

/**
 *  Cleanup files middleware
 */
app.use(cleanUpFilesFromServer)

/**
 *  Not found middleware
 */
app.use(notFound)

/**
 *  Error handling middleware
 */
app.use(errorHandlerMiddleware)

/**
 *  Exporting the Express App Instance
 */
export { app }
