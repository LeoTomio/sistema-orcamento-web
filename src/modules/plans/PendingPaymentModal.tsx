import { Button, Modal } from "react-bootstrap";

interface PendingPaymentModalProps {
    show: boolean;
    invoiceUrl: string;
    loading: boolean
    onCancel: () => void;
}

export function PendingPaymentModal({ show, invoiceUrl, loading, onCancel }: PendingPaymentModalProps) {
    return (
        <Modal show={show} centered backdrop="static" keyboard={false}>
            <Modal.Header>
                <Modal.Title>
                    Pagamento pendente
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                Você possui um pagamento de assinatura pendente.

                <br />
                <br />

                Deseja continuar o pagamento ou cancelar esta assinatura?
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="danger"
                    onClick={onCancel}
                    disabled={loading}
                >
                    {loading ? "Cancelando..." : "Cancelar cobrança"}
                </Button>

                <Button
                    variant="success"
                    disabled={!invoiceUrl}
                    onClick={() => {
                        if (!invoiceUrl) return;
                        window.location.assign(invoiceUrl);
                    }}
                >
                    Continuar pagamento
                </Button>
            </Modal.Footer>
        </Modal>
    );
}