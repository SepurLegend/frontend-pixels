// auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';  // Pastikan ini benar sesuai dengan ekspor kelas di auth.guard.ts

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let router: Router;

  beforeEach(() => {
    const routerMock = { navigate: jasmine.createSpy('navigate') };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard, // Pastikan Anda menyediakan AuthGuard
        { provide: Router, useValue: routerMock } // dan mock Router
      ]
    });

    authGuard = TestBed.inject(AuthGuard); // Injeksi AuthGuard ke dalam variabel
    router = TestBed.inject(Router); // Injeksi Router yang telah di-mock
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should allow the authenticated user to access app', () => {
    spyOn(localStorage, 'getItem').and.returnValue('some_fake_token');
    expect(authGuard.canActivate()).toBeTrue(); // Uji fungsi canActivate ketika token ada
  });

  it('should not allow the unauthenticated user to access app and redirects to login', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(authGuard.canActivate()).toBeFalse(); // Uji fungsi canActivate ketika token tidak ada
    expect(router.navigate).toHaveBeenCalledWith(['/login']); // dan memastikan navigasi ke login
  });
});