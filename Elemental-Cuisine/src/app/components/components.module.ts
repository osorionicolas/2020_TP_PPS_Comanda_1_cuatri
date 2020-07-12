import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MenuComponent } from './menu/menu.component';
import { CommonModule } from '@angular/common';
import { FeedbackComponent } from './feedback/feedback.component';
import { CustomHeaderComponent } from './custom-header/custom-header.component';
import { TableListPage } from '../pages/table-list/table-list.page';
import { ProductDetailsComponent } from './product-details/product-details.component';

@NgModule({
    declarations: [MenuComponent, FeedbackComponent, CustomHeaderComponent, TableListPage, ProductDetailsComponent],
    exports: [MenuComponent, FeedbackComponent, CustomHeaderComponent, TableListPage, ProductDetailsComponent],
    imports: [IonicModule, CommonModule]
})
export class ComponentsModule { }