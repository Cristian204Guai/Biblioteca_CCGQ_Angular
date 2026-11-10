import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Biblioteca } from '../../services/biblioteca';
import { FormularioLibro } from '../../components/formulario-libro/formulario-libro';

@Component({
  selector: 'app-favoritos',
  imports: [FormsModule, RouterLink, FormularioLibro],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos {
  biblioteca = inject(Biblioteca);
  seleccionadoId: number | null = null;

  agregarExistente() {
    if (this.seleccionadoId !== null) {
      this.biblioteca.alternarFavorito(this.seleccionadoId);
      this.seleccionadoId = null;
    }
  }

}
