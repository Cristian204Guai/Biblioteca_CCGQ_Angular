import { Component, inject } from '@angular/core';
// se agrega RouterLink para manejo de stacked widget
import { RouterLink } from '@angular/router';
import { Biblioteca } from '../../services/biblioteca'; 



@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  biblioteca = inject(Biblioteca)

}
