import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";


export default function Navigationbar() {
	const auth = useAuth();
	const navigate = useNavigate();
	const axios = useAxios();
	const handleLogout = async () => {
		try {
			await axios.get("/api/logout");
			auth.logoutUser();
			navigate("/");
		}
		catch (error) {
			console.error(error);
		}

	};

	const linkStyle = {
		margin: "1rem",
		textDecoration: "none",
		color: "white"
	};

	if (auth.isUserLoggedIn()) {
		return (
			<Navbar bg="dark" variant="dark" expand="lg">
				<Container>
					<Navbar.Brand href="#home">
						<img style={{ objectFit: "contain" }}
							src="/logo_50_dark.png"
							width="auto"
							height="auto"
						/>{" "}
						CryptCollab
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="ms-auto">
							<Link to="/dashboard" style={linkStyle}>Dashboard</Link>
							<Link to="/document" style={linkStyle}>Document</Link>
							<Button onClick={handleLogout} variant="link"
								style={{
									textDecoration: "none",
									color: "white"
								}}>
								Logout
							</Button>
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
					<Navbar.Brand href="#home">
						<img style={{ objectFit: "contain" }}
							src="/logo_50_dark.png"
							width="auto"
							height="40"

						/>{" "}
						CryptCollab
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="ms-auto">
							<Link to="/login" style={linkStyle}>Login</Link>
							<Link to="/register" style={linkStyle}>Register</Link>
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		);
	}


}
