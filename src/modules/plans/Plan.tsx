import { Card, Col, Row } from "react-bootstrap";
import { cacheTime } from "../../utils/enum";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SubscribeModal } from "./Modal";
import { PendingPaymentModal } from "./PendingPaymentModal";
import PricingCard from "./PricingCard";
import { RefundModal } from "./RefundModel";
import planService from "./Service";
import type { BillingType } from "./types";
import { toast } from "sonner";

function Plans() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [openSubscribeModal, setOpenSubscribeModal] = useState(false);
    const [refundSubscription, setRefundSubscription] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState({
        plan: {
            id: "",
            name: "",
            monthlyPrice: 0,
            yearlyPrice: 0,
        },
        billing: "monthly" as BillingType,
    });

    const { data: currentSubscription } = useQuery({
        queryKey: ["current-subscription", user?.id],
        queryFn: () => planService.getCurrentSubscription(),
        staleTime: cacheTime.fiveMinutes,
        refetchOnWindowFocus: false,
        enabled: !!user?.id,
    });

    const { data, isLoading } = useQuery({
        queryKey: ["plans"],
        queryFn: () => planService.getAll(),
        staleTime: cacheTime.fiveMinutes,
        refetchOnWindowFocus: false,
    });

    const plans = data || [];

    const { data: pendingSubscription, refetch: refetchPendingSubscription } = useQuery({
        queryKey: ["pending-subscription", user?.id],
        queryFn: () => planService.getPendingSubscription(),
        enabled: !!user?.id,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: 0,
    });

    const showPendingModal = !!pendingSubscription && pendingSubscription.isRecurring === false;

    useEffect(() => {
        const handlePageShow = async () => {
            if (!user?.id) return;
            await queryClient.invalidateQueries({ queryKey: ["pending-subscription"] });
            await refetchPendingSubscription();
        };
        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, [user?.id, queryClient, refetchPendingSubscription]);


    const location = useLocation();
    const expired = location.state?.expired || localStorage.getItem("showExpiredMessage") === "true";

    const cancelPendingMutation = useMutation({
        mutationFn: (id: string) =>
            planService.cancelPendingSubscription(id),

        onSuccess: async () => {
            toast.loading("Aguardando confirmação do cancelamento...");
            await refetchPendingSubscription();
        },
    });

    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col xs={12}>
                    <h2 className="mb-1">
                        Planos
                    </h2>

                    {expired && (
                        <Alert variant="warning" className="mt-3 rounded-4 text-center">
                            Seu plano expirou.
                            Escolha um plano para continuar utilizando o sistema.
                        </Alert>
                    )}
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
                        currentSubscription={currentSubscription}
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
                        onRefund={(subscription) => {
                            setRefundSubscription(subscription);
                        }}
                    />
                }
            </Row>
            {openSubscribeModal &&
                <SubscribeModal
                    show={openSubscribeModal}
                    selectedPlan={selectedPlan}
                    onHide={() => setOpenSubscribeModal(false)}
                />
            }
            {refundSubscription &&
                <RefundModal
                    show={!!refundSubscription}
                    subscription={refundSubscription}
                    onHide={() => setRefundSubscription(null)}
                />
            }
            {showPendingModal && pendingSubscription && (
                <PendingPaymentModal
                    show={showPendingModal}
                    loading={cancelPendingMutation.isPending}
                    invoiceUrl={pendingSubscription.invoiceUrl}
                    onCancel={() =>
                        cancelPendingMutation.mutate(
                            pendingSubscription.id
                        )
                    }
                />
            )}
        </>
    );
}

export default Plans;