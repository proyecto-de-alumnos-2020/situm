import { Component, ViewChild } from "@angular/core";
import {
  Platform,
  NavParams,
  ViewController,
  AlertController,
  VirtualScroll,
  Alert,
  ModalController
} from "ionic-angular";
import { Workspace } from "../../services/workspace.service";
import { ModalInformation } from "../modalInformation/modalInformation";

@Component({
  selector: "page-modalWorkspacesList",
  templateUrl: "modalWorkspacesList.html"
})
export class ModalWorkspacesList {
  @ViewChild(VirtualScroll) virtualScroll: VirtualScroll;
  ws: Workspace;
  workspaces: Array<Workspace>;
  tipoWorkspaces: string;
  loggedUser: any;
  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    debugger;
    this.workspaces = this.navParams.get("workspaces");
    this.tipoWorkspaces = this.navParams.get("tipoWorkspaces");
    this.loggedUser = this.navParams.get("loggedUser");
  }

  openWorkspace(aWorkspace) {
    this.dismiss(aWorkspace);
  }

  dismiss(aWorkspace) {
    this.viewCtrl.dismiss(aWorkspace);
  }

  isOwner(aWorkspace) {
    return aWorkspace.idOwner == this.loggedUser.uid;
  }

  openWorkspaceByStatus(aWorkspace) {
    debugger;
    let isOwner = this.isOwner(aWorkspace);
    aWorkspace.status.openWorkspace(this, isOwner, aWorkspace); //STATE PATTERN
  }

  justOwnerCanOpen() {
    this.alertText(
      "No editable",
      "El estado actual del workspace no permite edición."
    );
  }

  alertText(aTitle, aSubTitle) {
    let alert = this.alertCtrl.create({
      title: aTitle,
      subTitle: aSubTitle,
      buttons: ["Cerrar"]
    });
    alert.present();
  }

  showInformation() {
    let modalInformation = this.modalCtrl.create(ModalInformation, {
      cssClass: "modal-not-fullscreen-size"
    });
    modalInformation.present();
  }
}
