import React, { useContext, useState } from 'react';
import '../App.css';
import withAuth from '../Utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, TextField, Snackbar, Alert } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [codeError, setCodeError] = useState(false);
    const [errorText, setErrorText] = useState("");


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
            // Save the meeting join history
            await addToUserHistory(trimmedCode);
            navigate(`/${trimmedCode}`);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to join meeting';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
    };


    return (
        <>
            {/* Navbar Section */}
            <div className="navBar">
                <div className= "navLeft" style={{ display: 'flex', alignItems: 'center' }}  >
                    <h3> MeetSpace </h3>
                </div>

                <div className="navRight" style={{ display: "flex", alignItems: "center" }}>
                    <div className='historyLink' onClick={() => navigate("/history")}>
                        <IconButton onClick={() => { navigate("/history") }}>
                            <RestoreIcon />
                        </IconButton>
                        <p>History</p>
                    </div>

                    {/* Logout button */}
                    <Button className= "logoutBtn" onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/auth") // Redirect to auth page
                    }}>
                        Logout
                    </Button>
                </div>
            </div> 

            {/* Main Meet Container */}
            <div className="meetContainer">
                <div className='leftPanel'>
                    <div>
                        <h2>Providing Quality video Call Just Like Quality Education</h2>
                        <br />
                        <div style={{ display: 'flex', gap: "10px" }}>
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
                                if (!/^[a-zA-Z0-9]*$/.test(value)) {
                                  setCodeError(true);
                                   setErrorText("Only letters and numbers are allowed.");
                                } else if (value.length > 0 && value.length < 5) {
                                    setCodeError(true);
                                    setErrorText("Wrong Meeting Code");
                                } else {
                                    setCodeError(false);
                                    setErrorText("");
                                }
                              }}
                               error={codeError}
                               helperText={codeError ? errorText : ""}
                               sx={{ width: '200px' }}
                            />

                            <Button
                               onClick={handleJoinVideoCall}
                               variant='contained'
                               sx={{ height: '40px', padding: '0 16px', fontSize: '0.8rem' }} 
                            
                            >
                                Join
                            </Button>
                        </div>

                    </div>
                </div>

                {/* Right Panel with image */}
                <div className="rightPanel">
                    <img src='/videoCall.png' alt='Logo' />
                </div>
            </div>

            {/* Snackbar for feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default withAuth(HomeComponent);
