import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/classes/product';
import { AlertController } from '@ionic/angular';
import { CameraService } from 'src/app/services/camera.service';
import { Status } from 'src/app/classes/enums/status';
import { Order } from 'src/app/classes/order';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  private products: Array<Product>;
  private order = new Order();
  @Output() sendOrder: EventEmitter<Order> = new EventEmitter<Order>();

  slideOpts = {
    slidesPerView: 1,
    spaceBetween: 10,
    centeredSlides: true
  };

  constructor(
    private productService: ProductService,
    private alertController: AlertController,
    private cameraService: CameraService,
  ) { 
    this.productService.getAllProducts().subscribe(products => {
      this.products = products.map(productAux => {
        let product = productAux.payload.doc.data() as Product;
        product.id = productAux.payload.doc.id;
        return product;
      });    
    });
  }


  ngOnInit() {
  }

  showDetails(product: Product){
    this.showAlert(product).then(response => {
      var quantity = (response.data) ? parseInt(response.data.quantity) : null;
      if(quantity){
        this.order.menu.push({...product, quantity: quantity});
        this.order.total += product.price * quantity;
        this.order.status = Status.Pending;
      }
    });
  }

  async showAlert(product: Product) {
   /* let slide = '<ion-slides [options]="slideOpts" [pager]="true">' +
                  '<ion-slide>' +
                    '<ion-item>' +
                      '<ion-label>Subida por</ion-label>' +
                      //'<img src={{image.url}}>' +
                    '<ion-item>' +
                  '</ion-slide>' +
                '</ion-slides>'*/
    let message = "<div>" +
                    `<ion-label>${product.description}</ion-label>`;
    //message += slide;
    message += (product.photos.length > 0) ? 
                    `<img src="${await this.cameraService.getImageByName('productos', product.photos[0])}" style="bmenu-radius: 2px">` : 
                      "" + 
                  "</div>"

    const alert = await this.alertController.create({
      header: product.name,
      subHeader: `$${product.price}`,
      message: message,
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          placeholder: 'Cantidad de unidades'
        }
      ],
      buttons: [
        {
          text: 'Agregar al pedido',
          handler: (input) => {
            alert.dismiss(input);
            return false;
          }
        },
        {
          text: 'Cancelar',
          handler: () => {
            alert.dismiss(false);
            return false;
          }
        }
      ]
    });
    alert.present();
    return alert.onDidDismiss().then((data) => {
      return data;
    })
  }

  sendMenu(){
    this.sendOrder.emit(this.order);
  }

}