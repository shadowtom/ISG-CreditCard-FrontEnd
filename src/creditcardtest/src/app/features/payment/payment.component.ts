import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { v4 as uuidv4 } from 'uuid';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentForm: FormGroup;
  transactionId: string | null = null;
  paymentStatus: string = 'pending';
  pollingSubscription: Subscription | null = null;
  isLoading: boolean = false;
  paymentResult: any = null;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {
    this.paymentForm = this.fb.group({
      totalAmount: [0, [Validators.required, Validators.min(0.01)]],
      currencyCode: ['USD', [Validators.required]],
      cardPan: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      cardCvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      cardExpiration: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
      cardholderName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      line1: ['', [Validators.required]],
      line2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      countryCode: ['US', [Validators.required]],
      emailAddress: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }

    this.isLoading = true;
    this.paymentStatus = 'processing';
    const transactionId = uuidv4();

    const payload = {
      ...this.paymentForm.value,
      transactionIdentifier: transactionId,
      orderIdentifier: transactionId
    };

    this.paymentService.processPayment(payload).subscribe({
      next: (response) => {
        this.transactionId = transactionId;
        this.startPolling(transactionId);
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.paymentStatus = 'failed';
        this.isLoading = false;
      }
    });
  }

  startPolling(transactionId: string): void {
    this.pollingSubscription = interval(2000).pipe(
      switchMap(() => this.paymentService.checkPaymentStatus(transactionId)),
      takeWhile((response) => {
        if (response.status === 'completed' || response.status === 'failed') {
          this.paymentStatus = response.status;
          this.paymentResult = response;
          this.isLoading = false;
          return false;
        }
        return true;
      }, true)
    ).subscribe();
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
