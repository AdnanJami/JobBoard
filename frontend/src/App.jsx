import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/Not_found";
import ProtectedRoot from "./components/ProtectedRoot";
import Post_Job from "./pages/Post_Job";
import Myjob from "./pages/my_job";
import Job_form from "./pages/job_form";
import JobBoard from "./pages/job_board"; // ✅ Add this import!

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" replace />;
}

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoot>
            <Home />
          </ProtectedRoot>
        }
      >
        <Route index element={<JobBoard />} />
        <Route path="post-job" element={<Post_Job />} />
        <Route path="my-jobs" element={<Myjob />} />
        <Route path="job-form" element={<Job_form />} />
      </Route>

      {/* Logout and fallback */}
      <Route path="/logout" element={<Logout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
