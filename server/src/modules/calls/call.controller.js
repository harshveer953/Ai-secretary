import asyncHandler from "../../shared/asyncHandler.js"
import ApiResponse from "../../shared/ApiResponse.js"
import HTTP_STATUS from "../../constants/httpStatus.js"

import { createCall, getMyCalls, getCallById, updateCall, deleteCall } from "./call.service.js"
import { ca } from "zod/v4/locales"

export const create = asyncHandler(async (req,res) => {
    const call = await createCall(
        req.user._id,
        req.body,
    )

    return res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
            HTTP_STATUS.CREATED,
            "Call created successfully.",
            call
        )
    )
})

export const getAll = asyncHandler(async (req,res) =>{
    const data = await getMyCalls(
        req.user._id,
        req.query
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Calls fetched successfully.",
            data
        )
    )
})


export const getById = asyncHandler(async (req,res) => {
    const call = await getCallById(
        req.params.id,
        req.user._id
        )

        return res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                "Call fetched successfully.",
                call
            )
        )
})


export const update = asyncHandler(async (req,res) => {

    const call = await updateCall(
        req.params.id,
        req.user._id,
        req.body
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Call updated successfully.",
            call
        )
    )
})


export const remove = asyncHandler(async (req, res) => {

  await deleteCall(
    req.params.id,
    req.user._id
  );

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      "Call deleted successfully.",
      null
    )
  );
});