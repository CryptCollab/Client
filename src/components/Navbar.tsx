import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';


export default function Navbar() {
    const userLoginData = useAuth();

    const handleLogoutClick = () => {
        userLoginData.logoutUser();
    }
        
    if (userLoginData.isUserLoggedIn) {
        return (             
            <AppBar position="static">
                <Toolbar sx={{ flexWrap: 'wrap' }}>       
                    <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
                        Home
                    </Typography>          
                <Button href="/dashboard" color="inherit" >Dashboard</Button>
                <Button href="/" color="inherit" >Logout</Button>
                </Toolbar>
            </AppBar>           
        )
    }
    else{
        return (           
            <AppBar position="static" >
                <Toolbar sx={{ flexWrap: 'wrap' }}>       
                    <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
                        Home
                    </Typography>                   
                    <Button href="/login" color="inherit" >Login</Button>
                    <Button href="/register" color="inherit" >Register</Button>                    
                </Toolbar>
            </AppBar>            
        )
    } 


}
