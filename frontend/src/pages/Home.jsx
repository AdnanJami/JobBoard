import React, { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import api from "../api"; // ✅ Make sure this matches your actual API setup

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/api/v1/current-user/");
        setUsername(response.data.username);
      } catch (err) {
        console.error(err);
        // fallback to localStorage if backend not working
        const storedUser = localStorage.getItem("username");
        if (storedUser) setUsername(storedUser);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#0f172a" }}>
      <Sidebar
        backgroundColor="#1e1e2f"
        rootStyles={{
          color: "#fff",
          borderRight: "1px solid #333",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #333",
              fontSize: "18px",
              fontWeight: "600",
              color: "#60a5fa",
            }}
          >
            Hello, {username}
          </div>

          <Menu
            menuItemStyles={{
              button: ({ level, active }) => ({
                fontSize: "15px",
                padding: "10px 20px",
                transition: "all 0.2s ease-in-out",
                color: level === 0 ? "#cfcfcf" : "#1e1e2f",

                "&:hover": {
                  backgroundColor: "#2a2a40",
                  color: "#60a5fa",
                },

                ...(active && {
                  backgroundColor: "#3b3b60",
                  color: "#60a5fa",
                  fontWeight: "600",
                  borderLeft: "3px solid #60a5fa",
                }),
              }),
            }}
          >
            <MenuItem active={isActive("/")} component={<Link to="/" />}>
              🌎 Jobs
            </MenuItem>

            <SubMenu label="🏠 HOME">
              <MenuItem
                active={isActive("/post-job")}
                component={<Link to="/post-job" />}
              >
                Post a Job
              </MenuItem>
              <MenuItem
                active={isActive("/my-jobs")}
                component={<Link to="/my-jobs" />}
              >
                My Jobs
              </MenuItem>
              <MenuItem onClick={handleLogout}>🚪 Logout</MenuItem>
            </SubMenu>
          </Menu>

          <div style={{ flexGrow: 1 }}></div>

          {/* GitHub link */}
          <div
            style={{
              borderTop: "1px solid #333",
              padding: "15px 20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#9ca3af",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontSize: "14px",
            }}
            onClick={() => window.open("https://adnanjami.github.io/", "_blank")}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#60a5fa";
              e.currentTarget.style.backgroundColor = "#2a2a40";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9ca3af";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span>GitHub</span>
          </div>
        </div>
      </Sidebar>

      <main style={{ flexGrow: 1, overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Home;
