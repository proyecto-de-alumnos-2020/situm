import { Component, ViewChild } from '@angular/core';
import {
  Platform,
  NavParams,
  ViewController,
  AlertController,
  Slides,
} from 'ionic-angular';
import {
  Workspace,
  EdicionDelCreador,
  RecorridoLineal,
  CrearLugaresRelevantes,
} from '../../services/workspace.service';
@Component({
  selector: 'page-newWorkspace',
  templateUrl: 'modalNewWorkspace.html',
})
export class ModalNewWorkspace {
  @ViewChild(Slides) slides: Slides;
  public indexColour;
  public coloursList;
  public edificaciones;
  public kindOfWorkspace: any;

  newWorkspace: Workspace;
  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public alertCtrl: AlertController
  ) {
    this.edificaciones = this.navParams.data;
    debugger;
    this.newWorkspace = new Workspace();
    this.newWorkspace.idWorkspace = Date.now();
    this.newWorkspace.collaborators = new Array<string>();
    this.newWorkspace.status = new EdicionDelCreador();

    this.coloursList = [
      '#2E7D32',
      '#7B1FA2',
      '#283593',
      '#F44336',
      '#66BB6A',
      '#F06292',
      '#304FFE',
      '#1576C9',
      '#860000',
      '#424250',
      '#FF7043',
      '#000000',
      '#9E9E9E',
      '#FF6D00',
      '#E040FB',
    ];
  }

  public acceptAddWorkspace() {
    //FORZAR A APLICACIÓN TIPO LIBRE:
    debugger;
    this.kindOfWorkspace = 'CrearLugaresRelevantes';
    this.newWorkspace.kind = this.getKind(this.kindOfWorkspace);
    this.viewCtrl.dismiss(this.newWorkspace);
  }

  public getKind(aStringKindClass) {
    //DEBERÍA SER POR REFLECTION
    switch (aStringKindClass) {
      case 'CrearLugaresRelevantes': {
        return new CrearLugaresRelevantes();
      }
      case 'RecorridoLineal': {
        return new RecorridoLineal();
      }
    }
  }

  public slideChanged() {
    this.indexColour = this.slides.getActiveIndex();
    //this.alertText("id del slide: ", this.coloursList[this.indexColour]);
    this.newWorkspace.applicationColour = this.coloursList[this.indexColour];
  }

  public cancelAddWorkspace() {
    this.viewCtrl.dismiss(undefined);
  }

  public isValidName() {
    return this.newWorkspace.name != '' && this.newWorkspace.name != undefined;
  }
  public buildingSelected() {
    return (
      this.newWorkspace.buildingIdentifier != '' &&
      this.newWorkspace.buildingIdentifier != undefined
    );
  }
  public kindOfWorkspaceSelected() {
    return this.kindOfWorkspace != '' && this.kindOfWorkspace != undefined;
  }

  public isComplete() {
    return (
      this.isValidName() &&
      this.buildingSelected() &&
      this.kindOfWorkspaceSelected()
    );
  }

  alertText(aTitle, aSubTitle) {
    let alert = this.alertCtrl.create({
      title: aTitle,
      subTitle: aSubTitle,
      buttons: ['Cerrar'],
    });
    alert.present();
  }
}
