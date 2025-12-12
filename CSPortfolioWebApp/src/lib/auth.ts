import {api} from "@/lib/api.ts";
import { UserRegisterDto, UserLoginDto, UserDto } from "@/types/Auth";

export const authApi = {
    register: async (data: UserRegisterDto) => {
        return api.post("/auth/register", data);
    },

    login: async (data: UserLoginDto) => {
        return api.post("/auth/login", data);
    },

    logout: async () => api.post("/auth/logout"),

    getCurrentUser: async (): Promise<UserDto> => {
        const response = await api.get<UserDto>("/user/profile");
        return response.data;
    },
};