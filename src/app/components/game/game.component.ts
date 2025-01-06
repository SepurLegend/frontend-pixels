import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  isAdmin: boolean = false; // Tambahkan properti untuk menentukan apakah user adalah admin
  game: any[] = [];
  platform: any[] = [];
  apiGameUrl = 'https://pixels-backend.vercel.app/api/game';
  apiPlatformUrl = 'https://pixels-backend.vercel.app/api/platform';
  isLoading = true;
  gameForm: FormGroup;
  isSubmitting = false;

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  constructor() {
    this.gameForm = this.fb.group({
      namaGame: [''],
      genre: [''],
      jenis: [''],
      player: [''],
      platform_id: [null],
    });
  }

  ngOnInit(): void {
    // Logika untuk mendapatkan peran pengguna
    const userRole = localStorage.getItem('role'); // Ambil role dari localStorage
    console.log('Role dari localStorage:', userRole);

    this.isAdmin = userRole === 'admin'; // Periksa apakah pengguna adalah admin
    console.log('isAdmin:', this.isAdmin);

    // // Tambahkan console log ini
    // console.log('Role pengguna saat ini:', userRole);
    // console.log('Nilai isAdmin:', this.isAdmin);

    // Inisialisasi data game dan platform
    this.getGame();
    this.getPlatform();
  }

  getGame(): void {
    this.http.get<any[]>(this.apiGameUrl).subscribe({
      next: (data) => {
        this.game = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching game data:', err);
        this.isLoading = false;
      },
    });
  }

  getPlatform(): void {
    this.http.get<any[]>(this.apiPlatformUrl).subscribe({
      next: (data) => {
        this.platform = data;
      },
      error: (err) => {
        console.error('Error fetching platform data:', err);
      },
    });
  }

  addGame(): void {
    if (this.gameForm.valid) {
      this.isSubmitting = true; // Aktifkan indikator pengiriman

      this.http.post(this.apiGameUrl, this.gameForm.value).subscribe({
        next: (response) => {
          console.log('Game berhasil ditambahkan:', response); // Log respons
          this.getGame(); // Refresh data game
          this.gameForm.reset(); // Reset form
          this.isSubmitting = false; // Matikan indikator pengiriman

          // Tutup modal setelah data berhasil ditambahkan
          const modalElement = document.getElementById('tambahGameModal') as HTMLElement; // Ambil elemen modal berdasarkan ID.
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
          console.error('Error menambahkan game:', err); // Log error
          this.isSubmitting = false; // Matikan indikator pengiriman
        },
      });
    }
  }

  deleteGame(_id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus game ini?')) {
      this.http.delete(`${this.apiGameUrl}/${_id}`).subscribe({
        next: () => {
          console.log(`Game dengan ID ${_id} berhasil dihapus`); // Log respons
          this.getGame(); // Refresh data game
        },
        error: (err) => {
          console.error('Error menghapus game:', err); // Log error
        },
      });
    }
  }

  editGameId: string | null = null;
  
  getGameById(_id: string): void {
    console.log('Fetching Game with ID:', _id);
    this.editGameId = _id;
    this.http.get(`${this.apiGameUrl}/${_id}`).subscribe({
      next: (data: any) => {
        console.log('Game data fetched:', data);
        this.gameForm.patchValue({
          namaGame: data.namaGame,
          genre: data.genre,
          jenis: data.jenis,
          player: data.player,
          platform_id: data.platform_id,
        });
        // Buka modal edit
        const modalElement = document.getElementById('editGameModal') as HTMLElement;
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      },
      error: (err) => {
        console.error('Error fetching Game by ID:', err);
      },
    });
  }

  updateGame(): void {
    if (this.gameForm.valid && this.editGameId) {
      this.isSubmitting = true; 
      this.http.put(`${this.apiGameUrl}/${this.editGameId}`, this.gameForm.value).subscribe({
        next: (response) => {
          console.log('Game berhasil diperbarui:', response);
          this.getGame(); // Refresh data Game
          this.isSubmitting = false;
  
          // Tutup modal edit
          const modalElement = document.getElementById('editGameModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
          }
        },
        error: (err) => {
          console.error('Error updating game:', err);
          this.isSubmitting = false; 
        },
      });
    }
  }
}