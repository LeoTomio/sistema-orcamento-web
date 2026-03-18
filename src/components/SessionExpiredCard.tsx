import { Card, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import "../styles/session-expired.css";

export const SessionExpiredCard = () => {

    const { sessionExpired, closeSessionExpired } = useAuth();

    if (!sessionExpired) return null;

    return (
        <div className="session-expired-overlay">
            <Card className="session-expired-card">
                <Card.Body className="text-center">

                    <Card.Title className="mb-3">
                        Sessão expirada
                    </Card.Title>

                    <Card.Text className="mb-4">
                        Seu acesso expirou. Faça login novamente para continuar.
                    </Card.Text>

                    <Button onClick={closeSessionExpired}>
                        OK
                    </Button>

                </Card.Body>
            </Card>
        </div>
    );
};