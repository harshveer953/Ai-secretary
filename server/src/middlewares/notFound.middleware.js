import ApiError from "../shared/ApiError.js"
import HTTP_STATUS from "../constants/httpStatus.js"

const notFound = (req, res , next) => {
    next(
        new ApiError(
            HTTP_STATUS.NOT_FOUND, 
            "Route not found"
        )
    )
}

export default notFound