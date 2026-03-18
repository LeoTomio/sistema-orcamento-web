import { useState } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import NavBar from "../../components/NavBar";
import Budget from "../budgets/Budget";
import Products from "../products/Product";
import Clients from "../clients/Client";
import Footer from "../../components/Footer";
import Users from "../user/User";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<string>("user");

    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />
            <Container className="py-4 flex-grow-1" style={{ maxWidth: "900px" }}>
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k!)}
                    className="mb-3 dashboard-tabs"
                    justify
                    mountOnEnter
                    unmountOnExit
                >
                    <Tab eventKey="budgets" title="Orçamentos">
                        <Budget />
                    </Tab>
                    <Tab eventKey="products" title="Produtos">
                        <Products />
                    </Tab>
                    <Tab eventKey="clients" title="Clientes">
                        <Clients />
                    </Tab>
                    <Tab eventKey="user" title="Usuário">
                        <Users />
                    </Tab>
                </Tabs>
            </Container>
            <Footer />
        </div>
    );
};

export default Dashboard;