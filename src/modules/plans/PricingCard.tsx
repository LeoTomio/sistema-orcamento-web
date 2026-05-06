import { useState } from "react";
import { Button, ButtonGroup, Card, Col, Row, ToggleButton } from "react-bootstrap";
import { formatMoney } from "../../utils/formaters";
import type { BillingType, Plan } from "./types";

interface PricingCardProps {
    plans: Plan[] | [];
    features: string[];
    onSubscribe: (plan: Plan, billing: BillingType) => void;
}

export default function PricingCards({ plans, features, onSubscribe }: PricingCardProps) {
    const [billing, setBilling] = useState<BillingType>("monthly");

    return (
        <div>
            {plans.length > 0 ? <div className="d-flex justify-content-center mb-4">
                <ButtonGroup>
                    <ToggleButton
                        id="monthly"
                        type="radio"
                        variant={billing === "monthly" ? "dark" : "outline-dark"}
                        checked={billing === "monthly"}
                        value="monthly"
                        onChange={() => setBilling("monthly")}
                    >
                        Mensal
                    </ToggleButton>

                    <ToggleButton
                        id="yearly"
                        type="radio"
                        variant={billing === "yearly" ? "dark" : "outline-dark"}
                        checked={billing === "yearly"}
                        value="yearly"
                        onChange={() => setBilling("yearly")}
                    >
                        Anual 🔥
                    </ToggleButton>
                </ButtonGroup>
            </div>
                :
                <Card className="page-container">
                    <Col xs={12}>
                        <Card className="border-0 shadow-sm rounded-4">
                            <Card.Body className="text-center py-5 text-muted">
                                Nenhum plano encontrado...
                            </Card.Body>
                        </Card>
                    </Col>
                </Card>}

            <Row className="d-flex justify-content-center">
                {plans.map((plan) => {
                    const yearlyMonthlyEquivalent = plan.yearlyPrice / 12;
                    const discount = Math.round(100 - (plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100);
                    return (
                        <Col key={plan.id} md={6} lg={4} className="mb-4 page-container">
                            <Card className="border-0 p-4 h-100 shadow-sm">
                                <h4 className="fw-bold mb-2">{plan.name}</h4>

                                <p className="text-muted mb-3">
                                    Acesso completo ao sistema
                                </p>

                                {billing === "monthly" ? (
                                    <h2 className="fw-bold">
                                        R$ {formatMoney(plan.monthlyPrice)}
                                        <small className="fs-6 text-muted"> / mês</small>
                                    </h2>
                                ) : (
                                    <>
                                        <h2 className="fw-bold">
                                            R$ {formatMoney(plan.yearlyPrice)}
                                            <small className="fs-6 text-muted"> / ano</small>
                                        </h2>

                                        <div className="text-success fw-semibold mb-2">
                                            💰 Economize {discount}%
                                        </div>

                                        <div className="text-muted small">
                                            R$ {formatMoney(yearlyMonthlyEquivalent)}{" "}/ mês
                                        </div>
                                    </>
                                )}

                                <div className="text-start my-4">
                                    {features.map((feature, index) => (
                                        <div key={index} className="mb-2">
                                            ✔ {feature}
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="w-100 submitButton"
                                    variant="success"
                                    size="lg"
                                    onClick={() => onSubscribe(plan, billing)}
                                >
                                    Assinar agora
                                </Button>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
}