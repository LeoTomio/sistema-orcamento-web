import { useState } from "react";
import { Button, ButtonGroup, Card, Col, Row, ToggleButton } from "react-bootstrap";
import { formatMoney } from "../../utils/formaters";
import type { BillingType, Plan } from "./types";

interface PricingCardProps {
    plans: Plan[] | [];
    features: string[];
    currentSubscription?: any;
    onSubscribe: (plan: Plan, billing: BillingType) => void;
    onRefund: (subscription: any) => void;
}

export default function PricingCards({ plans, features, onSubscribe, currentSubscription, onRefund }: PricingCardProps) {
    const [billing, setBilling] = useState<BillingType>("monthly");
    const formatDate = (date?: string | Date | null) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("pt-BR");
    };

    const getRemainingDays = (date?: string | Date | null) => {
        if (!date) return 0;

        const end = new Date(date).getTime();
        const now = new Date().getTime();

        return Math.max(Math.ceil((end - now) / (1000 * 60 * 60 * 24)), 0);
    };

    return (
        <div>
            {plans.length > 0 ? (
                <div className="d-flex justify-content-center mb-4">
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
                            Anual
                        </ToggleButton>
                    </ButtonGroup>
                </div>
            ) : (
                <Card className="page-container">
                    <Col xs={12}>
                        <Card className="border-0 shadow-sm rounded-4">
                            <Card.Body className="text-center py-5 text-muted">
                                Nenhum plano encontrado...
                            </Card.Body>
                        </Card>
                    </Col>
                </Card>
            )}

            <Row className="d-flex justify-content-center">
                {plans.map((plan) => {
                    const isTrialPlan = plan.name.includes("Trial") || (plan.trialDays ?? 0) > 0;

                    const activeSubscription = currentSubscription?.find((sub: any) =>
                        sub.planId === plan.id &&
                        ["ACTIVE", "TRIAL"].includes(sub.status) &&
                        (isTrialPlan ? true : sub.billing === billing)
                    );

                    const scheduledSubscription = currentSubscription?.find((sub: any) =>
                        sub.planId === plan.id &&
                        sub.status === "SCHEDULED" &&
                        sub.billing === billing
                    );

                    const isCurrentPlan = !!activeSubscription;
                    const isScheduledPlan = !!scheduledSubscription;

                    const remainingDays = getRemainingDays(activeSubscription?.endDate);

                    const hasRecurringSubscription = currentSubscription?.some((sub: any) =>
                        sub.isRecurring && ["ACTIVE", "SCHEDULED"].includes(sub.status)
                    );

                    const canSubscribe = !hasRecurringSubscription || (hasRecurringSubscription && (isCurrentPlan || isScheduledPlan));
                    const yearlyMonthlyEquivalent = Number(plan.yearlyPrice) / 12;
                    const canRefund = isCurrentPlan && billing === "yearly";
                    const discount = Math.round(100 - (Number(plan.yearlyPrice) / (Number(plan.monthlyPrice) * 12)) * 100);

                    if (isTrialPlan && !isCurrentPlan) {
                        return null;
                    }

                    return (
                        <Col key={plan.id} md={6} lg={4} className="mb-4 page-container">
                            <Card
                                className={`border-0 p-4 h-100 shadow-sm position-relative d-flex flex-column ${isTrialPlan ? "border border-info"
                                    : isCurrentPlan && isScheduledPlan ? "plan-both" : isCurrentPlan ? "plan-active" : isScheduledPlan ? "plan-scheduled" : ""}`}
                            >
                                <div className="flex-grow-1">
                                    <div className="d-flex gap-2 mb-2 flex-wrap">

                                        {isCurrentPlan && (
                                            <span className="badge bg-success">
                                                Plano Atual
                                            </span>
                                        )}

                                        {isScheduledPlan && (
                                            <span className="badge bg-warning text-dark">
                                                Agendado
                                            </span>
                                        )}

                                        {isTrialPlan && (
                                            <span className="badge bg-info text-dark">
                                                Gratuito
                                            </span>
                                        )}

                                    </div>

                                    <h4 className="fw-bold mb-2">
                                        {plan.name}
                                    </h4>

                                    <p className="text-muted mb-3">
                                        Acesso completo ao sistema
                                    </p>

                                    {billing === "monthly" || isTrialPlan ? (
                                        <h2 className="fw-bold">
                                            R$ {formatMoney(plan.monthlyPrice)}
                                            <small className="fs-6 text-muted">
                                                {" "} / mês
                                            </small>
                                        </h2>
                                    ) : (
                                        <>
                                            <h2 className="fw-bold">
                                                R$ {formatMoney(plan.yearlyPrice)}
                                                <small className="fs-6 text-muted">
                                                    {" "} / ano
                                                </small>
                                            </h2>

                                            {discount > 0 && (
                                                <div className="text-success fw-semibold mb-2">
                                                    💰 Economize {discount}%
                                                </div>
                                            )}

                                            <div className="text-muted small">
                                                R$ {formatMoney(yearlyMonthlyEquivalent)} / mês
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

                                    <div style={{ minHeight: 70 }}>
                                        {isCurrentPlan && isTrialPlan && (
                                            <div className={`small fw-semibold mb-3 ${remainingDays <= 2 ? "text-danger" : remainingDays <= 5
                                                ? "text-warning" : "text-info"}`}>
                                                Seu período gratuito expira em{" "}
                                                {remainingDays} dia{remainingDays !== 1 ? "s" : ""}
                                                <br />
                                                Expira em {formatDate(activeSubscription?.endDate)}
                                            </div>
                                        )}

                                        {isCurrentPlan && !isTrialPlan && (
                                            <div className="text-success small fw-semibold mb-3">
                                                Seu plano atual

                                                {activeSubscription?.isRecurring &&
                                                    activeSubscription?.endDate && (
                                                        <>
                                                            <br />
                                                            Renovar em {formatDate(activeSubscription.endDate)}
                                                        </>
                                                    )
                                                }

                                                {!activeSubscription?.isRecurring &&
                                                    activeSubscription?.endDate && (
                                                        <>
                                                            <br />
                                                            Expira em {formatDate(activeSubscription.endDate)}
                                                        </>
                                                    )
                                                }
                                            </div>
                                        )}

                                    </div>

                                </div>

                                {!isTrialPlan && (
                                    <Button
                                        className="w-100 submitButton mt-2"
                                        variant={
                                            !canSubscribe ? "secondary" : isCurrentPlan && isScheduledPlan ? "primary"
                                                : isCurrentPlan ? "success" : isScheduledPlan ? "warning" : "success"
                                        }
                                        size="lg"
                                        disabled={!canSubscribe}
                                        onClick={() => onSubscribe(plan, billing)}
                                    >
                                        {!canSubscribe ? "Assinatura recorrente ativa" : isCurrentPlan && isScheduledPlan ? "Estender Plano"
                                            : isCurrentPlan ? "Estender Assinatura" : isScheduledPlan ? "Adicionar Mais Tempo" : "Assinar agora"
                                        }
                                    </Button>
                                )}

                                {canRefund && !isTrialPlan && (
                                    <Button
                                        variant="outline-danger"
                                        className="w-100 mt-2"
                                        onClick={() => onRefund(activeSubscription)}
                                    >
                                        Estornar
                                    </Button>
                                )}

                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
}