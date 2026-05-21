import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "react-bootstrap";
import { toast } from "sonner";
import planService from "./Service";
import { useAuth } from "../../context/AuthContext";

interface RefundModalProps {
    show: boolean;
    onHide: () => void;
    subscription: any;
}

export function RefundModal({ show, onHide, subscription }: RefundModalProps) {
    const queryClient = useQueryClient();
    const { user } = useAuth()
    const refundMutation = useMutation({
        mutationFn: () => planService.refund(subscription.id),
        onSuccess: () => {
            toast.success("Solicitação de estorno enviada");
            onHide();;

            queryClient.invalidateQueries({
                queryKey: ["current-subscription"]
            });

            onHide();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Erro ao solicitar estorno");
        },
    });

    const { data, isLoading } = useQuery({
        queryKey: ["refund-preview", subscription.id, user?.id],
        queryFn: async () => await planService.refundPreview(subscription.id),
        enabled: !!subscription?.id && !!user?.id,
    });
    console.log('data', data)
    const formatDate = (date?: string | Date | null) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("pt-BR");
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Solicitar estorno
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>

                {isLoading ? (
                    <div className="text-center">
                        Carregando...
                    </div>
                ) : (
                    <>

                        <div className="alert alert-warning">
                            O mês atual da assinatura já foi consumido.
                        </div>

                        <p className="mb-2">
                            O valor do estorno será calculado apenas do próximo ciclo mensal até o fim do plano anual.
                        </p>

                        <div className="border rounded p-3 bg-light">

                            <div className="mb-2">
                                <strong>Plano:</strong>{" "}
                                {subscription.plan?.name}
                            </div>

                            <div className="mb-2">
                                <strong>Vigência:</strong>{" "}
                                {formatDate(subscription.startDate)}
                                {" até "}
                                {formatDate(subscription.endDate)}
                            </div>

                            <div className="mb-2">
                                <strong>
                                    Acesso permanecerá até:
                                </strong>{" "}
                                {formatDate(data?.refundEndsAt)}
                            </div>

                            <div>
                                <strong>
                                    Valor estimado do estorno:
                                </strong>{" "}
                                {data?.refundAmount ? `R$ ${data.refundAmount.toFixed(2)}` : "R$ 0,00"}
                            </div>

                        </div>

                    </>
                )}

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancelar
                </Button>

                <Button
                    variant="danger"
                    onClick={() => refundMutation.mutate()}
                    disabled={refundMutation.isPending}
                >
                    {refundMutation.isPending ? "Processando..." : "Confirmar estorno"}
                </Button>

            </Modal.Footer>
        </Modal>
    );
}