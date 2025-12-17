import {api} from "@/lib/api.ts";
import {UserRegisterDto, UserLoginDto, UserDto, ChangePasswordRequestDto} from "@/types/Auth";

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

    uploadAvatar: async (formData: FormData) => {
        const { data } = await api.post("/user/avatar", formData, {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return data;
    },
    changePassword: async (data: ChangePasswordRequestDto) => {
        await api.post("/user/change-password", data);
    },
};