export interface Plan {
    id: string;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    trialDays?: number
}

export type BillingType = "monthly" | "yearly";

export type PaymentType = "PIX" | "CREDIT_CARD";

export type SubscribeRequest = {
    planId: string;
    billing: BillingType;
    paymentType: PaymentType;
    isRecurring: boolean
    creditCard: any
};

export type CreditCard = {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
}