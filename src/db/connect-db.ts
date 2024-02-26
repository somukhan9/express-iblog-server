import mongoose from "mongoose"
import { DB_NAME } from "../constants"

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI!}/${DB_NAME}`,
    )
    console.log(`Database connected at ${connectionInstance.connection.host}!`)

    connectionInstance.connection.on("error", (error) => {
      console.log(`Failed to connect to the DATABASE!`)

      console.log(error)
    })
  } catch (error) {
    console.error(
      `Something went wrong while connecting to the DATABASE!\n\n${error}`,
    )
  }
}
