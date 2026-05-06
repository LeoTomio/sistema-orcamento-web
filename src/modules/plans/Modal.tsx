import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { cacheTime } from "../../utils/enum";
import userService from "../user/Service";
import planService from "./Service";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "sonner";
import type { BillingType, CreditCard, PaymentType, Plan } from "./types";
import RequiredLabel from "../../components/RequiredLabel";
import { formatDocument } from "../../utils/formaters";
import { isValidCNPJ, isValidCPF, onlyNumbers } from "../../utils/validators";


interface SubscribeModalProps {
    onHide: () => void;
    selectedPlan: {
        plan: Plan;
        billing: BillingType;
    };
    show: boolean;
}

export function SubscribeModal({ show, onHide, selectedPlan }: SubscribeModalProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient()

    const [document, setDocument] = useState("");
    const [paymentType, setPaymentType] = useState<PaymentType>("PIX");

    const [card, setCard] = useState<CreditCard>({
        holderName: "",
        number: "",
        expiryMonth: "",
        expiryYear: "",
        ccv: "",
    });


    const { data, isLoading } = useQuery({
        queryKey: ["user", user?.id],
        queryFn: async () => {
            try {
                const response = await userService.getUser()
                return {
                    ...response,
                    document: formatDocument(response.document),
                };
            } catch (err) {
                toast.error("Erro ao carregar usuário");
                throw err;
            }
        },
        staleTime: cacheTime.fiveMinutes,
        refetchOnWindowFocus: false,
        enabled: !!user?.id,
    })

    useEffect(() => {
        if (show && data?.document) {
            setDocument(data.document);
        }
    }, [show, data]);

    const subscribeMutation = useMutation({
        mutationFn: (creditCardToken?: string) =>
            planService.subscribe({
                planId: selectedPlan.plan.id,
                billing: selectedPlan.billing,
                paymentType,
                creditCardToken: creditCardToken
            }),
        onSuccess: () => {
            toast.success("Assinatura iniciada com sucesso!");
            onHide();
        },
        onError: () => {
            toast.error("Erro ao iniciar assinatura");
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: (document: string) => userService.updateDocument(document),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
            toast.success("Documento atualizado com sucesso!");
        }

    });
    const handleConfirm = async () => {
        if (!document) {
            toast.warning("CPF/CNPJ é obrigatório");
            return;
        }

        try {
            if (document !== data?.document) {
                const numbers = onlyNumbers(document);

                if (numbers.length === 11 && !isValidCPF(document)) {
                    toast.warning("CPF inválido");
                    return;
                }

                if (numbers.length === 14 && !isValidCNPJ(document)) {
                    toast.warning("CNPJ inválido");
                    return;
                }

                if (numbers.length !== 11 && numbers.length !== 14) {
                    toast.warning("Documento deve ter 11 ou 14 dígitos");
                    return;
                }
                await updateUserMutation.mutateAsync(numbers);
            }

            let creditCardToken = "";

            if (paymentType == "CREDIT_CARD") {
                creditCardToken = await planService.generateCardToken(card);
            }

            await subscribeMutation.mutateAsync({
                creditCardToken,
            });

        } catch (err) {
            toast.error("Erro ao processar assinatura");
        }
    };


    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Finalizar assinatura</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {isLoading ? (
                    <div className="text-center">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <Form.Group className="mb-3">
                            <RequiredLabel>CPF/CNPJ</RequiredLabel>
                            <Form.Control
                                value={document}
                                onChange={(e) => setDocument(formatDocument(e.target.value))}
                                placeholder="Digite seu CPF ou CNPJ"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Forma de pagamento</Form.Label>

                            <Form.Check
                                type="radio"
                                label="PIX"
                                checked={paymentType === "PIX"}
                                onChange={() => setPaymentType("PIX")}
                            />

                            <Form.Check
                                type="radio"
                                label="Cartão de crédito"
                                checked={paymentType === "CREDIT_CARD"}
                                onChange={() => setPaymentType("CREDIT_CARD")}
                            />
                        </Form.Group>

                        {paymentType === "CREDIT_CARD" && (
                            <>
                                <Form.Group className="mb-2">
                                    <Form.Label>Nome no cartão</Form.Label>
                                    <Form.Control
                                        value={card.holderName}
                                        onChange={(e) => setCard({ ...card, holderName: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Número do cartão</Form.Label>
                                    <Form.Control
                                        value={card.number}
                                        onChange={(e) => setCard({ ...card, number: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label>Validade (MM/AA)</Form.Label>
                                    <div className="d-flex gap-2">
                                        <Form.Control
                                            placeholder="MM"
                                            value={card.expiryMonth}
                                            onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })}
                                        />
                                        <Form.Control
                                            placeholder="AA"
                                            value={card.expiryYear}
                                            onChange={(e) => setCard({ ...card, expiryYear: e.target.value })}
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>CVV</Form.Label>
                                    <Form.Control
                                        value={card.ccv}
                                        onChange={(e) => setCard({ ...card, ccv: e.target.value })}
                                    />
                                </Form.Group>
                            </>
                        )}
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancelar
                </Button>

                <Button
                    variant="success"
                    onClick={handleConfirm}
                    disabled={subscribeMutation.isPending}
                >
                    {subscribeMutation.isPending ? "Processando..." : "Confirmar assinatura"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}