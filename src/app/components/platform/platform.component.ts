import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-platform',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.css'],
})
export class PlatformComponent implements OnInit {
  isAdmin: boolean = false; // Tambahkan properti untuk menentukan apakah user adalah admin
  platform: any[] = []; // Data platform
  apiPlatformUrl = 'https://pixels-backend.vercel.app/api/platform'; // API URL untuk platform
  isLoading = true; // Indikator loading
  platformForm: FormGroup; // Form group untuk formulir reaktif
  isSubmitting = false; // Indikator proses pengiriman data

  private http = inject(HttpClient); // Inject HttpClient
  private fb = inject(FormBuilder); // Inject FormBuilder

  constructor() {
    this.platformForm = this.fb.group({
      namaConsole: [''], 
      versiConsole: [''], 
      wilayahConsole: [''],
    });
  }

  ngOnInit(): void { 
    const userRole = localStorage.getItem('role'); // Ambil role dari localStorage
    console.log('Role dari localStorage:', userRole);

    this.isAdmin = userRole === 'admin'; // Periksa apakah pengguna adalah admin
    console.log('isAdmin:', this.isAdmin);
    
    this.getPlatform(); 
  }

  getPlatform(): void {
    this.http.get<any[]>(this.apiPlatformUrl).subscribe({
      next: (data) => {
        this.platform = data; // Simpan data platform
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching platform data:', err); // Log error
        this.isLoading = false;
      },
    });
  }

  addPlatform(): void {
    if (this.platformForm.valid) {
      this.isSubmitting = true; // Aktifkan indikator pengiriman

      this.http.post(this.apiPlatformUrl, this.platformForm.value).subscribe({
        next: (response) => {
          console.log('Platform berhasil ditambahkan:', response); // Log respons
          this.getPlatform(); // Refresh data platform
          this.platformForm.reset(); // Reset form
          this.isSubmitting = false; // Matikan indikator pengiriman

          // Tutup modal setelah data berhasil ditambahkan
          const modalElement = document.getElementById('tambahPlatformModal') as HTMLElement; // Ambil elemen modal berdasarkan ID.
          if (modalElement) { // Periksa jika elemen modal ada.
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement); // Ambil atau buat instance modal.
            modalInstance.hide(); // Sembunyikan modal.

            // Pastikan untuk menghapus atribut dan gaya pada body setelah modal ditutup
            modalElement.addEventListener('hidden.bs.modal', () => { // Tambahkan event listener untuk modal yang ditutup.
              const backdrop = document.querySelector('.modal-backdrop'); // Cari elemen backdrop modal.
              if (backdrop) { 
                backdrop.remove(); // Hapus backdrop jika ada.
              }

              // Pulihkan scroll pada body
              document.body.classList.remove('modal-open'); // Hapus class 'modal-open' dari body.
              document.body.style.overflow = ''; // Pulihkan properti overflow pada body.
              document.body.style.paddingRight = ''; // Pulihkan padding body.
            }, { once: true }); // Event listener hanya dijalankan sekali.
          }
        },
        error: (err) => {
          console.error('Error menambahkan Platform:', err); // Log error
          this.isSubmitting = false; // Matikan indikator pengiriman
        },
      });
    }
  }

  deletePlatform(_id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus Platform ini?')) {
      this.http.delete(`${this.apiPlatformUrl}/${_id}`).subscribe({
        next: () => {
          console.log(`Platform dengan ID ${_id} berhasil dihapus`); // Log respons
          this.getPlatform(); // Refresh data platform
        },
        error: (err) => {
          console.error('Error menghapus platform:', err); // Log error
        },
      });
    }
  }

  editPlatformId: string | null = null;
  
  getPlatformById(_id: string): void {
    console.log('Fetching Platform with ID:', _id);
    this.editPlatformId = _id;
    this.http.get(`${this.apiPlatformUrl}/${_id}`).subscribe({
      next: (data: any) => {
        console.log('Platform data fetched:', data);
        this.platformForm.patchValue({
          namaConsole: data.namaConsole,
          versiConsole: data.versiConsole,
          wilayahConsole: data.wilayahConsole,
        });
        // Buka modal edit
        const modalElement = document.getElementById('editPlatformModal') as HTMLElement;
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      },
      error: (err) => {
        console.error('Error fetching Platform by ID:', err);
      },
    });
  }

  updatePlatform(): void {
    if (this.platformForm.valid && this.editPlatformId) {
      this.isSubmitting = true; 
      this.http.put(`${this.apiPlatformUrl}/${this.editPlatformId}`, this.platformForm.value).subscribe({
        next: (response) => {
          console.log('Platform berhasil diperbarui:', response);
          this.getPlatform(); // Refresh data platform
          this.isSubmitting = false;
  
          // Tutup modal edit
          const modalElement = document.getElementById('editPlatformModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
          }
        },
        error: (err) => {
          console.error('Error updating platform:', err);
          this.isSubmitting = false; 
        },
      });
    }
  }
}
