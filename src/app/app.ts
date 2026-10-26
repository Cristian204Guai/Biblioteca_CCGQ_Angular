import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { ListaLibros } from './components/lista-libros/lista-libros';
import { FormularioLibro } from './components/formulario-libro/formulario-libro';

@Component({
  selector: 'app-root',
  //imports: [RouterOutlet],
  imports: [Navbar, ListaLibros, FormularioLibro],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('biblioteca');
}
