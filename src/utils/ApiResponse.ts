class ApiResponse {
  message: string
  statusCode: number
  success: boolean
  data: any

  constructor(
    message: string,
    statusCode: number,
    success: boolean = true,
    data: any = null,
  ) {
    this.message = message
    this.statusCode = statusCode
    this.success = success
    this.data = data
  }
}

export const createApiResponse = (
  message: string,
  statusCode: number,
  success: boolean = true,
  data: any = null,
) => {
  return new ApiResponse(message, statusCode, success, data)
}
