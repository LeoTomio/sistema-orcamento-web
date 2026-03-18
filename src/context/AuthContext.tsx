import { createContext, useContext, useEffect, useState } from "react"
import loginService from "../modules/login/loginService"
import { toast } from "sonner"
import type { Login } from "../modules/login/types"
import { useNavigate } from "react-router-dom"

type AuthProviderProps = {
    children: any
}

interface AuthContextType {
    user: Login | null
    sessionExpired: boolean
    signIn: (email: string, password: string) => void
    signOut: () => void
    closeSessionExpired: () => void
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
    const [user, setUser] = useState<Login | null>(null);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const handleSessionExpired = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setSessionExpired(true);

            navigate('/login')
        };

        window.addEventListener("session-expired", handleSessionExpired);

        return () => {
            window.removeEventListener("session-expired", handleSessionExpired);
        };

    }, [navigate]);

    const signIn = async (email: string, password: string) => {
        const { accessToken, user } = await loginService.login(email, password)
        if (accessToken) {
            localStorage.setItem("token", accessToken);
            localStorage.setItem("user", JSON.stringify(user));
            setUser(user);
            navigate('/dashboard')
        } else {
            toast.error('Usuário ou senha inválidos')
        }
    }

    const signOut = async () => {
        localStorage.removeItem('token')
        localStorage.removeItem("user");
        setUser(null)
        navigate('/login')
    }

    const value: AuthContextType = {
        user,
        sessionExpired,
        closeSessionExpired: () => setSessionExpired(false),
        signIn,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};