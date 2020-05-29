import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/classes/product';
import { CameraService } from 'src/app/services/camera.service';
import { ProductService } from 'src/app/services/product.service';
import { QrscannerService } from 'src/app/services/qrscanner.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {

  private product:Product;

  constructor(
    private cameraService: CameraService,
    private productService: ProductService,
    private qrscannerService: QrscannerService,
    private notificationService: NotificationService,
    private router: Router
  ) { 
    this.product = new Product();
  }

  ngOnInit() {}

  register(){ 
    this.productService.saveProduct(this.product).then(() => {
      this.notificationService.presentToast("Producto creado", "success", "bottom", false);
      this.router.navigateByUrl('/listado/productos');
    });
  }  

  takePhoto(){
    //Cambiar nombre de la foto (segundo parametro)
    this.cameraService.takePhoto('productos', Date.now());
  }

  scan(){
    let data = this.qrscannerService.scanDni();
    alert(data);
  }
}