import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { socket } from "../services/socket";
import planService from "../modules/plans/Service";

interface PaymentContextData {
    joinPaymentRoom: (subscriptionId: string) => void;
    startPolling: () => void;
    stopPolling: () => void;
    isPolling: boolean;
}

const PaymentContext = createContext({} as PaymentContextData);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [isPolling, setIsPolling] = useState(false);

    const joinPaymentRoom = useCallback((subscriptionId: string) => {
        socket.emit("join-payment", subscriptionId);
    }, []);

    const stopPolling = useCallback(() => {
        setIsPolling(false);
    }, []);

    const startPolling = useCallback(() => {
        setIsPolling(true);
    }, []);

    useEffect(() => {

        socket.auth = {
            token: localStorage.getItem("token"),
        };

        socket.connect();

        socket.on("connect", () => {
        });

        socket.on("connect_error", (err) => {
            console.log(err);
        });

        return () => {
            socket.disconnect();
        };

    }, []);

    useEffect(() => {
        const handlePaymentUpdate = async (data: any) => {
            const finalStatuses = [
                "ACTIVE",
                "SCHEDULED",
                "CANCELED",
                "REFUNDED",
                "REJECTED",
                "OVERDUE",
            ];

            if (data.status === "ACTIVE" || data.status === "SCHEDULED") {
                toast.success(data.message);
            }

            if (data.status === "CANCELED" || data.status === "REJECTED" || data.status === "OVERDUE") {
                toast.error(data.message);
            }

            if (data.status === "REFUNDED") {
                toast.warning(data.message);
            }

            if (finalStatuses.includes(data.status)) {
                await queryClient.refetchQueries({
                    queryKey: ["current-subscription"],
                });
                stopPolling();
            }
        };

        socket.on("payment-update", handlePaymentUpdate);

        return () => {
            socket.off("payment-update", handlePaymentUpdate);
        };

    }, [stopPolling, queryClient]);

    useQuery({
        queryKey: ["payment-polling"],
        queryFn: async () => {
            const response = await planService.getCurrentSubscription();
            if (response?.status === "ACTIVE" || response?.status === "SCHEDULED") {
                toast.success("Pagamento confirmado com sucesso!");
            } else if (
                response?.status === "CANCELED" || response?.status === "REJECTED" || response?.status === "OVERDUE") {
                toast.error("Pagamento cancelado!");
            } else if (response?.status === "REFUNDED") {
                toast.warning("Pagamento estornado!");
            }
            return response;
        },
        enabled: isPolling,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            const finalStatuses = [
                "ACTIVE",
                "SCHEDULED",
                "CANCELED",
                "REFUNDED",
                "REJECTED",
                "OVERDUE",
            ];

            if (finalStatuses.includes(status)) {
                stopPolling();
                return false;
            }
            return 5000;
        },
        refetchOnWindowFocus: true,
        staleTime: 0,
    });

    const value = useMemo(() => ({
        joinPaymentRoom, startPolling, stopPolling, isPolling,
    }),
        [joinPaymentRoom, startPolling, stopPolling, isPolling,]);

    return (
        <PaymentContext.Provider value={value}>
            {children}
        </PaymentContext.Provider>
    );
}

export function usePayment() {
    return useContext(PaymentContext);
}