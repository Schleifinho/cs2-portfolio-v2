export interface UserRegisterDto {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface UserLoginDto {
    username: string;
    password: string;
}

// Optional: user returned from backend
export interface UserDto {
    username: string;
    email: string;
    profileImageUrl: string;
    roles: string[];
    confirmedEmail: boolean;
}

export interface ChangePasswordRequestDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}