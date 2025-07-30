import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/api/payments'; // Ajusta según tu entorno

  constructor(private http: HttpClient) { }

  processPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/process`, paymentData);
  }

  checkPaymentStatus(transactionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${transactionId}`);
  }
}
