import { Component, OnInit, Input } from '@angular/core';
import { Table } from 'src/app/classes/table';
import { TableService } from 'src/app/services/table.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Status } from 'src/app/classes/enums/Status';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.page.html',
  styleUrls: ['./table-list.page.scss'],
})
export class TableListPage implements OnInit {

  @Input() isMaitre: boolean = false;
  private tables: Array<Table>;
  private availableTables: Array<Table>;

  constructor(
    private tableService: TableService,
    public modalController: ModalController,
    private router: Router
  ) {
    this.tableService.getAllTables().subscribe(tables => {
      this.tables = tables.map(tableAux => {
        let table = tableAux.payload.doc.data() as Table
        table.id = tableAux.payload.doc.id;
        return table;
      });
      this.tables.sort((a,b) => a.number - b.number)
      this.availableTables = this.tables.filter(table => table.status == Status.Available);
    });
  }

  ngOnInit() {
  }

  deleteTable(table) {
    event.stopPropagation();
    this.tableService.deleteTable(table.id);
  }

  modifyTable(event, table) {
    event.stopPropagation();
    this.router.navigateByUrl(`/modificar/mesa/${table.id}`)
  }

  routerToLink() {
    this.router.navigateByUrl("/registro/mesa");
  }

  dismiss(table?){
    if(table)
      this.modalController.dismiss(table);
    else
      this.modalController.dismiss();
  }
}
