import { ViewportScroller } from '@angular/common';
import { Component, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/Services/auth-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

 isLogin:boolean = false;
 username:string | null=localStorage.getItem('username');
 userrole:string | null=localStorage.getItem('userRole');

 constructor(private authService: AuthService, private router:Router,private viewportScroller: ViewportScroller) {}

 logout() {
   this.authService.signOut();
 }
 ModifierProfile(){
  this.router.navigate(['/profile']);
}
 isScrolled = false;

  @HostListener('window:scroll', [])
    onWindowScroll() {
      this.isScrolled = window.scrollY > 30;
    }
    scrollToSection(sectionId: string) {
      this.viewportScroller.scrollToAnchor(sectionId);
    }

 }