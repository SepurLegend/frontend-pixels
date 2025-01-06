// Mengimpor ApplicationConfig dan fungsi optimasi perubahan zona dari Angular core
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

// Mengimpor fungsi untuk menyediakan routing di aplikasi Angular
import { provideRouter } from '@angular/router';

// Mengimpor fungsi untuk menyediakan layanan HTTP di aplikasi Angular
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Mengimpor konfigurasi rute yang sudah didefinisikan di file app.routes.ts
import { routes } from './app.routes';

// Mengimpor fungsi authInterceptor
import { authInterceptor } from './interceptors/auth.interceptors'; // Pastikan path ini benar

// Mendefinisikan konfigurasi aplikasi Angular
export const appConfig: ApplicationConfig = {
  providers: [
    // Mengoptimalkan deteksi perubahan untuk meningkatkan performa
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Menyediakan layanan routing dengan konfigurasi rute
    provideRouter(routes),

    // Menyediakan layanan HttpClient dengan interceptor
    provideHttpClient(
      withInterceptors([authInterceptor]) // Gunakan fungsi authInterceptor
    ),
  ],
};
