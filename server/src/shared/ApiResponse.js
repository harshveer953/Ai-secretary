class ApiResponse {
    contructor(statusCode , message = 'Success' , data = null) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message
        this.data = data
        
    }
}

return res.status(201).json(
    new ApiResponse(201, 'User created successfully', user )
)