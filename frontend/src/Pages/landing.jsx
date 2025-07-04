import React from "react";
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export default function LandingPage() {
    const router = useNavigate();

    return (
        <div className="landingPageContainer">
            {/* Modern and clean AppBar */}
            <AppBar position="static" sx={{ backgroundColor: "#1e2a38", padding: "0.2rem 1rem" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#FF9839" }}>
                        MeetSpace
                    </Typography>

                    <Box sx={{ display: "flex", gap: "1rem" }}>
                        <Button color="inherit" onClick={() => router("/aljk23")}>
                            Join as Guest
                        </Button>
                        <Button color="inherit" onClick={() => router("/auth")}>
                            Register
                        </Button>
                        <Button variant="contained" color="warning" onClick={() => router("/auth")}>
                            Login
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <div className="landingMainContainer">
                <div>
                    <h1>
                        <span style={{ color: "#FF9839" }}>Connect </span>with your Loved Ones
                    </h1>
                    <p>Cover a distance by MeetSpace</p>
                    <Button variant="contained" color="warning" onClick={() => router("/auth")}>
                        Get Started
                    </Button>
                </div>
                <div>
                    <img src="/mobile.png" alt="Mobile illustration" />
                </div>
            </div>
        </div>
    );
}
