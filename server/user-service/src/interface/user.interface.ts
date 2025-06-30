export interface User {
    name: string;
    email: string;
    bio: string;
    gender: UserGender;
    preferences: string;
    number?: string;
}

export type UserGender = 'Male' | 'Female' | 'Other';
