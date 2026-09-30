import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  debounceTime,
  distinctUntilChanged
} from 'rxjs';

import { AccountService } from '../../../../core/services/account.service';

import {
  Account,
  AccountStatus,
  AccountType
} from '../../../../models/account.model';

import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';


@Component({
  selector: 'app-account-list',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinner,
    ConfirmDialog
  ],

  templateUrl: './account-list.html',

  styleUrl: './account-list.scss'
})
export class AccountList implements OnInit {

  Math = Math;

  private accountService = inject(AccountService);

  private router = inject(Router);


  // All accounts from API
  accounts: Account[] = [];

  // Filtered accounts
  filteredAccounts: Account[] = [];


  // Search
  searchControl = new FormControl('');


  // Filters
  selectedType: AccountType | '' = '';

  selectedStatus: AccountStatus | '' = '';


  // Sorting
  sortField: keyof Account = 'createdDate';

  sortDirection: 'asc' | 'desc' = 'desc';


  // Pagination
  currentPage = 1;

  pageSize = 5;


  // Loading / Error
  loading = true;

  errorMessage = '';


  // Delete dialog
  showDeleteDialog = false;

  accountToDelete: Account | null = null;


  ngOnInit(): void {

    // Load accounts
    this.loadAccounts();


    // Search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {

        this.currentPage = 1;

        this.applyFilters();

      });

  }


  // ==============================
  // LOAD ACCOUNTS
  // ==============================

  loadAccounts(): void {

    this.loading = true;

    this.errorMessage = '';


    this.accountService
      .getAccounts()
      .subscribe({

        next: (accounts: Account[]) => {

          this.accounts = accounts;

          this.loading = false;

          this.applyFilters();

        },

        error: (error) => {

          console.error(
            'Error loading accounts:',
            error
          );

          this.loading = false;

          this.errorMessage =
            'Unable to load accounts. Please try again.';

        }

      });

  }


  // ==============================
  // FILTER + SEARCH + SORT
  // ==============================

  applyFilters(): void {

    const searchTerm =
      (this.searchControl.value ?? '')
        .trim()
        .toLowerCase();


    let result: Account[] = [
      ...this.accounts
    ];


    // Search
    if (searchTerm) {

      result = result.filter(account =>

        account.customerName
          .toLowerCase()
          .includes(searchTerm)

        ||

        account.accountNumber
          .toLowerCase()
          .includes(searchTerm)

        ||

        account.branch
          .toLowerCase()
          .includes(searchTerm)

        ||

        account.email
          .toLowerCase()
          .includes(searchTerm)

      );

    }


    // Account type filter
    if (this.selectedType) {

      result = result.filter(
        account =>
          account.accountType ===
          this.selectedType
      );

    }


    // Status filter
    if (this.selectedStatus) {

      result = result.filter(
        account =>
          account.status ===
          this.selectedStatus
      );

    }


    // Sorting
    result.sort((a, b) => {

      const valueA =
        String(a[this.sortField]);

      const valueB =
        String(b[this.sortField]);


      const comparison =
        valueA.localeCompare(valueB);


      return this.sortDirection === 'asc'
        ? comparison
        : -comparison;

    });


    this.filteredAccounts = result;


    // Make sure current page is valid
    const totalPages =
      Math.max(
        1,
        Math.ceil(
          this.filteredAccounts.length /
          this.pageSize
        )
      );


    if (
      this.currentPage >
      totalPages
    ) {

      this.currentPage =
        totalPages;

    }

  }


  // ==============================
  // TYPE FILTER
  // ==============================

  onTypeChange(value: string): void {

    this.selectedType =
      value as AccountType | '';

    this.currentPage = 1;

    this.applyFilters();

  }


  // ==============================
  // STATUS FILTER
  // ==============================

  onStatusChange(value: string): void {

    this.selectedStatus =
      value as AccountStatus | '';

    this.currentPage = 1;

    this.applyFilters();

  }


  // ==============================
  // SORT
  // ==============================

  sortBy(
    field: keyof Account
  ): void {

    if (
      this.sortField === field
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortField = field;

      this.sortDirection = 'asc';

    }


    this.applyFilters();

  }


  // ==============================
  // CLEAR FILTERS
  // ==============================

  clearFilters(): void {

    this.searchControl.setValue(
      '',
      {
        emitEvent: false
      }
    );

    this.selectedType = '';

    this.selectedStatus = '';

    this.currentPage = 1;

    this.applyFilters();

  }


  // ==============================
  // PAGINATION
  // ==============================

  get paginatedAccounts(): Account[] {

    const startIndex =
      (this.currentPage - 1) *
      this.pageSize;


    return this.filteredAccounts.slice(
      startIndex,
      startIndex + this.pageSize
    );

  }


  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.filteredAccounts.length /
        this.pageSize
      )
    );

  }


  get pageNumbers(): number[] {

    return Array.from(
      {
        length: this.totalPages
      },
      (_, index) =>
        index + 1
    );

  }


  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {

      return;

    }


    this.currentPage = page;

  }


  // ==============================
  // VIEW ACCOUNT
  // ==============================

  viewAccount(id: string): void {

    this.router.navigate([
      '/accounts',
      id
    ]);

  }


  // ==============================
  // EDIT ACCOUNT
  // ==============================

  editAccount(id: string): void {

    this.router.navigate([
      '/accounts',
      id,
      'edit'
    ]);

  }


  // ==============================
  // DELETE ACCOUNT
  // ==============================

  deleteAccount(
    account: Account
  ): void {

    this.accountToDelete =
      account;

    this.showDeleteDialog = true;

  }


  // ==============================
  // CONFIRM DELETE
  // ==============================

  confirmDelete(): void {

    if (
      !this.accountToDelete
    ) {

      return;

    }


    const account =
      this.accountToDelete;


    this.accountService
      .deleteAccount(account.id)
      .subscribe({

        next: () => {

          // Remove from local list
          this.accounts =
            this.accounts.filter(
              item =>
                item.id !== account.id
            );


          // Refresh filtered list
          this.applyFilters();


          // Close dialog
          this.closeDeleteDialog();


          // Success notification
          window.alert(
            'Account deleted successfully.'
          );

        },


        error: (error) => {

          console.error(
            'Error deleting account:',
            error
          );


          this.closeDeleteDialog();


          window.alert(
            'Unable to delete the account. Please try again.'
          );

        }

      });

  }


  // ==============================
  // CANCEL DELETE
  // ==============================

  cancelDelete(): void {

    this.closeDeleteDialog();

  }


  private closeDeleteDialog(): void {

    this.showDeleteDialog = false;

    this.accountToDelete = null;

  }


  // ==============================
  // RETRY
  // ==============================

  retry(): void {

    this.loadAccounts();

  }

}