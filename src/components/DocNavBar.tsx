import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import NavDropdown from "react-bootstrap/NavDropdown";
import Image from "react-bootstrap/Image";


export default function DocNavBar() {
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

	const linkStyle = {
		margin: "1rem",
		textDecoration: "none",
		color: "white"
	};


	return (
		<Navbar bg="dark" variant="dark" expand="lg">
			<Container>
				<Navbar.Brand href="/">
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
						{/*<Button onClick={handleLogout} variant="link" 
					style={{textDecoration: "none",
  							color: 'white'}}>
							Logout
						</Button>*/}
					</Nav>
					<NavDropdown title={
						<Image
							src={"https://github.com/nightink.png"}
							alt="User profile image"
							roundedCircle
							style={{ width: "30px" }}
						/>
					} style={{ color: "white", margin: "1rem", }} id="collasible-nav-dropdown">
						<NavDropdown.Item href="#action/3.1" className="text-center" style={{ fontWeight: "bold" }}>{user.userData?.userName}</NavDropdown.Item>
						<NavDropdown.Divider />
						<NavDropdown.Item className="text-center">
							<Button variant="primary" onClick={handleLogout}
								style={{
									textDecoration: "none",
								}}>
								Logout
							</Button>
						</NavDropdown.Item>
					</NavDropdown>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);

}
