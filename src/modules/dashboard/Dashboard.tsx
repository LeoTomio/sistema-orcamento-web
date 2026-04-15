import { Card, Col, Row } from "react-bootstrap";

const Dashboard = () => {
    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col xs={12} >
                    <h2 className="mb-1">Dashboard</h2>
                </Col>
            </Row>

            <Row>
                <Col md={3}>
                    <Card className="page-container">
                        <h4>Orçamento: 1</h4>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="page-container">
                        <h4>Material: 2</h4>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="page-container">
                        <h4>Produto: 3</h4>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="page-container">
                        <h4>Cliente: 4</h4>
                    </Card>
                </Col>

                <Col md={6}>

                    <Card className="page-container">
                        <h4>Ultimos orçamentos: 4</h4>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="page-container">
                        <h4>Total</h4>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default Dashboard;