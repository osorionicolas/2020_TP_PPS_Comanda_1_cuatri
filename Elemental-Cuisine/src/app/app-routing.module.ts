import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'listado', loadChildren: './pages/lists/lists.module#ListsPageModule' },
  { path: 'registro/:object', loadChildren: './pages/register/register.module#RegisterPageModule' },
  //{ path: 'modificar/:object/:id', loadChildren: './pages/add/add.module#AddPageModule' },
  { path: 'configuracion', loadChildren: './pages/configuration/configuration.module#ConfigurationPageModule' },
  { path: 'lista-de-espera', loadChildren: './pages/wait-list/wait-list.module#WaitListPageModule' },
  { path: 'reservar', loadChildren: './pages/book/book.module#BookPageModule' },
  { path: 'delivery', loadChildren: './pages/delivery/delivery.module#DeliveryPageModule' },
  { path: 'encuestas', loadChildren: './pages/poll/poll.module#PollPageModule' },
  { path: 'encuestas-cliente', loadChildren: './pages/poll-client-list/poll-client-list.module#PollClientListPageModule' },
  { path: 'encuestas-empleado', loadChildren: './pages/poll-employee-list/poll-employee-list.module#PollEmployeeListPageModule' },
  { path: 'juego-cliente', loadChildren: './pages/play-client/play-client.module#PlayClientPageModule' },
  { path: 'hacer-encuesta-cliente', loadChildren: './pages/poll-cliente/poll-cliente.module#PollClientePageModule' },
  { path: 'hacer-encuesta-empleado', loadChildren: './pages/poll-empleoyee/poll-empleoyee.module#PollEmpleoyeePageModule' },
  { path: 'menu', loadChildren: './pages/menu/menu.module#MenuPageModule' }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }