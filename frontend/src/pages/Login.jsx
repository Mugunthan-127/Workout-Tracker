import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/auth.css";

function Login() {

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {

    let newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (validateForm()) {
      try {
        setLoading(true);
        const response = await authAPI.login(formData);
        
        /* Save token to localStorage */
        localStorage.setItem("token", response.data.token);
        
        alert("Login Successful!");
        navigate("/dashboard");
      } catch (error) {
        alert(error.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container">

      <div className="form-box">

        <h1>Login</h1>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
          />

          {errors.email && (
            <p className="error">{errors.email}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
          />

          {errors.password && (
            <p className="error">{errors.password}</p>
          )}

          <button type="submit">
            Login
          </button>

        </form>

        <p>
          Don't have an account?
          <Link to="/signup"> Signup</Link>
        </p>

      </div>

    </div>
  );
}

export default Login;