import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule
  ],
  template: `
    <div class="layout-container">
      <mat-toolbar color="primary" class="toolbar">
        <span>Minha Saúde Feminina - Admin</span>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/articles" routerLinkActive="active">
              <mat-icon matListItemIcon>article</mat-icon>
              <span matListItemTitle>Artigos</span>
            </a>
            <a mat-list-item routerLink="/categories" routerLinkActive="active">
              <mat-icon matListItemIcon>category</mat-icon>
              <span matListItemTitle>Categorias</span>
            </a>
            <a mat-list-item routerLink="/tags" routerLinkActive="active">
              <mat-icon matListItemIcon>label</mat-icon>
              <span matListItemTitle>Tags</span>
            </a>
            <a mat-list-item routerLink="/life-phases" routerLinkActive="active">
              <mat-icon matListItemIcon>timeline</mat-icon>
              <span matListItemTitle>Fases de Vida</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;
    }

    .sidenav {
      width: 250px;
    }

    .content {
      padding: 24px;
    }

    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class LayoutComponent {}
