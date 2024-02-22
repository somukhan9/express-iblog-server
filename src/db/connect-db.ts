import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI!)
    console.log(`Database connected at ${connectionInstance.connection.host}!`)

    connectionInstance.connection.on("error", () => {
      console.log(`Failed to connect to the DATABASE!`)
    })
  } catch (error) {
    console.error(`Something went wrong while connecting to the DATABASE!`)
  }
}
