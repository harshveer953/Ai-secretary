import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user")


const initialState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: !!storedUser,
    loading: false,
    error: null
}


const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.user = action.payload;
      state.isAuthenticated = true;

      localStorage.setItem(
        "user",
        JSON.stringify(action.payload)
      )
    },

    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;

      localStorage.setItem(
        "user",
        JSON.stringify(action.payload)
      )
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  setUser,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer