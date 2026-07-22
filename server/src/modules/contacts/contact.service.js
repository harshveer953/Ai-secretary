import HTTP_STATUS from "../../constants/httpStatus.js"
import ApiError from "../../shared/ApiError.js"
import Contact from "./contact.schema.js"


export const createContact = async(contactData, ownerId) => {
    const contact = await Contact.create({
        ...contactData,
        owner: ownerId,
    })

    return contact
}

export const getMyContacts = async (
  ownerId,
  search = "",
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "desc",
  favorite
) => {

  const skip = (page - 1) * limit;

  const filter = {
    owner: ownerId,
    fullName: {
      $regex: search,
      $options: "i",
    },
  };

  if (favorite !== undefined) {
    filter.isFavorite = favorite === "true"
  }

   const sort = {
    [sortBy]: order === "asc" ? 1 : -1,
   }

  const contacts = await Contact.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    

  const total = await Contact.countDocuments(filter);

  return {
    contacts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};


export const getContactById = async (contactId, ownerId) => {
    const contact = await Contact.findOne({
        _id: contactId,
        owner: ownerId,
    })

    if (!contact) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Contact not found."
        )
    }

    return contact
}

export const updateContact = async (contactId, ownerId, updateData) => {
    const contact = await Contact.findOneAndUpdate(
        {
            _id: contactId,
            owner: ownerId,
        },
        updateData,
        {
            new: true,
            runValidators: true,
        }
    )

    if (!contact) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Contact not found."
        )
    }

    return contact
}


export const deleteContact = async (contactId, ownerId) => {
    const contact = await Contact.findOneAndDelete({
        _id: contactId,
        owner: ownerId,
    })

    if (!contact) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Contact not found"
        )
    }

    return contact
}


  export const toggleFavorite = async (
    contactId,
    ownerId,
    isFavorite
  ) => {
    const contact = await Contact.findOneAndUpdate(
        {
            _id: contactId,
            owner: ownerId,
        },
        {
            isFavorite,
        },
        {
            new: true,
            runValidators: true,
        }
    )

    if (!contact) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Contact not found."
        )
    }

        return contact
  }