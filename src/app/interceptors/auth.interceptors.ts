import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken'); // Ambil token dari localStorage

  if (token) {
    // Tambahkan header Authorization jika token ada
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(cloned);
  }

  return next(req); // Lanjutkan permintaan jika token tidak ada
};
