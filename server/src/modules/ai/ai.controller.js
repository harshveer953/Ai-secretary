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

    if (!process.env.GROQ_API_KEY) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "GROQ_API_KEY is not configured in server environment variables.",
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
    console.error("AI Controller Error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: error.message || "Failed to process AI chat request.",
      error: process.env.NODE_ENV === "development" ? error.stack : error.message,
    });
  }
}