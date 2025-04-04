import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private router: Router){}
  title = 'projectMedical';
  isLogin:boolean = false;
  
  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) // Ne capture que les fins de navigation
    ).subscribe((event: any) => {
      this.isLogin =((event.url.includes('/login'))||(event.url.includes('/register'))); // Vérifie si l'URL contient '/login'
      console.log('isLogin:', this.isLogin);
    });
  }
}
