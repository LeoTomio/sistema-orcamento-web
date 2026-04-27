import { useQuery } from "@tanstack/react-query";
import moment from 'moment';
import { Card, Col, Row, Table } from "react-bootstrap";
import { Boxes, CashStack, CurrencyDollar, Layers, People, Tools, Wallet2 } from "react-bootstrap-icons";
import { cacheTime } from "../../utils/enum";
import { formatMoney } from "../../utils/formaters";
import dashboardService from "./Service";

const Dashboard = () => {

    const { data, isLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: () => dashboardService.getAll(),
        staleTime: cacheTime.fiveMinutes,
        refetchOnWindowFocus: false,
    });

    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col xs={12} >
                    <h2 className="mb-1">Dashboard</h2>
                </Col>
            </Row>


            {isLoading ?
                <Row>
                    <div>
                        <Card className="border-0 page-container rounded-4">
                            <Card.Body className="text-center py-5 text-muted page-content">
                                Carregando...
                            </Card.Body>
                        </Card>
                    </div>
                </Row>
                :
                <>
                    <Row>
                        <Col sm={12} md={4} lg={3}>
                            <Card className="page-container rounded-4">
                                <div className="d-flex align-items-center">
                                    <CashStack size={40} className="me-3 flex-shrink-0 text-success" />
                                    <div>
                                        <div className="text-muted">Orçamentos</div>
                                        <div className="dashboard-card-values" style={{ fontSize: '1.6rem' }}>{data?.budgets}</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col md={4} lg={3}>
                            <Card className="page-container rounded-4">
                                <div className="d-flex align-items-center">
                                    <Layers size={40} className="me-3 flex-shrink-0" style={{ color: '#8B5CF6' }} />
                                    <div>
                                        <div className="text-muted">Materiais</div>
                                        <div className="dashboard-card-values" style={{ fontSize: '1.6rem' }}>{data?.materials}</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col md={4} lg={3}>
                            <Card className="page-container rounded-4">
                                <div className="d-flex align-items-center">
                                    <Boxes size={40} className="me-3 flex-shrink-0" style={{ color: '#82462b' }} />
                                    <div>
                                        <div className="text-muted">Produtos</div>
                                        <div className="dashboard-card-values" style={{ fontSize: '1.6rem' }}>{data?.products}</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col md={4} lg={3}>
                            <Card className="page-container rounded-4">
                                <div className="d-flex align-items-center">
                                    <People size={40} className="me-3 flex-shrink-0" style={{ color: '#06B6D4' }} />
                                    <div>
                                        <div className="text-muted">Clientes</div>
                                        <div className="dashboard-card-values" style={{ fontSize: '1.6rem' }}>{data?.clients}</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={12} sm={12} md={4} >
                            <Card className="page-container rounded-4">
                                <div className="d-flex align-items-center">
                                    <CurrencyDollar size={40} className="me-3 flex-shrink-0 text-success" />
                                    <div>
                                        <div className="text-muted">Valor em Produtos</div>
                                        <div className="dashboard-card-values" style={{ fontSize: '1.6rem' }}>R$ {formatMoney(Number(data?.productTotal))}</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>


                        <Col xs={12} sm={12} md={4} >
                            <Card className="page-container rounded-4">
                                <div className="d-flex align-items-center">
                                    <Tools size={40} className="me-3 flex-shrink-0" style={{ color: "#64748B" }} />
                                    <div>
                                        <div className="text-muted">Valor em Mão de obra</div>
                                        <div className="dashboard-card-values" style={{ fontSize: '1.6rem' }}>R$ {formatMoney(Number(data?.laborTotal))}</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={12} sm={12} md={4} >
                            <Card className="page-container rounded-4">
                                <div className="d-flex align-items-center">
                                    <Wallet2 size={40} className="me-3 flex-shrink-0" style={{ color: "#F59E0B" }} />
                                    <div>
                                        <div className="text-muted">Receita Total Gerada</div>
                                        <div className="dashboard-card-values" style={{ fontSize: '1.6rem' }}>R$ {formatMoney(Number(data?.finalTotal))}</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col md={12} >
                            <h4 className="mt-2 mb-4">Últimos orçamentos</h4>

                            <Card className="page-container rounded-4">
                                <Card.Body className="p-0">
                                    <Table responsive className="mb-0 align-middle">
                                        <thead>
                                            <tr>
                                                <th>Cliente</th>
                                                <th>Nº</th>
                                                <th>Data</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {!data?.lastBudgets || data.lastBudgets.length === 0 ? (
                                                data?.lastBudgets.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <strong>{item.client_name}</strong>
                                                        </td>

                                                        <td className="text-muted">
                                                            #{String(item.number).padStart(4, '0')}
                                                        </td>

                                                        <td className="text-muted">
                                                            {moment(item.createdAt).format('DD/MM/YYYY')}
                                                        </td>

                                                        <td className="fw-semibold text-success">
                                                            R$ {formatMoney(item.total)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-5 text-muted">
                                                        Nenhum orçamento encontrado.
                                                    </td>
                                                </tr>

                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            }

        </>
    );
};

export default Dashboard;