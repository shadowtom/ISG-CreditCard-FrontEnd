import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  form: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      totalAmount: [0, [Validators.required, Validators.min(0.01)]],
      currencyCode: ['USD', [Validators.required]],
      cardPan: ['', [Validators.required]],
      cardCvv: ['', [Validators.required]],
      cardExpiration: ['', [Validators.required]],
      cardholderName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      line1: ['', [Validators.required]],
      line2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      countryCode: ['', [Validators.required]],
      emailAddress: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]]
    });
  }

  submitPayment() {
    const id = uuidv4(); // unique transaction & order ID

    const payload = {
      transactionIdentifier: id,
      orderIdentifier: id,
      totalAmount: this.form.value.totalAmount,
      currencyCode: this.form.value.currencyCode,
      threeDSecure: true,
      source: {
        cardPan: this.form.value.cardPan,
        cardCvv: this.form.value.cardCvv,
        cardExpiration: this.form.value.cardExpiration,
        cardholderName: this.form.value.cardholderName
      },
      billingAddress: {
        firstName: this.form.value.firstName,
        lastName: this.form.value.lastName,
        line1: this.form.value.line1,
        line2: this.form.value.line2,
        city: this.form.value.city,
        state: this.form.value.state,
        postalCode: this.form.value.postalCode,
        countryCode: this.form.value.countryCode,
        emailAddress: this.form.value.emailAddress,
        phoneNumber: this.form.value.phoneNumber
      },
      addressMatch: true,
      extendedData: {
        threeDSecure: {
          challengeWindowSize: 4,
          challengeIndicator: '01'
        },
        merchantResponseUrl: 'https://your-callback.url'
      }
    };

    this.http.post('https://your-payment-endpoint.com/api/pay', payload).subscribe({
      next: (res) => console.log('✅ Payment successful:', res),
      error: (err) => console.error('❌ Payment failed:', err)
    });
  }
}
