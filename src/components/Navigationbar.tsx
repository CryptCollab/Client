import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


export default function Navigationbar() {
	const user = useAuth();
	const navigate = useNavigate();
	const axios = useAxios();
	const handleLogout = async () => {
		try {
			await axios.get("/api/logout");
			user.logoutUser();
			navigate("/");
		}
		catch (error) {
			console.error(error);
		}

	};

	if (user.isUserLoggedIn()) {
		return (			
			<Navbar bg="dark" variant="dark" expand="lg">
        		<Container>
          			<Navbar.Brand href="#home">Home</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
        			<Navbar.Collapse id="basic-navbar-nav">
          				<Nav className="me-auto">
            				<Nav.Link href="/dashboard">Dashboard</Nav.Link>
            				<Nav.Link href="/document">Document</Nav.Link>
            				<Nav.Link onSelect={handleLogout}>Logout</Nav.Link>
          				</Nav>
					</Navbar.Collapse>
        		</Container>
      		</Navbar>
		);
	}
	else {
		return (			
			<Navbar bg="dark" variant="dark" expand="lg">
        		<Container>
          			<Navbar.Brand href="#home">Home</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
        			<Navbar.Collapse id="basic-navbar-nav">
          				<Nav className="me-auto">
            				<Nav.Link href="/login">Login</Nav.Link>
            				<Nav.Link href="/register">Register</Nav.Link>            			
          				</Nav>
					</Navbar.Collapse>
        		</Container>
      		</Navbar>
		);
	}


}
