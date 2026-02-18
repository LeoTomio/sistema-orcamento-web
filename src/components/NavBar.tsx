import { Button, Container, Nav, Navbar } from "react-bootstrap"
import { BoxArrowRight, Clipboard2 } from "react-bootstrap-icons"
import { useAuth } from "../context/AuthContext"

function NavBar() {
    const { signOut, user } = useAuth()
    return (<Navbar bg="light" expand="lg" className="border-bottom">
        <Container className="d-flex justify-content-between">
            <Navbar.Brand className="d-flex align-items-center gap-2">
                <Clipboard2 size={24} />
                <b>Sistema de Orçamentos</b>
            </Navbar.Brand>

            <Nav className="align-items-center gap-3">
                <span className="text-muted small d-none d-sm-inline">
                    {user?.email}
                </span>

                <Button variant="light" size="sm" onClick={signOut}>
                    <BoxArrowRight className="me-1" />
                    Sair
                </Button>
            </Nav>
        </Container>
    </Navbar>)
}

export default NavBar