import { Component, HostListener } from '@angular/core';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-nav-bar-home',
  templateUrl: './nav-bar-home.component.html',
  styleUrls: ['./nav-bar-home.component.css']
})
export class NavBarHomeComponent {
  isScrolled = false;
  constructor(private viewportScroller: ViewportScroller) {}

  @HostListener('window:scroll', [])
    onWindowScroll() {
      this.isScrolled = window.scrollY > 50;
    }
    scrollToSection(sectionId: string) {
      this.viewportScroller.scrollToAnchor(sectionId);
    }
}