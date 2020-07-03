import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { WaitListPage } from './wait-list.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { TableListPage } from '../table-list/table-list.page';

const routes: Routes = [
  {
    path: '',
    component: WaitListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [WaitListPage],
  entryComponents: [TableListPage]
})
export class WaitListPageModule {}
