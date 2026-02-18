import { createContext, useContext, useState } from "react"
import loginService from "../modules/login/loginService"
import { toast } from "sonner"
import type { User } from "../modules/login/User"

type AuthProviderProps = {
    children: any
}

interface AuthContextType {
    user: User | null
    signIn: (email: string, password: string) => void
    signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth deve ser usado dentro de um AuthProvider")

    return context
}

export const AuthProvider = ({ children }: AuthProviderProps) => {

    const [user, setUser] = useState<User | null>(null);


    const signIn = async (email: string, password: string) => {
        console.log('email:', email)
        console.log('password:', password)
        let response = await loginService.login(email, password)
        if (response) {
            localStorage.setItem('token', '123456')
            setUser({ email: 't@t.com', password: '1' })
            window.location.href = '/dashboard'
        } else {
            toast.error('Usuário ou senha inválidos')
        }
    }

    const signOut = async () => {
        localStorage.removeItem('token')
        setUser(null)
        window.location.href = '/login'
    }

    const value: AuthContextType = {
        user,
        signIn,
        signOut
    };
    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>;
};
