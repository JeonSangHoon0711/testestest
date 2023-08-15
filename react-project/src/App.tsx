import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./pages/users/AuthContext";
import About from "./pages/about";
import BlogContent from "./pages/blogcontent";
import List from "./pages/list";
import Login from "./pages/login";
import Register from "./pages/register";
import WriteBlog from "./pages/writeblog";
import Mainpage from "./pages/mainpage";
import Userpage from "./pages/userpage";
import Adminloginpage from "./pages/adminloginpage";
import Admindashboard from "./pages/admindashboard";
function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Mainpage />} />
            <Route path="/list" element={<List />} />
            <Route path="/list/:cid" element={<List />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/writeblog" element={<WriteBlog />} />
            <Route path="/blogcontent/:pid" element={<BlogContent />} />
            <Route path="/userpage" element={<Userpage />} />
            <Route path="/adminlogin" element={<Adminloginpage />} />
            <Route path="/admindashboard" element={<Admindashboard />} />
          </Routes>
          </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
