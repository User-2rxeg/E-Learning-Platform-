import { UserRole } from '../../Database/User'; // Adjust path as needed

export interface JwtPayload {
    sub: string; // user._id
    email: string;
    role: UserRole;
}
