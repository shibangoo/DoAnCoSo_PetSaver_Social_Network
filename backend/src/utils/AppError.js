class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statuscode = statusCode;
        this.errorCode = errorCode || 'INTERNAL_ERROR';
        this.success = false;

        //ghi lai dau vet code loi
        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports = AppError;