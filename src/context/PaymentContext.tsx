import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import planService from "../modules/plans/Service";

interface PaymentContextData {
    startPolling: (subscriptionId: string) => void;
    stopPolling: () => void;
    isPolling: boolean;
}

const PaymentContext = createContext({} as PaymentContextData);
export function PaymentProvider({ children }: { children: React.ReactNode; }) {
    const queryClient = useQueryClient();
    const [isPolling, setIsPolling] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const pollingStartedAt = useRef<number | null>(null);

    const stopPolling = useCallback(() => {
        setIsPolling(false);
        setSubscriptionId(null);
        pollingStartedAt.current = null;
    }, []);

    const startPolling = useCallback((subscriptionId: string) => {
        setSubscriptionId(subscriptionId);
        pollingStartedAt.current = Date.now();
        setIsPolling(true);
    }, []);

    const paymentQuery = useQuery({
        queryKey: ["payment-polling", subscriptionId],
        queryFn: async () => {
            return await planService.getSubscriptionById(subscriptionId!);
        },
        enabled: isPolling && !!subscriptionId,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: false,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            const finalStatuses = ["ACTIVE", "SCHEDULED", "CANCELED", "REFUNDED", "REJECTED", "OVERDUE"];
            if (finalStatuses.includes(status)) {
                return false;
            }
            const startedAt = pollingStartedAt.current;
            if (!startedAt) {
                return false;
            }
            const elapsed = Date.now() - startedAt;
            const fiveMinutes = 5 * 60 * 1000;
            if (elapsed > fiveMinutes) {
                toast.warning("Tempo de verificação expirado");
                stopPolling();
                return false;
            }
            return 5000;
        },
    });

    useEffect(() => {
        const response = paymentQuery.data;
        if (!response) {
            return;
        }
        const finalStatuses = ["ACTIVE", "SCHEDULED", "CANCELED", "REFUNDED", "REJECTED", "OVERDUE"];

        if (!finalStatuses.includes(response.status)) {
            return;
        }

        if (response.status === "ACTIVE") {
            toast.success("Pagamento confirmado com sucesso!");
        }

        if (response.status === "SCHEDULED") {
            toast.success("Pagamento aprovado e agendado!");
        }

        if (response.status === "CANCELED" || response.status === "REJECTED" || response.status === "OVERDUE") {
            toast.error("Pagamento não foi aprovado");
        }

        if (response.status === "REFUNDED") {
            toast.warning("Pagamento estornado");
        }

        queryClient.invalidateQueries({
            queryKey: ["current-subscription"],
        });

        stopPolling();

    }, [paymentQuery.data, queryClient, stopPolling]);

    const value = useMemo(() => ({ startPolling, stopPolling, isPolling, }), [startPolling, stopPolling, isPolling]);

    return (
        <PaymentContext.Provider value={value}>
            {children}
        </PaymentContext.Provider>
    );
}

export function usePayment() {
    return useContext(PaymentContext);
}