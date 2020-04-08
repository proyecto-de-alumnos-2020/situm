import { Component } from '@angular/core';
import { Platform, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-modalInformation',
  templateUrl: 'modalInformation.html',
})
export class ModalInformation {
  timer: any;
  constructor(
    public platform: Platform,
    public viewCtrl: ViewController
  ) {
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
  ionViewDidEnter() {
    this.timer = setTimeout(() => this.dismiss(), 10000);
  }
}
