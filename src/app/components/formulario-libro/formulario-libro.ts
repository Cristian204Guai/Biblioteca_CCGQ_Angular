import { Component, inject, input} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Biblioteca } from '../../services/biblioteca';


@Component({
  selector: 'app-formulario-libro',
  imports: [FormsModule],
  templateUrl: './formulario-libro.html',
  styleUrl: './formulario-libro.css',
})
export class FormularioLibro {
  private biblioteca = inject(Biblioteca);

  esFavorito = input(false);

  titulo = '';
  autor = '';
  anio = new Date().getFullYear();

  guardar(){
    this.biblioteca.agregar({
      titulo: this.titulo.trim(),
      autor: this.autor.trim(),
      anio: this.anio,
      
    }, this.esFavorito());
    this.titulo = '';
    this.autor = '';
  }
}

