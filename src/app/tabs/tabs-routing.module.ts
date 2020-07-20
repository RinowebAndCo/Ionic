import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
       {
        path: '',
        redirectTo: 'photo',
        pathMatch: 'full'
      },
      {
        path: 'photo',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../photo/photo.module').then(m => m.PhotoPageModule)
          }
        ]
      },
      {
        path: 'profil',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../profil/profil.module').then(m => m.ProfilPageModule)
          }
        ]
      },
    ]
  },
  {
    path: 'tabs',
    redirectTo: 'photo',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
