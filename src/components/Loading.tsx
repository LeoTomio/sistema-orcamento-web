import { Spinner, Card } from "react-bootstrap";
import { useLoading } from "../context/LoadingContext";
import "../styles/loading.css"

export const LoadingOverlay = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="loading-card">
            <Card style={{ minWidth: "200px", borderRadius: "12px" }}>
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                    <Spinner animation="border" role="status" className="mb-3" />
                    <div>Carregando...</div>
                </Card.Body>
            </Card>
        </div>
    );
};