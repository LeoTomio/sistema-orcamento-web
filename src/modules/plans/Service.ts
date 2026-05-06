import { api } from "../../services/api";
import type { CreditCard, Plan, SubscribeRequest } from "./types";

const planService = {

    async getAll(): Promise<Plan[]> {
        const response = await api.get("/plan");
        return response.data;
    },


    
    async subscribe(subscription: SubscribeRequest) {
        const response = await api.post("/subscribe", subscription);
        return response.data;
    },

    async generateCardToken(card: CreditCard) {
        const response = await fetch("https://sandbox.asaas.com/api/v3/creditCard/tokenize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                access_token: import.meta.env.VITE_ASAAS_API_KEY, // cuidado aqui
            },
            body: JSON.stringify({
                creditCard: {
                    holderName: card.holderName,
                    number: card.number,
                    expiryMonth: card.expiryMonth,
                    expiryYear: card.expiryYear,
                    ccv: card.ccv,
                },
            }),
        });

        const data = await response.json();
        return data.creditCardToken;
    }

};

export default planService;