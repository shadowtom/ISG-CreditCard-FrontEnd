import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { PaymentComponent } from './features/payment/payment.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'payment', component: PaymentComponent }// ⬅️ Root path loads only login
];
