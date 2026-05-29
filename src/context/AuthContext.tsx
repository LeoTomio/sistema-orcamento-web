import { useQueryClient } from "@tanstack/react-query"
import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import loginService from "../modules/login/Service"
import type { Login } from "../modules/login/types"

type AuthProviderProps = {
    children: any
}

interface AuthContextType {
    user: Login | null
    sessionExpired: boolean
    signIn: (email: string, password: string) => void
    signOut: () => void
    closeSessionExpired: () => void
    subscriptionExpired: boolean
    loadingAuth: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth deve ser usado dentro de um AuthProvider")

    return context
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient();
    const [user, setUser] = useState<Login | null>(null);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [subscriptionExpired, setSubscriptionExpired] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedSubscriptionExpired = localStorage.getItem("subscriptionExpired");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (storedSubscriptionExpired) {
            setSubscriptionExpired(JSON.parse(storedSubscriptionExpired));
        }

        setLoadingAuth(false);

        const handleSessionExpired = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("subscriptionExpired");

            setUser(null);
            setSessionExpired(true);
            setSubscriptionExpired(false);

            navigate('/login');
        };

        const handleSubscriptionExpired = () => {
            localStorage.setItem("subscriptionExpired", "true");
            localStorage.setItem("showExpiredMessage", "true");

            setSubscriptionExpired(true);

            navigate('/planos', {
                state: {
                    expired: true
                }
            });
        };

        window.addEventListener("session-expired", handleSessionExpired);
        window.addEventListener("subscription-expired", handleSubscriptionExpired);

        return () => {
            window.removeEventListener("session-expired", handleSessionExpired);
            window.removeEventListener("subscription-expired", handleSubscriptionExpired);
        };
    }, [navigate]);

    const signIn = async (email: string, password: string) => {
        const { accessToken, user, hasValidSubscription } = await loginService.login(email, password);

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("subscriptionExpired", JSON.stringify(!hasValidSubscription));

        if (!hasValidSubscription) {
            localStorage.setItem("showExpiredMessage", "true");
        } else {
            localStorage.removeItem("showExpiredMessage");
        }

        setUser(user);
        setSubscriptionExpired(!hasValidSubscription);

        if (!hasValidSubscription) {
            navigate("/planos", {
                state: {
                    expired: true,
                },
            });
            return;
        }

        navigate("/dashboard");
    }

    const signOut = async () => {
        queryClient.clear()

        localStorage.removeItem('token')
        localStorage.removeItem("user");
        localStorage.removeItem("subscriptionExpired");
        localStorage.removeItem("showExpiredMessage");
        setUser(null)
        setSubscriptionExpired(false)

        navigate('/login')
    }


    const value: AuthContextType = {
        user,
        sessionExpired,
        closeSessionExpired: () => setSessionExpired(false),
        signIn,
        signOut,
        subscriptionExpired,
        loadingAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};