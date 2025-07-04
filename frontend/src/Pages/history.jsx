import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                console.log("Meeting History:", history); 
                setMeetings(history);
            } catch (error) {
                console.error("Failed to fetch meeting history", error);
                // Optionally: show snackbar or toast here
            }
        };
        fetchHistory();
    }, [getHistoryOfUser]); 

    // Format date from ISO string
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div>
            <IconButton onClick={() => navigate("/home")} sx={{ margin: 1 }}>
                <HomeIcon />
            </IconButton>

            {meetings.length !== 0 ? (
                meetings.map((meeting, index) => (
                    <Card key={index} variant="outlined" sx={{ margin: 2 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                Code: {meeting.meetingCode}
                            </Typography>
                            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                Date: {formatDate(meeting.date)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Typography variant="h6" align="center" mt={4}>
                    No meeting history found.
                </Typography>
            )}
        </div>
    );
}
