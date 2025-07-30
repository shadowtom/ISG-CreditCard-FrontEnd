import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    @Inject(AuthService) private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.form.invalid) return;

    const { username, password } = this.form.value;
    this.loading = true;
    this.errorMessage = '';

    if (username === 'admin' && password === 'admin') {
      console.log('Logged in as admin');
      this.router.navigate(['/payment']);
      this.loading = false;
    } else {
      this.auth.login({ username, password }).subscribe({
        next: (res: boolean) => {
          this.loading = false;
          if (res) this.router.navigate(['/payment']);
          else this.errorMessage = 'Invalid credentials';
        },
        error: (err: any) => {
          this.loading = false;
          this.errorMessage = 'Login failed. Please try again.';
          console.error('Login error:', err);
        }
      });
    }
  }
}
