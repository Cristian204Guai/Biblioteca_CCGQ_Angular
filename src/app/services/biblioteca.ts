import { Injectable, computed, signal } from '@angular/core';
import { Libro } from '../models/libro';

@Injectable({
  providedIn: 'root',
})
export class Biblioteca {
  private readonly _libros = signal<Libro[]>([
    {id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel Garcia Marquez', anio: 1967, disponible: true, favorito: false},
    {id: 2, titulo: 'Dracula', autor: 'Bram Stoker', anio: 1850, disponible: false, favorito: false} ,
  ]);
  
  readonly libros = this._libros.asReadonly();
  readonly total = computed(() => this._libros().length);

  // Favoritos
  readonly favoritos = computed(() => this._libros().filter(l => l.favorito));
  readonly noFavoritos = computed(() => this._libros().filter(l => !l.favorito));

  agregar(datos: Omit<Libro, 'id' | 'disponible' | 'favorito'>, favorito = false) {
    const nuevo: Libro = { ...datos, id: Date.now(), disponible: true, favorito};
    this._libros.update(lista => [...lista, nuevo]); 
  }

  alternarDisponibilidad(id:number) {
    this._libros.update(lista =>
      lista.map(l => (l.id === id ? { ...l, disponible: !l.disponible } :l))
    );
  }

  alternarFavorito(id:number) {
    this._libros.update(lista =>
      lista.map(l => (l.id === id ? { ...l, favorito: !l.favorito} : l))
    );
  }

  eliminar(id:number) {
    this._libros.update(lista => lista.filter(l => l.id !== id));
  }
}
