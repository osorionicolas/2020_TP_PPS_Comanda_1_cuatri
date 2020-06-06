import { Component, OnInit, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { User } from 'src/app/classes/user';
import { QrscannerService } from 'src/app/services/qrscanner.service';
import { CameraService } from 'src/app/services/camera.service';
import { NotificationService } from 'src/app/services/notification.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {

  @Input() isClient:boolean;
  private user:User;
  form: FormGroup;

  constructor(
    private router: Router,
    private userService: UserService,
    private cameraService: CameraService,
    private qrscannerService: QrscannerService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) { 
    this.user = new User();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+[.][a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
      name: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z]+$')
      ])),
      surname: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z]+$')
      ])),
      dni: new FormControl('', Validators.compose([
        Validators.pattern('^[0-9]{8}$'),
        Validators.required
      ])),
    });
  }
 
  validation_messages = {
    'email': [
      { type: 'required', message: 'El correo electrónico es requerido.' },
      { type: 'pattern',  message: 'Ingrese un correo electrónico válido.' }
    ],
    'password': [
      { type: 'required',  message: 'La contraseña es requerida.' },
      { type: 'minlength', message: 'La password debe contener al menos 6 catacteres.' }
    ],
    'name': [
      { type: 'required', message: 'El nombre es requerido.' },
      { type: 'pattern',  message: 'Ingrese un nombre válido.' }
    ],
    'surname': [
      { type: 'required', message: 'La apellido es requerido.' },
      { type: 'pattern',  message: 'Ingrese un apellido válido.' }
    ],
    'dni': [
      { type: 'pattern',   message: 'El DNI debe contener 8 carácteres númericos.' },
      { type: 'required',  message: 'El DNI es requerido.' },
    ]
  };

  register(formValues){ 
    this.formValuesToUser(formValues);
    if(this.isClient){
      this.user.profile = "cliente";
      this.user.status = "sinAtender";
    }
    this.userService.saveUserWithLogin(this.user).then(response =>{
      if(this.isClient){
        this.router.navigateByUrl('/login');
        this.notificationService.presentToast("Espere a que su cuenta sea confirmada", "primary", "middle");
      }
      else{
        this.notificationService.presentToast("Empleado creado", "success", "bottom");
        this.router.navigateByUrl('/listado/usuarios');
      }
    });
  }  

  takePhoto(){
    //Cambiar nombre de la foto (segundo parametro)
    this.cameraService.takePhoto('clientes', Date.now());
  }

  scan(){
    let dniData = this.qrscannerService.scanDni();
    alert(dniData);
  }

  formValuesToUser(formValues){
    this.user.name = formValues.name;
    this.user.surname = formValues.surname;
    this.user.email = formValues.email;
    this.user.password = formValues.password;
    this.user.dni = formValues.dni;
  }

}
