import { Component, OnInit, Input } from '@angular/core';
import { Product } from 'src/app/classes/product';
import { ModalController } from '@ionic/angular';
import { CameraService } from 'src/app/services/camera.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Order } from 'src/app/classes/order';
import { User } from 'src/app/classes/user';
import { Profiles } from 'src/app/classes/enums/profiles';

class OrderWithUser {
  id: string;
  index: number;
  order: Order = new Order();
  user: User = new User();
  profile: string;
  currentTable: number;
  type: OrderType
}

enum OrderType {
  OnlyFood = "Solo comidas",
  OnlyDrinks = "Solo bebidas",
  TheTwo = "Comidas y Bebidas"
}


@Component({
  selector: 'app-order-detail-employees',
  templateUrl: './order-detail-employees.component.html',
  styleUrls: ['./order-detail-employees.component.scss'],
})
export class OrderDetailEmployeesComponent implements OnInit {

  @Input() public orderWithUser: OrderWithUser;
  private photos: string[];
  private quantity = 1;
  Profiles = Profiles;

  slideOpts = {
    slidesPerView: 1,
    centeredSlides: true,
    spaceBetween: 15,
  };

  constructor(
    private modalController: ModalController,
    private cameraService: CameraService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
      this.loadingService.closeLoading(undefined, undefined, undefined, 1000);
      console.log(this.orderWithUser);
  }



  increment () {
    this.quantity++;
  }
  
  decrement () {
    if(this.quantity > 1)
      this.quantity--;
  }

  dismiss(isClosed): void {
    if(isClosed){
      this.modalController.dismiss();
    }
    else{
      this.modalController.dismiss(this.quantity);
    }
  }
}

