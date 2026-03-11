import React, { useContext, useState } from 'react';
import '../App.css';
import withAuth from '../Utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, TextField, Snackbar, Alert } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [codeError, setCodeError] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [isJoining, setIsJoining] = useState(false); // Loading state

    // Join Button validation code
    const handleJoinVideoCall = async () => {
        const trimmedCode = meetingCode.trim();
        
        // Show warning if meeting code is empty
        if (!trimmedCode) {
            setSnackbar({ open: true, message: 'Meeting code is required!', severity: 'warning' });
            return;
        }
        
        // Validate: Only allow letters and numbers
        const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(trimmedCode);
        if (!isAlphanumeric) {
            setSnackbar({ open: true, message: 'Only letters and numbers are allowed in the meeting code.', severity: 'warning' });
            return;
        }
        
        // Validate: Meeting code must be at least 5 characters
        if (trimmedCode.length < 5) {
            setSnackbar({ open: true, message: 'Meeting code must be at least 5 characters.', severity: 'warning' });
            return;
        }
        
        try {
            setIsJoining(true); // Show loading state
            
            // Save the meeting join history
            await addToUserHistory(trimmedCode);
            
            // Show success message
            setSnackbar({ 
                open: true, 
                message: 'Joining meeting...', 
                severity: 'success' 
            });
            
            // Navigate to meeting room
            setTimeout(() => {
                navigate(`/${trimmedCode}`);
            }, 500);
            
        } catch (error) {
            console.error("Failed to join meeting:", error);
            
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Failed to join meeting. Please try again.';
            
            setSnackbar({ 
                open: true, 
                message: errorMessage, 
                severity: 'error' 
            });
        } finally {
            setIsJoining(false); // Reset loading state
        }
    };

    // Handle Enter key press to join
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !codeError && meetingCode.trim()) {
            handleJoinVideoCall();
        }
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        setSnackbar({ 
            open: true, 
            message: 'Logged out successfully', 
            severity: 'info' 
        });
        
        setTimeout(() => {
            navigate("/auth");
        }, 1000);
    };

    return (
        <>
            {/* Navbar Section */}
            <div className="navBar">
                <div className="navLeft" style={{ display: 'flex', alignItems: 'center' }}>
                    <h3>MeetSpace</h3>
                </div>

                <div className="navRight" style={{ display: "flex", alignItems: "center" }}>
                    <div className='historyLink' onClick={() => navigate("/history")}>
                        <IconButton 
                            onClick={() => navigate("/history")}
                            aria-label="View meeting history"
                        >
                            <RestoreIcon />
                        </IconButton>
                        <p>History</p>
                    </div>

                    {/* Logout button */}
                    <Button 
                        className="logoutBtn" 
                        onClick={handleLogout}
                        aria-label="Logout"
                    >
                        Logout
                    </Button>
                </div>
            </div> 

            {/* Main Meet Container */}
            <div className="meetContainer">
                <div className='leftPanel'>
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>
                        <br />
                        <div style={{ display: 'flex', gap: "10px", alignItems: 'flex-start' }}>
                            <TextField
                                id="meeting-code"
                                label="Meeting Code"
                                variant="outlined"
                                value={meetingCode}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Update value first
                                    setMeetingCode(value);

                                    // Validation logic
                                    if (value && !/^[a-zA-Z0-9]*$/.test(value)) {
                                        setCodeError(true);
                                        setErrorText("Only letters and numbers are allowed.");
                                    } else if (value.length > 0 && value.length < 5) {
                                        setCodeError(true);
                                        setErrorText("Minimum 5 characters required");
                                    } else {
                                        setCodeError(false);
                                        setErrorText("");
                                    }
                                }}
                                onKeyPress={handleKeyPress}
                                error={codeError}
                                helperText={codeError ? errorText : "Enter a 5+ character code"}
                                sx={{ width: '200px' }}
                                disabled={isJoining}
                                autoComplete="off"
                                inputProps={{
                                    maxLength: 20,
                                    'aria-label': 'Meeting code input'
                                }}
                            />

                            <Button
                                onClick={handleJoinVideoCall}
                                variant='contained'
                                disabled={isJoining || codeError || !meetingCode.trim()}
                                sx={{ 
                                    height: '56px', 
                                    padding: '0 24px', 
                                    fontSize: '0.9rem',
                                    minWidth: '80px'
                                }}
                            >
                                {isJoining ? 'Joining...' : 'Join'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Panel with image */}
                <div className="rightPanel">
                    <img src='/videoCall.png' alt='Video call illustration' />
                </div>
            </div>

            {/* Snackbar for feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default withAuth(HomeComponent);