import dotenv from "dotenv"

import { app } from "./app"
import { connectDB } from "./db/connect-db"

dotenv.config({ path: "./.env" })

const port = process.env.PORT || 5000

/**
 * Configuring Cloudinary
 */
import { v2 as cloudinary } from "cloudinary"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

connectDB()
  .then(() => {
    app.listen(port, () =>
      console.log(`Server is listening at http://localhost:${port}`),
    )
  })
  .catch((error) => {
    console.log(`----FROM INDEX----\n\nDB Connection Error\n\n\n${error}`)
    process.exit(1)
  })
