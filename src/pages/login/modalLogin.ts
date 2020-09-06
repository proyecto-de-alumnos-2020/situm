import { Component } from '@angular/core';
import { Platform, ViewController, AlertController, LoadingController, ToastController, ModalController, App } from 'ionic-angular';
import { LoginService } from '../../services/login.service';
import { ModalExitApp } from '../../pages/modalExitApp/modalExitApp';

export class UserModel {
  errorRegister: string;
  errorLogin: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

@Component({
  selector: 'page-modalLogin',
  templateUrl: 'modalLogin.html',
})
export class ModalLogin {
  public unregisterBackButtonAction: any;
  private allowClose = false;
  private dismissing = true;
  private spamming = true;
  private lastBack: number;
  formLogin = true;
  errorRegister = "";
  errorLogin = "";
  userModel: UserModel;
  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private loginService: LoginService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private app: App
  ) {
    this.userModel = new UserModel();
  }

  login() {
    let u = this.userModel;
    let loadingLoggin = this.createLoading("Ingresando...");
    loadingLoggin.present();
    debugger;
    this.loginService.login(u).then(user => {
      this.hideLoading(loadingLoggin);
      debugger;
      if (user.logged) {
        this.errorLogin = "";
        this.dismiss(user);
      } else {
        if (!user.logged) {
          this.errorLogin = user.errorMessage;
        }
      }
    });
  }

  toggleLoginRegistration() {
    this.formLogin = !this.formLogin;
    this.errorRegister = "";
    this.errorLogin = "";
  }

  register() {
    let u = this.userModel;
    let loadingRegister = this.createLoading("Registrando...");
    loadingRegister.present();
    this.loginService.register(u).then(user => {
      this.hideLoading(loadingRegister);
      if (user.registered) {
        this.errorRegister = "";
        this.dismiss(user);
      } else {
        if (!user.registered) {
          this.errorRegister = user.errorMessage;
        }
      }
    });
  }


  formValid() {
    return (this.formComplete() && this.samePassword());
  }

  formComplete() {
    return (this.userModel.email && this.userModel.password
      && this.userModel.passwordConfirmation);
  }

  samePassword() {
    return ((this.userModel.password == this.userModel.passwordConfirmation) &&
      (this.userModel.password != "" && this.userModel.password != null &&
        this.userModel.password != undefined));
  }

  distinctPassword() {
    return ((this.userModel.password != this.userModel.passwordConfirmation) &&
      (this.userModel.password != "" && this.userModel.password != null &&
        this.userModel.password != undefined));
  }

  alertText(aTitle, aSubTitle) {
    let alert = this.alertCtrl.create({
      title: aTitle,
      subTitle: aSubTitle,
      buttons: ['Cerrar']
    });
    alert.present();
  }


  dismiss(user) {
    this.viewCtrl.dismiss(user);
  }


  private hideLoading(loading) {
    if (typeof loading != undefined && typeof loading != null) {
      loading.dismissAll();
      loading = null;
    }
  }

  private createLoading(msg) {
    return this.loadingCtrl.create({
      content: msg
    });
  }

  ionViewDidEnter() {
    this.initializeBackButtonCustomHandler();
  }

  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  public initializeBackButtonCustomHandler(): void {
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
      this.customHandleBackButton();
    }, 10);
  }

  private customHandleBackButton(): void {

    /*const nav = this.app.getActiveNavs()[0];
    const active = nav.getActive();

    let closeDelay = 2000;
    let spamDelay = 500;
    debugger;
    if (active.isOverlay) {
      // Checks if is dismissing something..
      // avoid exceptions if user spams back-button and stack isn't finished dismissing view yet.
      if (!this.dismissing) {
        active.dismiss().then(() => this.dismissing = false);
      }
      this.dismissing = true;
    } else if (((Date.now() - this.lastBack) < closeDelay) &&
      (Date.now() - this.lastBack) > spamDelay) {
      // Leaves app if user pressed button not faster than 500ms a time, 
      // and not slower than 2000ms a time.
      this.platform.exitApp();
    } else {
      if (!this.spamming) { // avoids multiple toasts caused by button spam.
        let t = this.toastCtrl.create({
          message: "Pressione novamente para sair..",
          duration: closeDelay,
          dismissOnPageChange: true
        });
        t.onDidDismiss(() => this.spamming = false);
        t.present();
      }
      this.spamming = true;
    }

    this.lastBack = Date.now();*/
    // do what you need to do here ...

    //this.lastBack = Date.now(); //GUARDO LA ULTIMA VEZ QUE APRETÉ HACIA ATRÁS

    const closeDelay = 2000;
    const spamDelay = 500;
    debugger;
    if (this.lastBack == undefined) {
      this.lastBack = Date.now();
    }
    if (Date.now() - this.lastBack > spamDelay && !this.allowClose) {
      this.allowClose = true;
      let toast = this.toastCtrl.create({
        //message: this.translate.instant("general.close_toast"),
        message: "Doble toque para salir",
        duration: closeDelay,
        dismissOnPageChange: true
      });
      toast.onDidDismiss(() => {
        this.allowClose = false;
      });
      toast.present();
    } else if (Date.now() - this.lastBack < closeDelay && this.allowClose) {
      let modalExitApp = this.modalCtrl.create(ModalExitApp);
      modalExitApp.onDidDismiss(response => {
        if (response) {
          this.platform.exitApp();
        }
      });
      modalExitApp.present();
    }
    this.lastBack = Date.now();

  }

}