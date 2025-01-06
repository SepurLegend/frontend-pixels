import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './rental.component.html',
  styleUrls: ['./rental.component.css'],
})
export class RentalComponent implements OnInit {
  isAdmin: boolean = false; // Tambahkan properti untuk menentukan apakah user adalah admin
  rental: any[] = [];
  room: any[] = [];
  game: any[] = [];
  platform: any[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  apiRentalUrl = 'https://pixels-backend.vercel.app/api/rental';
  apiRoomUrl = 'https://pixels-backend.vercel.app/api/room';
  apiGameUrl = 'https://pixels-backend.vercel.app/api/game';
  apiPlatformUrl = 'https://pixels-backend.vercel.app/api/platform';
  isLoading = true;
  rentalForm: FormGroup;
  isSubmitting = false;

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  constructor() {
    this.rentalForm = this.fb.group({
      namaCustomer: [''],
      room_id: [null],
      platform_id: [null],
      game_id: [null],
      durationTime: [''],
      startTime: [new Date()],
      endTime: [new Date()],
    });
  }

  ngOnInit(): void {
    const userRole = localStorage.getItem('role'); // Ambil role dari localStorage
    console.log('Role dari localStorage:', userRole);

    this.isAdmin = userRole === 'admin'; // Periksa apakah pengguna adalah admin
    console.log('isAdmin:', this.isAdmin);
    
    this.getRental();
    this.getRoom();
    this.getGame();
    this.getPlatform();

  }

  getRental(): void {
    this.http.get<any[]>(this.apiRentalUrl).subscribe({
      next: (data) => {
        this.rental = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching rental:', err);
        this.isLoading = false;
      },
    });
  }

  getRoom(): void {
    this.http.get<any[]>(this.apiRoomUrl).subscribe({
      next: (data) => {
        this.room = data;
      },
      error: (err) => {
        console.error('Error fetching rooms:', err);
      },
    });
  }

  getGame(): void {
    this.http.get<any[]>(this.apiGameUrl).subscribe({
      next: (data) => {
        this.game= data;
      },
      error: (err) => {
        console.error('Error fetching games:', err);
      },
    });
  }

  getPlatform(): void {
    this.http.get<any[]>(this.apiPlatformUrl).subscribe({
      next: (data) => {
        this.platform = data;
      },
      error: (err) => {
        console.error('Error fetching platform:', err);
      },
    });
  }

  addRental(): void {
    if (this.rentalForm.valid) {
      this.isSubmitting = true;
      this.http.post(this.apiRentalUrl, this.rentalForm.value).subscribe({
        next: (response) => {
          console.log('Rental berhasil ditambahkan:', response);
          this.getRental();
          this.rentalForm.reset();
          this.isSubmitting = false;

          // Tutup modal setelah data berhasil ditambahkan
          const modalElement = document.getElementById('tambahRentalModal') as HTMLElement; // Ambil elemen modal berdasarkan ID.
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
          console.error('Error menambahkan rental:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  editRentalId: string | null = null;

  getRentalById(_id: string): void {
    console.log('Fetching Rental with ID:', _id);
    this.editRentalId = _id;
    this.http.get(`${this.apiRentalUrl}/${_id}`).subscribe({
      next: (data: any) => {
        console.log('Rental data fetched:', data);
        this.rentalForm.patchValue({
          namaCustomer: data.namaCustomer,
          room_id: data.room_id,
          platform_id: data.platform_id,
          game_id: data.game_id,
          durationTime: data.durationTime,
        });
        // Buka modal edit
        const modalElement = document.getElementById('editRentalModal') as HTMLElement;
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      },
      error: (err) => {
        console.error('Error fetching rental by ID:', err);
      },
    });
  }

  updateRental(): void {
    if (this.rentalForm.valid && this.editRentalId) {
      this.isSubmitting = true;
      this.http.put(`${this.apiRentalUrl}/${this.editRentalId}`, this.rentalForm.value).subscribe({
        next: (response) => {
          console.log('Rental berhasil diperbarui:', response);
          this.getRental();
          this.isSubmitting = false;

          // Tutup modal edit
          const modalElement = document.getElementById('editRentalModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
          }
        },
        error: (err) => {
          console.error('Error updating rental:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteRental(_id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus rental ini?')) {
      this.http.delete(`${this.apiRentalUrl}/${_id}`).subscribe({
        next: () => {
          console.log(`Rental dengan ID ${_id} berhasil dihapus`);
          this.getRental();
        },
        error: (err) => {
          console.error('Error menghapus rental:', err);
        },
      });
    }
  }
}
