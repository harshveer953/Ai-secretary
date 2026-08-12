import { Navigate, Route, Routes } from "react-router-dom";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Temporary fallback */}
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;
