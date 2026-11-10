import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // maneja rutas de acceso a diferentes paginas
import { Navbar } from './components/navbar/navbar';
//import { ListaLibros } from './components/lista-libros/lista-libros';
//import { FormularioLibro } from './components/formulario-libro/formulario-libro';

@Component({
  selector: 'app-root',
  //imports: [RouterOutlet],
  //imports: [Navbar, ListaLibros, FormularioLibro],
  imports: [ RouterOutlet, Navbar ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  //protected readonly title = signal('biblioteca');
}
