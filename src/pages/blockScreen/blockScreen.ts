import { Component, ViewChild } from '@angular/core';
import {
  Platform,
  ViewController,
  Events,
  ToastController,
} from 'ionic-angular';

@Component({
  selector: 'page-blockScreen',
  templateUrl: 'blockScreen.html',
})
export class BlockScreenPage {
  @ViewChild('input') inputDesbloqueo;

  public unregisterBackButtonAction: any;
  private allowClose = false;

  private lastBack: number;
  private codigo = '';
  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    public events: Events,
    private toastCtrl: ToastController
  ) {}

  desbloquear() {
    if (this.codigo == 'c2Pdtm19') {
      this.dismiss();
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.inputDesbloqueo.setFocus();
    }, 150);
    this.initializeBackButtonCustomHandler();
  }

  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  public initializeBackButtonCustomHandler(): void {
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(
      () => {
        this.customHandleBackButton();
      },
      10
    );
  }

  private customHandleBackButton(): void {
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
        message: 'Doble toque para salir',
        duration: closeDelay,
        dismissOnPageChange: true,
      });
      toast.onDidDismiss(() => {
        this.allowClose = false;
      });
      toast.present();
    } else if (Date.now() - this.lastBack < closeDelay && this.allowClose) {
      this.platform.exitApp();
    }
    this.lastBack = Date.now();
  }
}
