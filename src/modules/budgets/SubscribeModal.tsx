import { useRef } from "react";
import { Button, Modal } from "react-bootstrap";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";
import { useLoading } from "../../context/LoadingContext";
import budgetService from "./Service";

interface SignatureModalProps {
    show: boolean
    budgetId: string
    onClose: () => void
}

export function SignatureModal({ show, onClose, budgetId }: SignatureModalProps) {
    const { endLoading, startLoading } = useLoading()
    const sigCanvas = useRef<SignatureCanvas | null>(null);

    const handleClear = () => {
        sigCanvas.current?.clear();
    };

    const handleSave = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            toast.warning("Assine antes de salvar.");
            return;
        }
        try {
            startLoading()
            const base64 = sigCanvas.current
                .getCanvas()
                .toDataURL("image/png");


            await budgetService.updateSignature(budgetId, base64);
            toast.success("Assinatura salva com sucesso!");
            onClose();
        } catch (error) {
            alert("Erro ao salvar assinatura.");
        } finally {
            endLoading()
        }
    }
    return (
        <Modal
            show={show}
            onHide={() => onClose()}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Assinatura</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="subscribe-modal">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{
                            width: 465,
                            height: 100,
                            className: "signature-canvas",
                        }}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClear}>
                    Limpar
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Salvar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

