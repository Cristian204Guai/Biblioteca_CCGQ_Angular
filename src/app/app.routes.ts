import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Favoritos } from './pages/favoritos/favoritos';

export const routes: Routes = [
    { path: '', component: Inicio},
    { path: 'favoritos', component: Favoritos},
    {path: '**', redirectTo: ''}
];
