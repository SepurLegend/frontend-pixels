import { CommonModule } from '@angular/common';  
import { Component } from '@angular/core';  
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';  
import { HttpClient } from '@angular/common/http';  
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',  // Selector untuk komponen ini
  templateUrl: './register.component.html',  // Template HTML yang terkait dengan komponen ini
  imports: [CommonModule, ReactiveFormsModule],  // Mengimpor CommonModule dan ReactiveFormsModule agar bisa menggunakan fitur form
  styleUrls: ['./register.component.css'],  // Styling CSS untuk komponen ini
})
export class RegisterComponent {
  registerForm: FormGroup;  // FormGroup untuk form register
  isSubmitting: boolean = false;  // Status untuk menandakan apakah form sedang dikirim
  apiUrl = 'https://pixels-backend.vercel.app/api/auth/register';  // API endpoint untuk register

  constructor(
    private fb: FormBuilder,  // FormBuilder untuk membuat form
    private http: HttpClient,  // HttpClient untuk HTTP request
    private router: Router  // Router untuk navigasi halaman
  ) {
    // Membuat FormGroup dengan validasi
    this.registerForm = this.fb.group({
      // Input name dengan validasi wajib
      name: ['', [Validators.required, Validators.minLength(3)]],
      // Input noTelp dengan validasi wajib dan pola angka
      noTelp: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      // Input password dengan validasi wajib dan panjang minimal 6 karakter
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Method untuk menangani form submission
  onRegister() {
    // Memeriksa apakah form valid
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();  // Menandai semua field sebagai touched
      return;  // Menghentikan proses jika form tidak valid
    }

    // Menandakan bahwa form sedang diproses
    this.isSubmitting = true;

    // Mengambil nilai dari form
    const { name, noTelp, password } = this.registerForm.value;

    // Mengirim request POST ke API register
    this.http.post(this.apiUrl, { name, noTelp, password }).subscribe({
      next: (response: any) => {
        console.log('Register berhasil:', response);

        // Mengarahkan ke halaman login setelah berhasil register
        alert('Registrasi berhasil. Silakan login.');
        this.router.navigate(['/auth']);  // Navigasi ke halaman login
        this.isSubmitting = false;  // Mengubah status submitting menjadi false
      },
      error: (error) => {
        // Jika terjadi error saat register
        console.error('Register gagal:', error);
        alert('Registrasi gagal. Periksa kembali data yang dimasukkan.');
        this.isSubmitting = false;  // Mengubah status submitting menjadi false
      },
    });
  }
}
