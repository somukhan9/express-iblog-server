export class ApiError extends Error {
  statusCode: number
  data: any
  success: boolean
  errors: any

  constructor(
    message: string,
    success: boolean = false,
    statusCode: number = 500,
    data: any = null,
    errors: any,
  ) {
    super(message)
    this.statusCode = statusCode
    this.data = data
    this.success = success
    this.errors = errors
    this.message = message
    this.name = "ApiError"
  }
}

export const createApiError = (
  message: string,
  statusCode: number,
  data: any = null,
  errors: any,
) => {
  return new ApiError(message, false, statusCode, data, errors)
}
