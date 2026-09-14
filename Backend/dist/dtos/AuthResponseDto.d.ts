export interface UserPublicDto {
    id: number;
    username: string;
    email: string;
}
export interface AuthResponseDto {
    token: string;
    user: UserPublicDto;
    message?: string;
}
//# sourceMappingURL=AuthResponseDto.d.ts.map