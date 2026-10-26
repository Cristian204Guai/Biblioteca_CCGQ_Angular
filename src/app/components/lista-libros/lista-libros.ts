import { Component, inject } from '@angular/core';
import { Biblioteca } from '../../services/biblioteca';

@Component({
  selector: 'app-lista-libros',
  imports: [],
  templateUrl: './lista-libros.html',
  styleUrl: './lista-libros.css',
})
export class ListaLibros {
  biblioteca = inject(Biblioteca)
}

