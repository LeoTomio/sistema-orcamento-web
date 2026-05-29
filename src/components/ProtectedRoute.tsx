import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
    children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
    const { user, subscriptionExpired, loadingAuth } = useAuth();
    const location = useLocation();

    if (loadingAuth) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (subscriptionExpired && location.pathname !== "/planos") {
        return (
            <Navigate
                to="/planos"
                replace
                state={{
                    expired: true,
                }}
            />
        );
    }

    return children;
}