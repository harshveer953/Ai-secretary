import HTTP_STATUS from "../constants/httpStatus.js";
import ApiError from "../shared/ApiError.js";

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Authentication required."
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to access this resource."
      );
    }

    next();
  };
};

export default roleMiddleware;