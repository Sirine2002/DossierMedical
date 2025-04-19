import { ViewportScroller } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/Services/auth-service.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isLogin: boolean = false;
  username: string | null = null;
  userrole: string | null = localStorage.getItem('userRole');
  isScrolled = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.isLogin = true;
        const uid = user.uid;
        this.db.object<any>(`users/${uid}`).valueChanges().subscribe(profile => {
          if (profile) {
            this.username = `${profile.firstName} ${profile.lastName}`;
          }
        });
      } else {
        this.isLogin = false;
        this.username = null;
      }
    });
  }

  logout() {
    this.authService.signOut();
  }

  ModifierProfile() {
    this.router.navigate(['/profile']);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 30;
  }

  scrollToSection(sectionId: string) {
    this.viewportScroller.scrollToAnchor(sectionId);
  }
}
