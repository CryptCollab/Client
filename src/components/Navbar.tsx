import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';

export default function Navbar() {
    const user = useAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await axios.get("/api/logout")
            user.logoutUser();
            navigate("/");
        }
        catch (error) {
            console.error(error);
        }

    }

    if (user.isUserLoggedIn()) {
        return (
            <Box sx={{ flexGrow: 1 }}>
                <CssBaseline />
                <AppBar position="static">
                    <Toolbar >
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Home
                        </Typography>
                        <Button href="/dashboard" color="inherit">Dashboard</Button>
                        
                        <Button onClick={handleLogout} color="inherit">Logout</Button>
                    </Toolbar>
                </AppBar>
            </Box>
        )
    }
    else {
        return (
            <Box sx={{ flexGrow: 1 }}>
                <CssBaseline />
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Home
                        </Typography>
                        <Button href="/login" color="inherit">Login</Button>
                        <Button href="/register" color="inherit">Register</Button>
                        <Button href="/document" color="inherit">Document</Button>
                    </Toolbar>
                </AppBar>
            </Box>
        )
    }


}
