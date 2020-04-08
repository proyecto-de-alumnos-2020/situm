import { Component } from '@angular/core';
import { Platform, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Poi } from '../../services/pois.service';

@Component({
  selector: 'page-modal',
  templateUrl: 'modalQR.html',
})

export class QRCodePage {
  public poi: Poi;
  constructor(
    public platform: Platform,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    private navParams: NavParams
  ) {
    // assign a value
    this.poi = this.navParams.data;
  }

  dismissQRCode() {
    this.viewCtrl.dismiss();
  }
}