import { api } from "../../services/api";
import type { DashBoard } from "./types";

const dashboardService = {

    async getAll(): Promise<DashBoard> {
        const response = await api.get("/dashboard");
        return response.data;
    },
};

export default dashboardService;