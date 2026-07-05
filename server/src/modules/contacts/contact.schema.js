import mongoose from "mongoose"

const contactSchema = new mongoose.Schema(
    {
        owner : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:  true,
        },

        fullName: {
            type: String,
            trim: true,
            required:  true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        email:{
            type: String,
            trim : true,
            lowercase: true,
            default : "",
        },

        company:{
            type: String,
            trim: true,
            default : "",
        },

        designation: {
            type: String,
            trim: true,
            default : "",

        },

        notes: {
            type: String,
            trim: true,
            default : "",
        },

        isFavorite: {
            type: Boolean,
            default: false,
        },
    },{
        timestamps: true,
    }
)


const Contact = mongoose.model("Contact", contactSchema)

export default Contact