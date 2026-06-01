import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

function Login() {

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {

    e.preventDefault();

    if (validateForm()) {
      alert("Login Successful");
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