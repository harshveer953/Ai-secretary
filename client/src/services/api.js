import axios from "axios";


const api = axios.create({
    baseURL: "/api/v1",
    headers: {
        "Content-Type" : "application/json",
    },

    withCredentials : true,

})


// Request interceptors

api.interceptors.request.use(
    (config) => {
        const accessToken = 
        localStorage.getItem("accessToken")

        if (accessToken) {
            config.headers.Authorization = 
            `Bearer ${accessToken}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)



// Response interceptor

api.interceptors.response.use(
    (response) => {
        return response
    },

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("user")
        }

        return Promise.reject(error)
    }
)


export default api























// import axios from "axios"

// const api = axios.create({
//     baseURL: "/api/v1",
//     headers: {
//         "Content-Type": "application/json",
//     }
// })


// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("accessToken")

//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`
//         }

//         return config
//     },
//     (error) => {
//         return Promise.reject(error)
//     }
// )

// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("user");
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


