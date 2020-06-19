import { Status } from 'src/app/classes/enums/status';
import { DataService } from 'src/app/services/data.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/classes/user';
import { UserService } from 'src/app/services/user.service';
import { AlertController } from '@ionic/angular';
import { CameraService } from 'src/app/services/camera.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  private email: string;
  private password: string;
  private photoName: string = "";
  form: FormGroup;
  defaultUsers: Array<any> = [];
  user: User;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private cameraService: CameraService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.addDefaultUser();
    this.form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
    });
  }

  validation_messages = {
    'email': [
      { type: 'required', message: 'El email es requerido.' },
      { type: 'pattern', message: 'Ingrese un email válido.' }
    ],
    'password': [
      { type: 'required', message: 'La contraseña es requerida.' },
      { type: 'minlength', message: 'La password debe contener al menos 6 catacteres.' }
    ]
  };

  addDefaultUser() {
    this.defaultUsers.push({ "email": "admin@admin.com", "password": "123456" });
    this.defaultUsers.push({ "email": "cliente@cliente.com", "password": "123456" });
    this.defaultUsers.push({ "email": "mozo@mozo.com", "password": "123456" });
    this.defaultUsers.push({ "email": "maitre@maitre.com", "password": "123456" });
    this.defaultUsers.push({ "email": "bartender@bartender.com", "password": "123456" });
    this.defaultUsers.push({ "email": "cocinero@cocinero.com", "password": "123456" });
    this.defaultUsers.push({ "email": "anonimo@anonimo.com", "password": "123456" });
  }

  setDefaultUser() {
    this.onSubmitLogin(this.user);
  }

  onSubmitLogin(form) {
    this.loadingService.showLoading("Espere...");
    this.authService.logIn(form.email, form.password)
      .then(res => {

        // Verificamos si está aprobado
        this.userService.getUserById(this.authService.getCurrentUser().uid).then(user => {
          if (user.data().profile === 'cliente' && user.data().status === 'pendienteAprobacion') {
            this.authService.logOut();
            this.loadingService.closeLoading("Atención", "Su cuenta aún no fue aprobada. Aguarde un momento por favor e intente nuevamente. Gracias", 'info');
          } else {
            this.loadingService.closeLoadingAndRedirect("/home");
          }
        });
      })
      .catch(err => {
        this.loadingService.closeLoading("Error", "Verifique usuario y contraseña", 'error');
      });
  }

  async anonymousLogin(event) {
    event.stopPropagation();
    var photoName = "";

    const alert = await this.alertController.create({
      header: 'Ingresar como Anónimo',
      message: 'Al ingresar como anónimo, muchas funcionalidades no estarán disponibles.',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de Usuario',
        }
      ],
      buttons: [
        {
          text: 'Sacar Foto',
          handler: (inputs) => {
            this.takePhoto(inputs.name);
            return false;
          }
        },
        {
          text: 'Registrar',
          handler: (inputs) => {
            this.registerAnonymous(inputs.name)
            return false;
          }
        }
      ]
    });
    alert.present();
    return alert.onDidDismiss().then(() => {
      this.photoName = "";
    })
  }

  googleLogin() {
    this.authService.googleSignIn().then(googleResponse => {
      this.userService.getUserById(googleResponse.uid).then(user => {

        if (!user.exists) {
          var newUser: User = {
            id: googleResponse.uid,
            email: googleResponse.email,
            password: null,
            profile: "cliente",
            name: googleResponse.displayName.split(" ")[0],
            surname: googleResponse.displayName.split(" ")[1],
            photo: googleResponse.photoURL,
            status: "sinAtender",
            dni: null,
            cuil: null
          }

          this.userService.saveUser(newUser);
        }

        this.router.navigateByUrl('/inicio');
      })
    }).catch(error => {
      console.log(error);
    })
  }

  facebookLogin() {
    this.authService.facebookSigin().then(facebookResponse => {
      this.userService.getUserById(facebookResponse.uid).then(user => {

        if (!user.exists) {
          var newUser: User = {
            id: facebookResponse.uid,
            email: facebookResponse.email,
            password: null,
            profile: "cliente",
            name: facebookResponse.displayName.split(" ")[0],
            surname: facebookResponse.displayName.split(" ")[1],
            photo: facebookResponse.photoURL,
            status: "sinAtender",
            dni: null,
            cuil: null
          }

          this.userService.saveUser(newUser);
        }

        this.router.navigateByUrl('/inicio');
      })
    }).catch(error => {
      console.log(error);
    });
  }

  async takePhoto(name) {
    if (name != "") {
      name = `${name}-${Date.now()}`;
      this.loadingService.showLoading("Espere...");
      await this.cameraService.takePhoto('usuarios', name).then(() => {
        this.loadingService.closeLoading();
        this.photoName = name;
      });
    }
    else {
      this.notificationService.presentToast("Primero ingrese el nombre.", "danger", "bottom");
    }
  }

  registerAnonymous(name) {
    if (this.photoName != "" && name != "") {
      var random = Math.floor(Math.random() * (999 - 1)) + 1;
      var newUser: User = {
        id: "",
        email: name + "-" + random + "@anonymous.com",
        password: "123456",
        profile: "cliente",
        name: name,
        surname: name,
        photo: this.photoName,
        status: "sinAtender",
        dni: null,
        cuil: null,
        anonymous: true
      }

      this.userService.saveUserWithLogin(newUser).then(() => {
        this.alertController.dismiss();
        this.router.navigateByUrl('/inicio');
      });
    }
    else {
      this.notificationService.presentToast("Falta ingresar nombre o sacar la foto.", "danger", "bottom", false);
    }
  }
}
