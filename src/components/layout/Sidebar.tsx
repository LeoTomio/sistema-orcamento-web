import { useState } from "react";
import { Button, Nav } from "react-bootstrap";
import { BarChart, Boxes, CashStack, ChevronDoubleLeft, ChevronDoubleRight, Layers, People, PersonCircle, Tags } from "react-bootstrap-icons";
import { NavLink } from "react-router-dom";
import "../../styles/sidebar.css";

export default function Sidebar() {
    const [open, setOpen] = useState(false);

    return (
        <div className={`sidebar ${open ? "open" : "closed"}`}>
            <div className="sidebar-header">
                <div className="title-area">
                    {open && <b className="ms-1">Seu Orçamento</b>}
                </div>

                <Button
                    variant="light"
                    size="sm"
                    onClick={() => setOpen(!open)}
                    className="toggle-btn"
                >
                    {open ? <ChevronDoubleLeft /> : <ChevronDoubleRight />}
                </Button>
            </div>

            <hr className="mx-0 my-1" />

            <Nav className="flex-column sidebar-menu-margin mt-3">

                <Nav.Link
                    as={NavLink}
                    to="/dashboard"
                    className="menu-item"
                >
                    <BarChart size={20} className="me-2" />
                    {open && "Dashboard"}
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/orcamentos"
                    className="menu-item"
                >
                    <CashStack  size={20} className="me-2" />
                    {open && "Orçamentos"}
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/produtos"
                    className="menu-item"
                >
                    <Boxes size={20} className="me-2" />
                    {open && "Produtos"}
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/materiais"
                    className="menu-item"
                >
                    <Layers size={20} className="me-2" />
                    {open && "Materiais"}
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/clientes"
                    className="menu-item"
                >
                    <People size={20} className="me-2" />
                    {open && "Clientes"}
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/usuario"
                    className="menu-item"
                >
                    <PersonCircle size={20} className="me-2" />
                    {open && "Usuário"}
                </Nav.Link>

                 <Nav.Link
                    as={NavLink}
                    to="/planos"
                    className="menu-item"
                >
                    <Tags size={20} className="me-2" />
                    {open && "Planos"}
                </Nav.Link>

            </Nav>
        </div>
    );
}