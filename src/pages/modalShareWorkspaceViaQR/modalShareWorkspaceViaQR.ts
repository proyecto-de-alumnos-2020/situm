import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, ViewController, AlertController, ModalController, Slides } from 'ionic-angular';
import { Workspace } from '../../services/workspace.service';
@Component({
  selector: 'page-modalShareWorkspace',
  templateUrl: 'modalShareWorkspaceViaQR.html',
})

export class ShareWorkspaceViaQR {
  @ViewChild(Slides) slides: Slides;
  public workspace: Workspace;
  private stringToSearchWorkspace: string;
  private coloursList;
  private selectedUserColor: string;
  private colorClass;
  private mostrarQR;
  private indexColor;
  constructor(
    public platform: Platform,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    private navParams: NavParams,
    private modalCtrl: ModalController,
  ) {

    this.coloursList =  ["#2E7D32", "#7B1FA2", "#283593", "#F44336", "#66BB6A", "#F06292", "#304FFE", "#1576C9", "#860000",
    "#424250", "#FF7043", "#000000", "#9E9E9E", "#FF6D00", "#E040FB"];
    
    this.indexColor = 1;
    this.mostrarQR = false;
    this.workspace = this.navParams.data;

  }
  dismissQRCode() {
    this.viewCtrl.dismiss();
  }

  alertText(aTitle, aSubTitle) {
    let alert = this.alertCtrl.create({
      title: aTitle,
      subTitle: aSubTitle,
      buttons: ['Cerrar']
    });
    alert.present();
  }

  hideQR() {
    this.mostrarQR = false;
  }

  showQR() {
    this.mostrarQR = true;
    this.stringToSearchWorkspace = this.workspace.idOwner + " " + this.workspace.idWorkspace.toString() + " " + this.coloursList[this.indexColor];
  }

  slideChanged() {
    this.indexColor = this.slides.getActiveIndex();
    this.mostrarQR = false;
  }

  nextSlide() {
    debugger;
    this.slides.slideNext(0.2);
    this.slideChanged();
  }

  previousSlide() {
    debugger;
    this.slides.slidePrev(0.2);
    this.slideChanged();
  }
} 