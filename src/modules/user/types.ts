export interface User {
    id?: string;
    name: string;
    document: string;
    phone: string;
    email: string;
    password?: string;
    confirmPassword?: string
    address: string
    number: string
    city: string
    state: string
    postalCode: string
} 

export type UpdateUser = {
    document: string,
    postalCode: string,
    number: string,
    phone: string
}