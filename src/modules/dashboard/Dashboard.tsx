import { useState } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import NavBar from "../../components/NavBar";
import Budget from "../budgets/Budget";
import Products from "../products/Product";
import Clients from "../clients/Client";

const Dashboard = () => {

    const [activeTab, setActiveTab] = useState<string>("budgets");


    return (
        <>
            <NavBar />
            <Container className="py-4" style={{ maxWidth: "900px" }}>
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k!)}
                    className="mb-3"
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
                </Tabs>
            </Container>

        </>
    );
};

export default Dashboard;
