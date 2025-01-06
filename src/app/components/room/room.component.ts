import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
  isAdmin: boolean = false; // Tambahkan properti untuk menentukan apakah user adalah admin
  room: any[] = []; // Data room
  apiRoomUrl = 'https://pixels-backend.vercel.app/api/room'; // API URL untuk room
  isLoading = true; // Indikator loading
  roomForm: FormGroup; // Form group untuk formulir reaktif
  isSubmitting = false; // Indikator proses pengiriman data
  editRoomId: string | null = null; // ID untuk edit
  // selectedImage: File | null = null; // File gambar yang dipilih

  private http = inject(HttpClient); // Inject HttpClient
  private fb = inject(FormBuilder); // Inject FormBuilder

  constructor() {
    this.roomForm = this.fb.group({
      tipe: [''],
      hargaPerJam: [0],
      fasilitas: [''],
      alasanPerubahan: [''],
      hargaSetelahDiskon: [0],
      potonganHarga: [0],
      image: [''],
    });
  }

  ngOnInit(): void {
    const userRole = localStorage.getItem('role'); // Ambil role dari localStorage
    console.log('Role dari localStorage:', userRole);

    this.isAdmin = userRole === 'admin'; // Periksa apakah pengguna adalah admin
    console.log('isAdmin:', this.isAdmin);

    this.getRoom();
  }

  getRoom(): void {
    this.http.get<any[]>(this.apiRoomUrl).subscribe({
      next: (data) => {
        this.room = data; // Simpan data room
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching room data:', err);
        this.isLoading = false;
      },
    });
  }

  addRoom(): void {
    if (this.roomForm.valid) {
      this.isSubmitting = true;

      this.http.post(this.apiRoomUrl, this.roomForm.value).subscribe({
        next: (response) => {
          console.log('Room berhasil ditambahkan:', response);
          this.getRoom();
          this.roomForm.reset();
          this.isSubmitting = false;

          const modalElement = document.getElementById('tambahRoomModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();

            modalElement.addEventListener(
              'hidden.bs.modal',
              () => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
              },
              { once: true }
            );
          }
        },
        error: (err) => {
          console.error('Error menambahkan Room:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteRoom(_id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus Room ini?')) {
      this.http.delete(`${this.apiRoomUrl}/${_id}`).subscribe({
        next: () => {
          console.log(`Room dengan ID ${_id} berhasil dihapus`);
          this.getRoom();
        },
        error: (err) => {
          console.error('Error menghapus room:', err);
        },
      });
    }
  }

  getRoomById(_id: string): void {
    console.log('Fetching Room with ID:', _id);
    this.editRoomId = _id;
    this.http.get(`${this.apiRoomUrl}/${_id}`).subscribe({
      next: (data: any) => {
        console.log('Room data fetched:', data);
        this.roomForm.patchValue({
          tipe: data.tipe,
          hargaPerJam: data.hargaPerJam,
          fasilitas: data.fasilitas,
          alasanPerubahan: data.alasanPerubahan,
          hargaSetelahDiskon: data.hargaSetelahDiskon,
          potonganHarga: data.potonganHarga,
          image: '',
        });
        const modalElement = document.getElementById('editRoomModal') as HTMLElement;
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      },
      error: (err) => {
        console.error('Error fetching Room by ID:', err);
      },
    });
  }

  updateRoom(): void {
    if (this.roomForm.valid && this.editRoomId) {
      this.isSubmitting = true;
      this.http.put(`${this.apiRoomUrl}/${this.editRoomId}`, this.roomForm.value).subscribe({
        next: (response) => {
          console.log('Room berhasil diperbarui:', response);
          this.getRoom();
          this.isSubmitting = false;

          const modalElement = document.getElementById('editRoomModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
          }
        },
        error: (err) => {
          console.error('Error updating room:', err);
          this.isSubmitting = false;
        },
      });
    }
  }
}
