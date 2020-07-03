
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterPipe } from './filter.pipe';

@NgModule({
    declarations: [FilterPipe],
    exports: [FilterPipe],
    imports: [CommonModule]
})
export class PipesModule { }