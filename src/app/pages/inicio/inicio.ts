import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListaLibros } from '../../components/lista-libros/lista-libros';
import { FormularioLibro } from '../../components/formulario-libro/formulario-libro';


@Component({
  selector: 'app-inicio',
  imports: [RouterLink, ListaLibros, FormularioLibro ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {

}
