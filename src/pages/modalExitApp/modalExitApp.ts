import { Component } from '@angular/core';
import { Platform, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-modalExitApp',
  templateUrl: 'modalExitApp.html',
})

export class ModalExitApp {
  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
  ) {
  }

  dismiss(anAnswer) {
    this.viewCtrl.dismiss(anAnswer);
  }

  answer(anAnswer) {
    this.dismiss(anAnswer);
  }


}