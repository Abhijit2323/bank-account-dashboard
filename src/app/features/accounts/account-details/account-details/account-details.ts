import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { switchMap } from 'rxjs';

import { AccountService } from '../../../../core/services/account.service';
import { TransactionService } from '../../../../core/services/transaction.service';

import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

import { Account } from '../../../../models/account.model';

import {
  Transaction,
  TransactionType
} from '../../../../models/transaction.model';


@Component({
  selector: 'app-account-details',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinner
  ],

  templateUrl: './account-details.html',

  styleUrl: './account-details.scss'
})


export class AccountDetails implements OnInit {

  private accountService =
    inject(AccountService);

  private transactionService =
    inject(TransactionService);

  private route =
    inject(ActivatedRoute);

  private router =
    inject(Router);

  private fb =
    inject(FormBuilder);


  account: Account | null = null;

  transactions: Transaction[] = [];


  loading = true;

  transactionLoading = false;

  transactionSubmitting = false;


  errorMessage = '';

  transactionError = '';

  transactionSuccessMessage = '';


  accountId = '';


  transactionForm =
    this.fb.nonNullable.group({

      transactionType: [
        'Deposit' as TransactionType,
        Validators.required
      ],

      amount: [
        0,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200)
        ]
      ]

    });


  ngOnInit(): void {

    this.accountId =
      this.route.snapshot.paramMap.get('id') ?? '';


    if (!this.accountId) {

      this.errorMessage =
        'Invalid account ID.';

      this.loading = false;

      return;
    }


    this.loadAccount();

    this.loadTransactions();
  }


  loadAccount(): void {

    this.loading = true;

    this.errorMessage = '';


    this.accountService
      .getAccountById(this.accountId)

      .subscribe({

        next: (account) => {

          this.account = account;

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Error loading account:',
            error
          );

          this.loading = false;

          this.errorMessage =
            'Unable to load account details.';
        }

      });
  }


  loadTransactions(): void {

    this.transactionLoading = true;

    this.transactionError = '';


    this.transactionService
      .getTransactions(this.accountId)

      .subscribe({

        next: (transactions) => {

          this.transactions =
            transactions.sort(
              (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime()
            );

          this.transactionLoading = false;
        },

        error: (error) => {

          console.error(
            'Error loading transactions:',
            error
          );

          this.transactionLoading = false;

          this.transactionError =
            'Unable to load transaction history.';
        }

      });
  }


  submitTransaction(): void {

    this.transactionError = '';

    this.transactionSuccessMessage = '';


    if (
      this.transactionForm.invalid
    ) {

      this.transactionForm.markAllAsTouched();

      return;
    }


    if (!this.account) {

      this.transactionError =
        'Account details are not available.';

      return;
    }


    if (
      this.account.status !== 'Active'
    ) {

      this.transactionError =
        'Inactive accounts cannot perform transactions.';

      return;
    }


    const formValue =
      this.transactionForm.getRawValue();


    const transactionType =
      formValue.transactionType;

    const amount =
      Number(formValue.amount);


    if (amount <= 0) {

      this.transactionError =
        'Transaction amount must be greater than zero.';

      return;
    }


    const currentBalance =
      Number(this.account.balance);


    if (
      transactionType === 'Withdrawal' &&
      amount > currentBalance
    ) {

      this.transactionError =
        'Withdrawal amount cannot be greater than the available balance.';

      return;
    }


    const newBalance =
      transactionType === 'Deposit'
        ? currentBalance + amount
        : currentBalance - amount;


    const transaction: Transaction = {

      id:
        Date.now().toString(),

      accountId:
        this.account.id,

      date:
        new Date().toISOString(),

      transactionId:
        `TXN-${Date.now()}`,

      transactionType:
        transactionType,

      amount:
        amount,

      description:
        formValue.description.trim(),

      balance:
        newBalance

    };


    this.transactionSubmitting = true;


    this.transactionService
      .updateAccountBalance(
        this.account.id,
        newBalance
      )

      .pipe(
        switchMap(() =>
          this.transactionService
            .createTransaction(transaction)
        )
      )

      .subscribe({

        next: () => {

          this.account = {
            ...this.account!,
            balance: newBalance
          };


          this.transactionSubmitting = false;


          this.transactionSuccessMessage =
            `${transactionType} of ₹${amount.toLocaleString('en-IN')} completed successfully.`;


          this.transactionForm.reset({

            transactionType:
              'Deposit',

            amount:
              0,

            description:
              ''

          });


          this.loadTransactions();


          setTimeout(() => {

            this.transactionSuccessMessage =
              '';

          }, 3000);

        },


        error: (error) => {

          console.error(
            'Transaction error:',
            error
          );

          this.transactionSubmitting = false;

          this.transactionError =
            'Unable to complete the transaction. Please try again.';
        }

      });
  }


  retryAccount(): void {

    this.loadAccount();
  }


  retryTransactions(): void {

    this.loadTransactions();
  }


  editAccount(): void {

    if (!this.account) {

      return;
    }


    this.router.navigate([
      '/accounts',
      this.account.id,
      'edit'
    ]);
  }


  hasTransactionError(
    fieldName:
      keyof typeof this.transactionForm.controls,

    errorName: string

  ): boolean {

    const control =
      this.transactionForm.controls[
      fieldName
      ];


    return (
      control.touched &&
      control.hasError(errorName)
    );
  }


  getTransactionTypeClass(
    transaction: Transaction
  ): string {

    return transaction.transactionType ===
      'Deposit'

      ? 'deposit'

      : 'withdrawal';
  }

}