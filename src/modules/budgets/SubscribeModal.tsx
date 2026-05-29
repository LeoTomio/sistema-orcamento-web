import { useEffect, useRef } from "react";
import { Button, Modal } from "react-bootstrap";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";

import { useLoading } from "../../context/LoadingContext";
import budgetService from "./Service";
import { useAuth } from "../../context/AuthContext";

interface SignatureModalProps {
    show: boolean
    budgetId: string
    onClose: () => void
}

export function SignatureModal({ show, onClose, budgetId }: SignatureModalProps) {

    const { endLoading, startLoading } = useLoading();
    const { user } = useAuth();

    const sigCanvas = useRef<SignatureCanvas | null>(null);

    useEffect(() => {
        if (show) {
            setTimeout(() => {
                generateSignature();
            }, 200);
        }
    }, [show]);

    const generateSignature = async () => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 465;
        tempCanvas.height = 120;

        const ctx = tempCanvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.fillStyle = "#000";
        ctx.font = '52px "Great Vibes"';
        ctx.textBaseline = "middle";
        ctx.fillText(user?.name || "", 20, 60);
        const image = tempCanvas.toDataURL("image/png");
        sigCanvas.current?.fromDataURL(image);
    };

    const handleClear = () => {
        sigCanvas.current?.clear();
    };

    const handleSave = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            toast.warning("Assine antes de salvar.");
            return;
        }

        try {
            startLoading();
            const base64 = sigCanvas.current
                .getCanvas()
                .toDataURL("image/png");
            await budgetService.updateSignature(budgetId, base64);
            toast.success("Assinatura salva com sucesso!");
            onClose();
        } finally {
            endLoading();
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
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
                            height: 120,
                            className: "signature-canvas border rounded w-100 bg-white",
                        }}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClear}>
                    Limpar
                </Button>
                <Button variant="outline-primary" onClick={generateSignature}>
                    Gerar automática
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Salvar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}