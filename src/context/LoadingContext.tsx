import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { LoadingOverlay } from "../components/Loading"

interface LoadingContextType {
    startLoading: () => void
    endLoading: () => void
    isLoading: boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext)
    if (!context)
        throw new Error("useLoading deve ser usado dentro de um LoadingProvider")

    return context
}

interface LoadingProviderProps {
    children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
    const [isLoading, setIsLoading] = useState(false)

    const startLoading = useCallback(() => setIsLoading(true), [])
    const endLoading = useCallback(() => setIsLoading(false), [])

    const value = useMemo(() => ({
        startLoading,
        endLoading,
        isLoading
    }), [isLoading])
    return (
        <LoadingContext.Provider value={value}>
            <LoadingOverlay />
            {children}
        </LoadingContext.Provider>
    )
}