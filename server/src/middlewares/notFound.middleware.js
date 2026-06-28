import ApiError from "../shared/ApiError.js"


const notFound = (req, res , mext) => {
    next(new ApiError(404, `Route not found : ${req.orignalUrl}`))
}

export default notFound