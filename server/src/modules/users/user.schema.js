import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ROLES from "../../constants/roles.js"




const userSchema = new mongoose.Schema(
    {
        fullName: {
            type : String,
            required : true,
            trim : true
        },

        email: {
            type : String,
            required : true,
            unique: true,
            lowercase : true,
            trim : true
        },

        password:{
            type : String,
            required : true,
            minlength : 8
        },

        phone : {
            type : String,
            default : null
        },

        role : {
            type : String,
            enum : Object.values(ROLES),
            default : ROLES.USER,
        },

        isVerified : {
            type : Boolean,
            default : false,
        },

        refreshToken : {
            type : String,
            default : null 
        },
        

},{
    timestamps : true,
})

// Hash Password 
// userSchema.pre("save" , async function (next) {
//     if (!this.isDirectModified("password")) {
//         return next()
//     }

//     this.password = await bcrypt.hash(this.password, 10)

//     next()
// })

// hash password before saving
//   userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// Compare Password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


// Generate Refresh Token

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
       { 
        id: this._id,
       },
       config.jwtRefreshSecret,
       {
        expiresIn : "7d",
       }
    )

}

const User = mongoose.model("User" , userSchema)

export default User;