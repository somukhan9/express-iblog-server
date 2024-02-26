import fs from "fs"
import { Request, Response, NextFunction } from "express"

export const cleanUpFilesFromServer = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  /**
   * First all the files saved by multer should be removed
   * In case of Single File
   */
  if (req.file) {
    const localFilePath = req.file.path
    // console.log(localFilePath)
    fs.unlinkSync(localFilePath)
  }

  /**
   * First all the files saved by multer should be removed
   * In case of Multiple Files
   */
  if (req.files) {
    Object.entries(req.files).forEach((item) => {
      const localFilePath = item[1][0].path
      // console.log(localFilePath)
      fs.unlinkSync(localFilePath)
    })
  }

  next(err)
}
