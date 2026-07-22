import HTTP_STATUS from "../../constants/httpStatus.js";
import { chatWithAI } from "./ai.service.js";

export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "Message is required.",
      });
    }

    const response = await chatWithAI(
      message,
      req.user._id
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      statusCode: HTTP_STATUS.OK,
      message: "AI response generated successfully.",
      data: {
        response,
      },
    });

  } catch (error) {
    next(error);
  }
};