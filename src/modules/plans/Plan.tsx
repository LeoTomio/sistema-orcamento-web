import { Card, Col, Row } from "react-bootstrap";
import { cacheTime } from "../../utils/enum";

import { useQuery } from "@tanstack/react-query";
import PricingCard from "./PricingCard";
import planService from "./Service";
import { SubscribeModal } from "./Modal";
import { useState } from "react";
import type { BillingType } from "./types";

function Plans() {

    const [openSubscribeModal, setOpenSubscribeModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState({
        plan: { id: "", name: "", monthlyPrice: 0, yearlyPrice: 0 },
        billing: "monthly" as BillingType,
    });

    const { data, isLoading } = useQuery({
        queryKey: ["plans"],
        queryFn: () => planService.getAll(),
        staleTime: cacheTime.fiveMinutes,
        refetchOnWindowFocus: false,
    });

    const plans = data || [];

    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col xs={12}>
                    <h2 className="mb-1">Planos</h2>
                </Col>
            </Row>
            <Row className="d-flex justify-content-center">
                {isLoading &&
                    <Card className="page-container">
                        <Col xs={12}>
                            <Card className="border-0 shadow-sm rounded-4">
                                <Card.Body className="text-center py-5 text-muted">
                                    Carregando...
                                </Card.Body>
                            </Card>
                        </Col>
                    </Card>
                }
                {!isLoading &&
                    <PricingCard
                        plans={plans}
                        features={[
                            "Gestão de clientes",
                            "Orçamentos ilimitados",
                            "Cadastro de produtos e materiais",
                            "Relatório completo"
                        ]}
                        onSubscribe={async (plan, billing) => {
                            setOpenSubscribeModal(true);
                            setSelectedPlan({ plan, billing }); 
                        }}
                    />
                }
            </Row>
            <SubscribeModal
                show={openSubscribeModal}
                selectedPlan={selectedPlan}
                onHide={() => setOpenSubscribeModal(false)}
            />
        </>
    );
}

export default Plans;