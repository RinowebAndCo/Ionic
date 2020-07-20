import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth/authGuard.service';

const routes: Routes = [
 
  {
    path: 'sign-in',
    loadChildren: () => import('./auth/sign-in.module').then( m => m.SignInPageModule)
  },
  {
    path: 'tabs',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path:'',
    redirectTo:'tabs',
    pathMatch: 'full'
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
