import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import NavbarSuperior from "./NavBar";
import Sidebar from "./Sidebar";
import { Container } from "react-bootstrap";

export default function Layout() {
    return (
        <div className="layout-container">
            <Sidebar />

            <div className="content-area">
                <NavbarSuperior />

                <div className="page-content">
                    <Container>

                        <Outlet />
                    </Container>
                </div>
                <Footer />
            </div>
        </div>
    );
}