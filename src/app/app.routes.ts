import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game.component';
import { PlatformComponent } from './components/platform/platform.component';
import { RentalComponent } from './components/rental/rental.component';
import { RoomComponent } from './components/room/room.component';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuard } from './auth.guard';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'game', component: GameComponent, canActivate: [AuthGuard] },
    { path: 'platform', component: PlatformComponent, canActivate: [AuthGuard] },
    { path: 'rental', component: RentalComponent, canActivate: [AuthGuard] },
    { path: 'room', component: RoomComponent, canActivate: [AuthGuard] },
    { path: 'auth', component: AuthComponent },
    { path: 'register', component: RegisterComponent},
    { path: '**', redirectTo: 'auth'},
];