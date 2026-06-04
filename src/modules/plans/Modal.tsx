import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { toast } from "sonner";
import RequiredLabel from "../../components/RequiredLabel";
import { useAuth } from "../../context/AuthContext";
import { usePayment } from "../../context/PaymentContext";
import { cacheTime } from "../../utils/enum";
import { formatBillingType, formatDocument } from "../../utils/formaters";
import { isValidCNPJ, isValidCPF, onlyNumbers } from "../../utils/validators";
import userService from "../user/Service";
import planService from "./Service";
import type { BillingType, PaymentType, Plan } from "./types";
import type { UpdateUser } from "../user/types";

interface SubscribeModalProps {
    onHide: () => void;
    selectedPlan: {
        plan: Plan;
        billing: BillingType;
    };
    show: boolean;
    currentSubscription?: any[];
}

export function SubscribeModal({ show, onHide, selectedPlan, currentSubscription }: SubscribeModalProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { startPolling, } = usePayment();
    const [document, setDocument] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [addressNumber, setAddressNumber] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [paymentType, setPaymentType] = useState<PaymentType>("PIX");
    const [isRecurring, setIsRecurring] = useState(false);
    const [step, setStep] = useState(1);
    const [cardData, setCardData] = useState({
        holderName: "",
        number: ["", "", "", ""],
        expiryMonth: "",
        expiryYear: "",
        ccv: "",
    });
    const hasRecurringSubscription = currentSubscription?.some((sub: any) =>
        sub.isRecurring &&
        ["ACTIVE", "SCHEDULED"].includes(sub.status)
    );

    const { data } = useQuery({
        queryKey: ["user", user?.id],
        queryFn: async () => {
            try {
                const response = await userService.getUser();
                return {
                    ...response,
                    document: response.document ? formatDocument(response.document) : '',
                };
            } catch (err) {
                throw err;
            }
        },
        staleTime: cacheTime.fiveMinutes,
        refetchOnWindowFocus: false,
        enabled: !!user?.id,
    });
    const needPostalCode = !data?.postalCode && isRecurring
    const needNumber = !data?.number && isRecurring
    const needPhone = !data?.phone

    useEffect(() => {
        if (show && data) {
            setDocument(data.document || "");
            setPostalCode(data.postalCode || "");
            setAddressNumber(data.number || "");
            setUserPhone(data.phone || "");
        }
    }, [show, data]);

    useEffect(() => {
        setCardData({
            holderName: "",
            number: ["", "", "", ""],
            expiryMonth: "",
            expiryYear: "",
            ccv: "",
        });
    }, [isRecurring])

    const subscribeMutation = useMutation({
        mutationFn: () =>
            planService.subscribe({
                planId: selectedPlan.plan.id,
                billing: selectedPlan.billing,
                paymentType,
                isRecurring,
                creditCard: isRecurring ? {
                    ...cardData,
                    number: cardData.number.join(""),
                } : undefined,
            }),
        onSuccess: async (response) => {
            startPolling(response.subscriptionId);

            onHide();
            if (!response.recurring) {
                window.location.assign(response.checkoutUrl);
                toast.info("Aguardando confirmação do pagamento...");
            } else {
                toast.success("Processando assinatura...");
            }
            localStorage.removeItem("subscriptionExpired");
            localStorage.removeItem("showExpiredMessage");
            await queryClient.invalidateQueries({
                queryKey: ["current-subscription"]
            });

        }
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ document, postalCode, number, phone }: UpdateUser) => userService.updateUserSubscriptionData(document, postalCode, number, phone),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", user?.id] });

            toast.success("Dados atualizados com sucesso!");
        }
    });

    const handleConfirm = async () => {
        if (!document) {
            toast.warning("CPF/CNPJ é obrigatório");
            return;
        }

        if (needPhone && !userPhone) {
            toast.warning("Telefone é obrigatório");
            return;
        }

        if (needPhone && onlyNumbers(userPhone).length < 10) {
            toast.warning("Telefone inválido");
            return;
        }

        if (needPostalCode && !postalCode) {
            toast.warning("CEP é obrigatório");
            return;
        }

        if (needNumber && !addressNumber) {
            toast.warning("Número é obrigatório");
            return;
        }

        if (isRecurring && (
            !cardData.holderName ||
            cardData.number.some(n => n.length !== 4) ||
            !cardData.expiryMonth ||
            !cardData.expiryYear ||
            !cardData.ccv)) {
            toast.warning("Preencha os dados do cartão");
            return;
        }

        try {
            const sanitizedDocument = onlyNumbers(document);
            const sanitizedPostalCode = onlyNumbers(postalCode);

            if (sanitizedDocument.length === 11 && !isValidCPF(document)) {
                toast.warning("CPF inválido");
                return;
            }

            if (sanitizedDocument.length === 14 && !isValidCNPJ(document)) {
                toast.warning("CNPJ inválido");
                return;
            }

            if (sanitizedDocument.length !== 11 && sanitizedDocument.length !== 14) {
                toast.warning("Documento deve ter 11 ou 14 dígitos");
                return;
            }

            const hasDocumentChanged = sanitizedDocument !== onlyNumbers(data?.document || "");
            const hasPostalCodeChanged = sanitizedPostalCode !== onlyNumbers(data?.postalCode || "");
            const hasNumberChanged = addressNumber !== (data?.number || "");
            const hasPhoneChanged = onlyNumbers(userPhone) !== onlyNumbers(data?.phone || "");

            if (hasDocumentChanged || hasPostalCodeChanged || hasNumberChanged || hasPhoneChanged) {
                await updateUserMutation.mutateAsync({
                    document: sanitizedDocument,
                    postalCode: sanitizedPostalCode,
                    number: addressNumber,
                    phone: userPhone
                });
            }

            await subscribeMutation.mutateAsync();

        } catch (err) {
            throw err;
        }
    };

    const steps = [
        { id: 1, label: "Pagamento" },
        { id: 2, label: "Dados" },
        ...(isRecurring ? [{ id: 3, label: "Cartão" }] : []),
        { id: isRecurring ? 4 : 3, label: "Resumo" }
    ];


    const lastStep = isRecurring ? 4 : 3;

    const nextStep = () => {
        setStep((prev) => Math.min(prev + 1, lastStep));
    };

    const previousStep = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };


    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Finalizar assinatura
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="d-flex justify-content-center align-items-center gap-4 py-3 border-bottom mb-4">
                    {steps.map((item, index) => (
                        <div
                            key={item.id}
                            className="d-flex align-items-center"
                        >
                            <div className="d-flex flex-column align-items-center">
                                <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center ${step >= item.id ? "bg-success text-white" : "bg-light border"}`}
                                    style={{ width: 40, height: 40 }}
                                >
                                    {item.id}
                                </div>

                                <small className="mt-1">
                                    {item.label}
                                </small>
                            </div>

                            {index < steps.length - 1 && (
                                <div
                                    style={{
                                        width: 40,
                                        height: 2,
                                        background: "#dee2e6",
                                        margin: "0 10px"
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
                {step === 1 && (
                    <>
                        <h6 className="mb-3">
                            Formas de Pagamento
                        </h6>
                        <Form.Group>
                            <div className="d-flex flex-column gap-2">

                                <Form.Check
                                    type="radio"
                                    id="pix-single"
                                    name="payment-method"
                                    label="PIX (pagamento único)"
                                    checked={
                                        paymentType === "PIX" &&
                                        !isRecurring
                                    }
                                    onChange={() => {
                                        setPaymentType("PIX");
                                        setIsRecurring(false);
                                    }}
                                />

                                <Form.Check
                                    type="radio"
                                    id="credit-single"
                                    name="payment-method"
                                    label="Cartão de crédito (pagamento único)"
                                    checked={
                                        paymentType === "CREDIT_CARD" &&
                                        !isRecurring
                                    }
                                    onChange={() => {
                                        setPaymentType("CREDIT_CARD");
                                        setIsRecurring(false);
                                    }}
                                />

                                <Form.Check
                                    type="radio"
                                    id="credit-recurring"
                                    name="payment-method"
                                    label="Cartão de crédito (recorrente)"
                                    checked={
                                        paymentType === "CREDIT_CARD" &&
                                        isRecurring
                                    }
                                    onChange={() => {
                                        setPaymentType("CREDIT_CARD");
                                        setIsRecurring(true);
                                    }}
                                />
                            </div>
                        </Form.Group>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h6 className="mb-3">
                            Dados Pessoais
                        </h6>
                        <Row>
                            <Col md={needPhone ? 6 : 12}>
                                <Form.Group className="mb-3">
                                    <RequiredLabel>
                                        CPF/CNPJ
                                    </RequiredLabel>

                                    <Form.Control
                                        value={document}
                                        placeholder="Digite seu CPF ou CNPJ"
                                        onChange={(e) =>
                                            setDocument(formatDocument(e.target.value))
                                        }
                                    />
                                </Form.Group>
                            </Col>

                            {needPhone && (
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <RequiredLabel>
                                            Telefone
                                        </RequiredLabel>

                                        <Form.Control
                                            value={userPhone}
                                            inputMode="numeric"
                                            placeholder="(47) 99999-9999"
                                            onChange={(e) => {
                                                const value = onlyNumbers(e.target.value).slice(0, 11);
                                                const formatted = value.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
                                                setUserPhone(formatted);
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            )}
                        </Row>

                        {(needPostalCode || needNumber) && (
                            <div>
                                <h6 className="mb-3">
                                    Informações de endereço
                                </h6>
                                <div className="d-flex gap-2">
                                    {needPostalCode && <Form.Group className="mb-3 w-100">
                                        <RequiredLabel>
                                            CEP
                                        </RequiredLabel>
                                        <Form.Control
                                            value={postalCode}
                                            inputMode="numeric"
                                            placeholder="00000-000"
                                            maxLength={9}
                                            onChange={(e) => {
                                                const numbers = onlyNumbers(e.target.value).slice(0, 8);
                                                const formatted = numbers.replace(/^(\d{5})(\d)/, "$1-$2");
                                                setPostalCode(formatted);
                                            }}
                                        />
                                    </Form.Group>}

                                    {needNumber && <Form.Group className="mb-3 w-100">
                                        <RequiredLabel>
                                            Número
                                        </RequiredLabel>
                                        <Form.Control
                                            value={addressNumber}
                                            inputMode="numeric"
                                            placeholder="123"
                                            onChange={(e) => {
                                                setAddressNumber(e.target.value.replace(/\D/g, ""));
                                            }}
                                        />
                                    </Form.Group>}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {isRecurring && step === 3 && (
                    <>
                        <h6 className="mb-3">
                            Dados do cartão
                        </h6>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Nome do titular
                            </Form.Label>
                            <Form.Control
                                autoComplete="cc-name"
                                placeholder="Nome do titular"
                                value={cardData.holderName}
                                onChange={(e) =>
                                    setCardData(prev => ({
                                        ...prev,
                                        holderName: e.target.value
                                    }))
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Número do cartão
                            </Form.Label>

                            <div className="d-flex gap-2">
                                {cardData.number.map((value, index) => (
                                    <Form.Control
                                        key={index}
                                        value={value}
                                        maxLength={4}
                                        inputMode="numeric"
                                        placeholder="0000"
                                        onChange={(e) => {
                                            const onlyDigits = e.target.value.replace(/\D/g, "");

                                            const updated = [...cardData.number];
                                            updated[index] = onlyDigits;

                                            setCardData(prev => ({
                                                ...prev,
                                                number: updated,
                                            }));

                                            if (onlyDigits.length === 4 && index < 3) {
                                                const next = window.document.getElementById(`card-number-${index + 1}`);
                                                (next as HTMLInputElement)?.focus();
                                            }
                                        }}
                                        id={`card-number-${index}`}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                        <div className="d-flex gap-2">
                            <Form.Group className="mb-3 w-100">
                                <Form.Label>
                                    Mês
                                </Form.Label>
                                <Form.Control
                                    value={cardData.expiryMonth}
                                    maxLength={2}
                                    inputMode="numeric"
                                    autoComplete="cc-exp-month"
                                    placeholder="MM"
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        if (!value) {
                                            setCardData(prev => ({
                                                ...prev,
                                                expiryMonth: ""
                                            }));
                                            return;
                                        }

                                        const numericValue = Number(value);
                                        if (numericValue >= 1 && numericValue <= 12) {
                                            setCardData(prev => ({
                                                ...prev,
                                                expiryMonth: value
                                            }));
                                        }
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 w-100">
                                <Form.Label>
                                    Ano
                                </Form.Label>

                                <Form.Control
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="YYYY"
                                    autoComplete="cc-exp-year"
                                    value={cardData.expiryYear}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");

                                        setCardData(prev => ({
                                            ...prev,
                                            expiryYear: value
                                        }));
                                    }}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3 w-100">
                                <Form.Label>
                                    CVV
                                </Form.Label>

                                <Form.Control
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="CVC"
                                    autoComplete="cc-csc"
                                    value={cardData.ccv}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");

                                        setCardData(prev => ({
                                            ...prev,
                                            ccv: value
                                        }));
                                    }}
                                />
                            </Form.Group>
                        </div>

                    </>
                )}

                {((!isRecurring && step === 3) || (isRecurring && step === 4)) && (
                    <>
                        <h6 className="mb-3">
                            Resumo da assinatura
                        </h6>

                        <div className="border rounded p-3">
                            <p>
                                <strong>Plano:</strong>{" "}
                                {selectedPlan.plan.name}
                            </p>

                            <p>
                                <strong>Cobrança:</strong>{" "}
                                {formatBillingType(selectedPlan.billing)}
                            </p>

                            <p>
                                <strong>Pagamento:</strong>{" "}
                                {isRecurring ? "Cartão recorrente" : paymentType === "PIX" ? "PIX" : "Cartão"}
                            </p>

                            <p className="mb-0">
                                <strong>Documento:</strong>{" "}
                                {document}
                            </p>
                        </div>
                        <div className="mt-3">
                            <div className="d-flex align-items-start gap-2">
                                <div style={{ fontSize: 20 }}>
                                    🔒
                                </div>
                                <div>
                                    <div className="fw-semibold">
                                        Ambiente seguro de pagamento
                                    </div>
                                    <small className="text-muted">
                                        {isRecurring ? "Seu pagamento será processado de forma segura." : "Você será redirecionado para um ambiente seguro de pagamento."}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                {step > 1 && (
                    <Button variant="outline-secondary" onClick={previousStep} >
                        Voltar
                    </Button>
                )}
                {step < lastStep ? (
                    <Button variant="success" onClick={nextStep} >
                        Próximo
                    </Button>
                ) : (
                    <Button variant="success" onClick={handleConfirm}
                        disabled={subscribeMutation.isPending || hasRecurringSubscription}
                    >
                        {isRecurring ? "Confirmar assinatura" : "Continuar para pagamento"}
                    </Button>
                )}
            </Modal.Footer>
        </Modal >
    );
}