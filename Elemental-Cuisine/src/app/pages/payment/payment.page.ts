import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Order } from 'src/app/classes/order';
import { isNullOrUndefined } from 'util';
import { CurrentAttentionService } from 'src/app/services/currentAttention.service';
import { Categories } from 'src/app/classes/enums/categories';
import { Attention } from 'src/app/classes/attention';
import { QrscannerService } from 'src/app/services/qrscanner.service';
import { NotificationService } from 'src/app/services/notification.service';
import { FcmService } from 'src/app/services/fcmService';
import { Profiles } from 'src/app/classes/enums/profiles';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/classes/user';
import { TableService } from 'src/app/services/table.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {

  private orders: Array<Order> = new Array<Order>();
  private menus: Array<any> = new Array<any>();
  private attention: Attention;
  private freeDrink: any;
  private freeDessert: any;
  private total: number;
  private currentUser: User;
  private tip: number;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private attentionService: CurrentAttentionService,
    private qrScannerService: QrscannerService,
    private notificationService: NotificationService,
    private fcmService: FcmService,
    private userService: UserService,
    private currentAttentionService: CurrentAttentionService,
    private tableService: TableService
  ) { 
    let user = this.authService.getCurrentUser();
    if (isNullOrUndefined(user)) this.router.navigateByUrl("/login");
    const userId = user.uid
    this.userService.getUserById(userId).then(user => this.currentUser = user.data() as User)
    this.orderService.getOrderById(userId).then(orders => {
      this.orders = Object.values(orders.data())
      this.menus = this.orders.map(order => order.menu).flat()
      const totalReducer = (accumulator, order) => accumulator + order.total;
      this.total = this.orders.reduce(totalReducer, 0);
      
      const discountReducer = (prev, curr) => prev.price < curr.price ? prev : curr
      const drinks = this.menus.filter(menu => menu.category == Categories.Drink)
      this.freeDrink = (drinks.length > 0) ? drinks.reduce(discountReducer) : undefined
      const desserts = this.menus.filter(menu => menu.category == Categories.Dessert)
      this.freeDessert = (desserts.length > 0) ? desserts.reduce(discountReducer) : undefined
      this.attentionService.getAttentionById(userId).then(currentAttention => {
        this.attention = currentAttention.data() as Attention;
      })
    });
  }

  ngOnInit() {
  }

  payBill(){
    this.attention.billRequested = true;
    this.attentionService.modifyAttention(this.currentUser.id, this.attention);
    this.notificationService.presentToast("La cuenta ha sido solicitada", "success", "top");
    this.router.navigateByUrl("/inicio");

    Promise.all([this.currentAttentionService.getAttentionById(this.currentUser.id), this.fcmService.getTokensByProfile(Profiles.Waiter)]).then(values => {
      this.tableService.getTableById(values[0].data().tableId).then(table => {
        this.fcmService.sendNotification(
          "Nuevo cuenta solicitada",
          `El cliente ${this.currentUser.name} ${this.currentUser.surname} de la mesa N.° ${table.data().number} ha solicitado su cuenta`,
          values[1]);
      })
    })
  }

  getTotal(){
    const discount = (this.attention && this.attention.discount) ? this.total * 10 / 100 : 0;
    let freeItems = (this.freeDessert && this.freeDessert.price) ? this.freeDessert.price : 0 
    freeItems += (this.freeDrink && this.freeDrink.price) ? this.freeDrink.price : 0;
    const tip = (this.tip) ? (this.total - discount - freeItems) * this.tip / 100 : 0;
    const total = this.total - discount - freeItems + tip;
    return total;
  }

  scanQr(){
    if (this.qrScannerService.device == "mobile") {
      this.qrScannerService.scanQr().then(response => {
        switch (response){
          case "0":
            this.tip = 0;
            break;
          case "5":
            this.tip = 5;
            break;
          case "10":
            this.tip = 10;
            break;
          case "15":
            this.tip = 15;
            break;
          case "20":
            this.tip = 20;
            break;
        }
      });
    }
    else {
      this.tip = 10;
    }
  }

}
