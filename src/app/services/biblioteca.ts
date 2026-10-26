import { Injectable, computed, signal } from '@angular/core';
import { Libro } from '../models/libro';

@Injectable({
  providedIn: 'root',
})
export class Biblioteca {
  private readonly _libros = signal<Libro[]>([
    {id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel Garcia Marquez', anio: 1967, disponible: true},
    {id: 2, titulo: 'Dracula', autor: 'Bram Stoker', anio: 1850, disponible: false} ,
  ]);
  
  readonly libros = this._libros.asReadonly();
  readonly total = computed(() => this._libros.length);

  agregar(datos: Omit<Libro, 'id' | 'disponible'>) {
    const nuevo: Libro = { ...datos, id: Date.now(), disponible: true};
    this._libros.update(lista => [...lista, nuevo]); 
  }

  alternarDisponibilidad(id:number) {
    this._libros.update(lista =>
      lista.map(l => (l.id === id ? { ...l, disponible: !l.disponible } :l))
    );
  }

  eliminar(id:number) {
    this._libros.update(lista => lista.filter(l => l.id !== id));
  }
}
