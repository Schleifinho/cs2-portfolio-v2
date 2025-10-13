import {api} from "@/lib/api.ts";
import {DashBoard} from "@/types/DashBoard.ts";

export async function getDashBoardSummary(startDate: Date): Promise<DashBoard> {
    const res = await api.get<DashBoard>(`/dashboard/summary`, {
        params: { startDate: startDate.toISOString() },
    });
    return res.data;
}