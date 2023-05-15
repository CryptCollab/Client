import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Image from "react-bootstrap/Image";
import { Modal } from "react-bootstrap";
import { useState } from 'react';

export default function DashboardNavBar(){

    const [showModal, setShowModal] = useState(false);
    const handleModalClose = () => {
        setShowModal(false);
    };

  const handleButtonClick = () => {
    setShowModal(true);
  };
    const user = useAuth();
	//console.log(user)
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
	
	
	return (			
		<Navbar bg="dark" variant="dark" expand="lg">
       		<Container>
         		<Navbar.Brand href="/">
					<img style={{objectFit:"contain"}}
     						src="/logo_30_dark.png"
     						width="auto"
     						height="auto"      						     						
    				/>{' '}					
				</Navbar.Brand>
                <Navbar.Text>
                    Dashboard
                </Navbar.Text>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
       			<Navbar.Collapse id="basic-navbar-nav">
         			<Nav className="ms-auto">           			            			
         			</Nav>
                    <Button onClick={handleButtonClick} >                        
                        New Document
                    </Button>
                    <Modal show={showModal} onHide={handleModalClose}>                      
                      <Modal.Header closeButton>
                        <Modal.Title>Create New Document</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        {/* Modal body content */}
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>
                          Close
                        </Button>
                        <Button variant="primary" onClick={handleModalClose}>
                          Create
                        </Button>
                      </Modal.Footer>
                    </Modal>
					<NavDropdown title={
						<Image
    						src={'https://github.com/nightink.png'}
    						alt="User profile image"
    						roundedCircle
    						style={{ width: '25px' }}
  						/>
  					} style={{color:"white",margin: "1rem",}}id="collasible-nav-dropdown">
              			<NavDropdown.Item href="#action/3.1" className="text-center" style={{fontWeight:"bold"}}>{user.userData?.userName}</NavDropdown.Item>               			
              			<NavDropdown.Divider />   
						<NavDropdown.Item className="text-center">           		
                		<Button variant="primary" onClick={handleLogout}  
						style={{textDecoration: "none",
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