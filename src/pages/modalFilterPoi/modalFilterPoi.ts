import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, ViewController, AlertController, VirtualScroll} from 'ionic-angular';
import { Creator } from '../../services/pois.service';

@Component({
  selector: 'page-modalFilterPoi',
  templateUrl: 'modalFilterPoi.html',
})
export class ModalFilterPoi {
  @ViewChild(VirtualScroll) virtualScroll: VirtualScroll;
  creators: Array<Creator>;
  colorLoco: "#7B1FA2"
  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    private navParams: NavParams,
    private alertCtrl: AlertController
  ) {
    this.creators = this.navParams.get("creators");
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  cancelFilterPois() {
    //console.log("LOS CREADORES SIGUEN IGUAL: " + this.creators);
    this.dismiss();
  }

  acceptFilterPois() {
    //console.log("LOS CREADORES QUIZA CAMBIARON IGUAL: " + this.creators);
    this.viewCtrl.dismiss(this.creators);
  }

  alertText(aTitle, aSubTitle) {
    let alert = this.alertCtrl.create({
      title: aTitle,
      subTitle: aSubTitle,
      buttons: ['Cerrar']
    });
    alert.present();
  }

}