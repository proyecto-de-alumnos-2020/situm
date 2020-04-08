import { Component } from '@angular/core';
import { Platform, NavParams, ViewController } from 'ionic-angular';
import { Poi } from '../../services/pois.service';

@Component({
  selector: 'page-modalDeletePoi',
  templateUrl: 'modalDeletePoi.html',
})

export class ModalDeletePOI {
  poi:Poi;
  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    private navParams: NavParams
  ) {
    this.poi = this.navParams.get("poi");
  }

  dismiss(anAnswer) {
    this.viewCtrl.dismiss(anAnswer);
  }

  answer(anAnswer){
    this.dismiss(anAnswer);
  }

  
}