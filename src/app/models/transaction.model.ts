export type TransactionType = 'Deposit' | 'Withdrawal';

export interface Transaction {
    id: string;
    accountId: string;
    date: string;
    transactionId: string;
    transactionType: TransactionType;
    amount: number;
    description: string;
    balance: number;
}