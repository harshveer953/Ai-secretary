import asyncHandler from "../../shared/asyncHandler.js"
import HTTP_STATUS from "../../constants/httpStatus.js"
import ApiResponse from "../../shared/ApiResponse.js"

import { createContact,
         getMyContacts,
         getContactById, 
         updateContact, 
         deleteContact,
        toggleFavorite } from "./contact.service.js"
import { httpUrl } from "zod"



export const create = asyncHandler(async (req,res) => {
    const contact = await createContact(
        req.body,
        req.user._id
    )

    return res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
            HTTP_STATUS.CREATED,
            "contact created successfully.",
            contact
        )
    )
})

export const getAll = asyncHandler(async (req, res) => {
    const contacts = await getMyContacts(
             req.user._id,
             req.query.search,
             Number(req.query.page) || 1,
             Number(req.query.limit) || 10,
             req.query.sortBy,
             req.query.order,
             req.query.favorite
        );

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Contacts fetched successfully.",
            contacts
        )
    )
})


export const getById = asyncHandler(async (req, res) => {
    const contact = await getContactById(
        req.params.id,
        req.user._id
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Contact fetched successfully.",
            contact
        )
    )
})


export const update = asyncHandler(async (req,res) => {
    const contact = await updateContact(
        req.params.id,
        req.user._id,
        req.body
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Contact updated successfully.",
            contact
        )
    )
})



export const remove = asyncHandler(async (req, res) => {
    await deleteContact(
        req.params.id,
        req.user._id
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Contact deleted successfully.",
            
        )
    )
})



  export const favorite = asyncHandler(async (req,res) => {

    const contact = await toggleFavorite(
        req.params.id,
        req.user._id,
        req.body.isFavorite
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Favorite status updated successfully.",
            contact
        )
    )
  })