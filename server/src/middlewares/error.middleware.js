const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || "Internal server error",
        stack:
            process.env.NODE_ENV === "development" ? err.stack : undefined
    })
}

export default errorHandler