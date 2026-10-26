import { Component, inject } from '@angular/core';
import { Biblioteca } from '../../services/biblioteca'; 



@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  biblioteca = inject(Biblioteca)

}
