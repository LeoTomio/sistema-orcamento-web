import { Button } from "react-bootstrap";
import { BoxArrowRight } from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";
import "../../styles/navbar.css";

export default function NavbarSuperior() {
    const { user, signOut } = useAuth();

    return (
        <div className="top-navbar">
            <div className="fw-semibold">Olá, {user?.email}</div> 

            <Button variant="outline-light" onClick={signOut} className="navbar-logout">
                <BoxArrowRight size={18} className="me-2" />
                Sair
            </Button>
        </div>
    );
}