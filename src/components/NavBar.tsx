import { Button, Container, Nav, Navbar } from "react-bootstrap"
import { BoxArrowRight, Clipboard2 } from "react-bootstrap-icons"
import { useAuth } from "../context/AuthContext"
import "../styles/navbar.css"

function NavBar() {
    const { signOut, user } = useAuth()

    return (
        <Navbar bg="light" expand="lg" className="border-bottom app-navbar">
            <Container className="d-flex justify-content-between align-items-center flex-nowrap">
                <Navbar.Brand className="d-flex align-items-center mb-0 brand-nowrap">
                    <Clipboard2 size={24} className="me-2" />
                    <b>Sistema de Orçamentos</b>
                </Navbar.Brand>

                <Nav className="align-items-center flex-nowrap nav-actions">
                    <span className="text-muted small user-email me-2">
                        {user?.email}
                    </span>

                    <Button variant="light" size="sm" onClick={signOut} className="logout-btn">
                        <BoxArrowRight className="me-1" />
                        Sair
                    </Button>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default NavBar