import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import './Form-User.css';

function Form_User({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post(route, { username, password });

            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/", { replace: true });
            } else {
                navigate("/login", { replace: true });
            }
        } catch (error) {
            alert("Error: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {loading && <p>Loading...</p>}
            <button className="form-button" type="submit">
                {name}
            </button>

            {/* 🔹 Link for switching between login/register */}
            <p style={{ marginTop: "15px", fontSize: "14px" }}>
                {method === "login" ? (
                    <>
                        Not registered? <Link to="/register">Register here</Link>
                    </>
                ) : (
                    <>
                        Already have an account? <Link to="/login">Login here</Link>
                    </>
                )}
            </p>
        </form>
    );
}

export default Form_User;
