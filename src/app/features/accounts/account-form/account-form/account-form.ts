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

import { AccountService } from '../../../../core/services/account.service';

import {
  Account,
  AccountRequest
} from '../../../../models/account.model';


@Component({
  selector: 'app-account-form',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './account-form.html',

  styleUrl: './account-form.scss'
})
export class AccountForm implements OnInit {

  private fb = inject(FormBuilder);

  private accountService =
    inject(AccountService);

  private route =
    inject(ActivatedRoute);

  private router =
    inject(Router);


  accountId: string | null = null;

  isEditMode = false;

  loading = false;

  submitting = false;

  errorMessage = '';

  successMessage = '';

  currentAccount: Account | null = null;


  accountForm = this.fb.nonNullable.group({

    /* CUSTOMER NAME */

    customerName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    ],


    /* ACCOUNT NUMBER */

    accountNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.minLength(8),
        Validators.maxLength(20)
      ]
    ],


    /* ACCOUNT TYPE */

    accountType: [
      'Savings' as
      'Savings' |
      'Current' |
      'Salary',

      Validators.required
    ],


    /* BRANCH */

    branch: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    ],


    /* IFSC CODE */

    ifscCode: [
      '',
      [
        Validators.required,

        Validators.pattern(
          /^[A-Z]{4}[A-Z0-9]{7}$/
        )
      ]
    ],


    /* BALANCE */

    balance: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],


    /* EMAIL */

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],


    /* MOBILE */

    mobile: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^[0-9]{10}$/
        )
      ]
    ],


    /* STATUS */

    status: [
      'Active' as
      'Active' |
      'Inactive',

      Validators.required
    ]

  });


  ngOnInit(): void {

    this.accountId =
      this.route.snapshot.paramMap.get('id');

    this.isEditMode =
      !!this.accountId;


    if (
      this.isEditMode &&
      this.accountId
    ) {

      this.loadAccount(
        this.accountId
      );

    }

  }


  /* LOAD ACCOUNT FOR EDIT */

  loadAccount(
    id: string
  ): void {

    this.loading = true;

    this.errorMessage = '';

    this.accountService
      .getAccountById(id)
      .subscribe({

        next: (account) => {

          this.currentAccount =
            account;


          this.accountForm.patchValue({

            customerName:
              account.customerName,

            accountNumber:
              account.accountNumber,

            accountType:
              account.accountType,

            branch:
              account.branch,

            ifscCode:
              account.ifscCode,

            balance:
              account.balance,

            email:
              account.email,

            mobile:
              account.mobile,

            status:
              account.status

          });


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


  /* FORM CONTROLS */

  get f() {

    return this.accountForm.controls;

  }


  /* SUBMIT */

  submitForm(): void {

    this.errorMessage = '';

    this.successMessage = '';


    if (
      this.accountForm.invalid
    ) {

      this.accountForm.markAllAsTouched();

      return;

    }


    this.checkAccountNumberAndSave();

  }


  /* CHECK DUPLICATE ACCOUNT NUMBER */

  private checkAccountNumberAndSave(): void {

    this.submitting = true;


    const accountNumber =
      this.accountForm
        .controls
        .accountNumber
        .value;


    this.accountService
      .getAccounts()
      .subscribe({

        next: (accounts) => {

          const duplicate =
            accounts.some(
              account =>

                account.accountNumber ===
                accountNumber &&

                account.id !==
                this.accountId
            );


          if (duplicate) {

            this.submitting = false;


            this.accountForm
              .controls
              .accountNumber
              .setErrors({
                duplicate: true
              });


            this.errorMessage =
              'Account number already exists. Please use a different account number.';


            return;

          }


          this.saveAccount();

        },


        error: (error) => {

          console.error(
            'Error checking account number:',
            error
          );

          this.submitting = false;

          this.errorMessage =
            'Unable to verify account number. Please try again.';

        }

      });

  }


  /* SAVE ACCOUNT */

  private saveAccount(): void {

    const formValue =
      this.accountForm.getRawValue();


    const accountRequest:
      AccountRequest = {

      customerName:
        formValue.customerName.trim(),


      accountNumber:
        formValue.accountNumber.trim(),


      accountType:
        formValue.accountType,


      branch:
        formValue.branch.trim(),


      ifscCode:
        formValue.ifscCode
          .trim()
          .toUpperCase(),


      balance:
        Number(formValue.balance),


      email:
        formValue.email.trim(),


      mobile:
        formValue.mobile.trim(),


      status:
        formValue.status

    };


    /* EDIT ACCOUNT */

    if (
      this.isEditMode &&
      this.accountId
    ) {

      this.accountService
        .updateAccount(
          this.accountId,
          accountRequest
        )
        .subscribe({

          next: () => {

            this.submitting = false;

            this.successMessage =
              'Account updated successfully.';


            setTimeout(() => {

              this.router.navigate([
                '/accounts',
                this.accountId
              ]);

            }, 800);

          },


          error: (error) => {

            console.error(
              'Error updating account:',
              error
            );

            this.submitting = false;

            this.errorMessage =
              'Unable to update account. Please try again.';

          }

        });

    }


    /* CREATE ACCOUNT */

    else {

      this.accountService
        .createAccount(
          accountRequest
        )
        .subscribe({

          next: (account) => {

            this.submitting = false;

            this.successMessage =
              'Account created successfully.';


            setTimeout(() => {

              this.router.navigate([
                '/accounts',
                account.id
              ]);

            }, 800);

          },


          error: (error) => {

            console.error(
              'Error creating account:',
              error
            );

            this.submitting = false;

            this.errorMessage =
              'Unable to create account. Please try again.';

          }

        });

    }

  }


  /* CANCEL */

  cancel(): void {

    this.router.navigate([
      '/accounts'
    ]);

  }


  /* ERROR CHECK */

  hasError(
    fieldName:
      keyof typeof this.accountForm.controls,

    errorName: string

  ): boolean {

    const control =
      this.accountForm.controls[
      fieldName
      ];


    return (
      control.touched &&
      control.hasError(errorName)
    );

  }

}