import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'



export default function Navbar() {
    const userLoginData = useAuth();
    const navigate = useNavigate();
    const handleLogoutClick = () => {
        userLoginData.logoutUser();
        // navigate("/");
    }

    if (userLoginData.isUserLoggedIn) {
        return (
            <div>
                <Link to="/dashboard">Dashboard</Link><br />
                <Link to="/" onClick={handleLogoutClick} >Logout</Link>
            </div>
        )
    }
    else {
        return (
            <div>
                <Link to="/login">Login</Link><br />
                <Link to="/register">Register</Link>
            </div>
        )
    }
}
