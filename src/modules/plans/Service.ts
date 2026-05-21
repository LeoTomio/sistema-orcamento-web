import { api } from "../../services/api";
import type { Plan, SubscribeRequest } from "./types";

const planService = {

    async getAll(): Promise<Plan[]> {
        const response = await api.get("/plan");
        return response.data;
    },
    async getCurrentSubscription() {
        const response = await api.get("subscription");
        console.log(response.data)
        return response.data;
    },



    async subscribe(subscription: SubscribeRequest) {
        const response = await api.post("subscription/subscribe", subscription);
        return response.data;
    },

    async refund(subscriptionId: string) {
        console.log('id', subscriptionId)
        return await api.post(`/subscription/${subscriptionId}/refund`);
    },

    async refundPreview(subscriptionId: string) {
        const response = await api.get(`/subscription/${subscriptionId}/refund-preview`);
        return response.data
    }
};

export default planService;