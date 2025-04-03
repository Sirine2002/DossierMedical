import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private router: Router){}
  title = 'projectMedical';
  isLogin:boolean = false;
  ngOnInit(){
    this.router.events.subscribe(()=>{
      this.isLogin = this.router.url.includes('/login');
      console.log('isLogin',this.isLogin)
    })
  }
}
