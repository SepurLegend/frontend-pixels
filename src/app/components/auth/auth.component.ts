// Mengimpor CommonModule untuk menggunakan fitur-fitur dasar Angular seperti *ngIf dan *ngFor
import { CommonModule } from '@angular/common';  
// Mengimpor Component dari Angular untuk membuat komponen
import { Component } from '@angular/core';  
// Mengimpor FormBuilder, FormGroup, ReactiveFormsModule, dan Validators untuk bekerja dengan form dan validasi di Angular
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';  
// Mengimpor HttpClient untuk melakukan HTTP request
import { HttpClient } from '@angular/common/http';  
// Mengimpor Router untuk menavigasi antara halaman setelah login berhasil
import { Router } from '@angular/router';

// Deklarasi komponen dengan selector, template, dan styling
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./auth.component.css'],
  standalone: true
})
export class AuthComponent {
  authForm: FormGroup;
  isSubmitting: boolean = false;
  apiUrl = 'https://pixels-backend.vercel.app/api/auth/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      noTelp: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Fungsi untuk decode token JWT
  decodeToken(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      return null;
    }
  }

  onAuth() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { noTelp, password } = this.authForm.value;

    this.http.post(this.apiUrl, { noTelp, password }).subscribe({
      next: (response: any) => {
        console.log('Response lengkap:', response);

        if (response && response.token) {
          // Simpan token
          localStorage.setItem('authToken', response.token);
          
          // Decode token untuk mendapatkan role
          const decodedToken = this.decodeToken(response.token);
          console.log('Decoded token:', decodedToken);

          if (decodedToken && decodedToken.role) {
            localStorage.setItem('role', decodedToken.role);
            console.log('Role dari token:', decodedToken.role);
          }

          console.log('Token setelah login:', response.token);
          console.log('Role yang disimpan:', localStorage.getItem('role'));
          
          // Redirect berdasarkan role dari token
          const userRole = localStorage.getItem('role');
          if (userRole === 'admin') {
            this.router.navigate(['']);
          } else {
            this.router.navigate(['']);
          }
        } else {
          console.error('Token tidak ditemukan dalam response:', response);
          alert('Login gagal. Token tidak ditemukan.');
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Login gagal:', error);
        alert('Login gagal. Periksa noTelp atau password.');
        this.isSubmitting = false;
      },
    });
  }
}

