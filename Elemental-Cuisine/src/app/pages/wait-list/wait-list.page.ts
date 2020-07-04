import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Collections } from 'src/app/classes/enums/collections';
import { Status } from 'src/app/classes/enums/Status';
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/classes/user';
import { FcmService } from 'src/app/services/fcmService';
import { NotificationService } from 'src/app/services/notification.service';
import { ModalController } from '@ionic/angular';
import { TableListPage } from '../table-list/table-list.page';
import { TableService } from 'src/app/services/table.service';
import { Attention } from 'src/app/classes/attention';
import { CurrentAttentionService } from 'src/app/services/currentAttention.service';

@Component({
  selector: 'app-wait-list',
  templateUrl: './wait-list.page.html',
  styleUrls: ['./wait-list.page.scss'],
})
export class WaitListPage implements OnInit {

  users: Array<Object>;
  private maitreSelectTable: boolean;

  constructor(
    private userService: UserService,
    private dataService: DataService,
    private fcmService: FcmService,
    private notificationService: NotificationService,
    private modalController: ModalController,
    private tableService: TableService,
    private currentAttentionService: CurrentAttentionService
  ) { }

  ngOnInit() {
    this.dataService.getChanges(Collections.Configurations, "configuracion").subscribe((configs: any) => this.maitreSelectTable = configs.seleccionDeMesaPorMaitre)
    this.userService.getAllUsers(Collections.WaitList).subscribe(clients => {
      this.users = clients.map(client => client.payload.doc.data() as any)
                          .filter(client => new Date(client.date).getDay() == new Date().getDay())
                          .sort((a:any,b:any) => (a.date > b.date) ? -1 : 1);
    });
  }

  private removeClient(user: User, table?){
    this.dataService.deleteDocument(Collections.WaitList,user.id);
    this.dataService.setStatus(Collections.Users, user.id, Status.CanTakeTable).then(() => {
      this.fcmService.getTokensById(user.id).then(userDevice => {
        this.fcmService.sendNotification(
          "El maitre lo ha habilitado para escanear su mesa",
          (table) ? `Su mesa es la N.° ${table.number}` : "Puede escanear la mesa que desee",
          [userDevice]
        )
      })
    });
    this.notificationService.presentToast("El usuario ya puede escanear una mesa", "success", "middle");
  }

  showTables(user: User){
    if(this.maitreSelectTable) this.showModal(user);
    else this.removeClient(user)
  }

  async showModal(user: User): Promise<void> {
    const detailsModal = await this.modalController.create({
      component: TableListPage,
      componentProps: { isMaitre: true }
    });
    detailsModal.onDidDismiss().then((response) => {
      if(response.data){
        const table = response.data;
        this.removeClient(user, table);
        this.dataService.setStatus(Collections.Tables, table.id, Status.Busy);
        var attention = new Attention(table.id);
        this.currentAttentionService.saveAttention(user.id, attention);
      }
    });
    return await detailsModal.present();
  }
}
