import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, NavParams, ViewController, AlertController, ModalController, Events, LoadingController } from 'ionic-angular';
import { ModalDeletePOI } from '../modalDeletePoi/modalDeletePoi';
import { PoisService, Poi } from '../../services/pois.service';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace, EdicionDelCreador, EdicionColaborativa, EdicionDelCreadorVersionFinal, VersionFinalPublica } from '../../services/workspace.service';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner'; //lee QR



@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalContentPage {
  poi: Poi;
  editedPoi: Poi;
  icon;
  character;
  colorString;
  workspace: Workspace;
  visible: boolean;
  editionMode: boolean;
  loadingSave: any;
  userLogged: any;
  options: any;
  statusString: string;
  isWorkspaceOwner: boolean;
  mustShowEditAndDelete: boolean;
  mustShowSwitchPoiVisibility: boolean;
  qrOptionSelected: any;
  qrAutorizado: boolean;
  ionApp: any;
  pageModal: any;
  ionModal: any;
  modelQRPoi: string;
  loggedUser: any;
  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private poisService: PoisService,
    private workspaceService: WorkspaceService,
    private qrScanner: QRScanner,
    private zone: NgZone,
    public events: Events,
    public loadingCtrl: LoadingController,
  ) {
    this.editionMode = false;
    this.poi = this.navParams.get("poi");
    this.editedPoi = Object.assign({}, this.poi);
    this.workspace = this.navParams.get("workspace");
    this.userLogged = this.navParams.get("userLogged");
    this.options = ["Usando WLAN", "Nuevo QR", "QR Existente"];
    this.colorString = this.poi.colour.substring(1);
    this.statusString = this.workspace.status.idStatus;
    this.isWorkspaceOwner = this.isOwner();
    this.showEditAndDelete();
    this.showSwithPoiVisibility();
    if(this.workspace.status.idStatus!= "VersionFinalPublica"){
      if (this.poi.hasQRCode) {
        this.icon = "assets/img/" + "pinPoiQR" + this.colorString + ".png";
      } else {
        this.icon = "assets/img/" + "pinPoi" + this.colorString + ".png";
      }
    }else{
      if (this.poi.hasQRCode) {
        this.icon = "assets/img/" + "pinPoiQR" + this.workspace.applicationColour.substring(1) + ".png";
      } else {
        this.icon = "assets/img/" + "pinPoi" + this.workspace.applicationColour.substring(1) + ".png";
      }
    }
    
    this.workspaceService.subscribeToWorkspaceStateChangesFromModal(this.workspace, this);
  }
  public unregisterBackButtonAction: any; //Boton hacia atrás


  navigateToPoi() {
    this.viewCtrl.dismiss(this.poi);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  deletePoi() { //STATE PATTERN
    let modalDeletePoi = this.modalCtrl.create(ModalDeletePOI, { cssClass: 'modal-not-fullscreen-size', poi: this.poi });
    modalDeletePoi.onDidDismiss(response => {
      if (response) { //BORRARÁ SÓLO SI EL ESTADO LO DEJA
        this.workspace.status.deletePoi(this, this.isOwner(), this.poi);
      }
    });
    modalDeletePoi.present();
  }

  deleteFromFirebase(aPoi) {
    this.poisService.deletePoi(aPoi).then(result => {
      if (result) {
        this.events.publish("disposeMarker", this.poi);
        this.dismiss();
      } else {
        this.alertText("ERROR", "Se produjo un error al eliminar el PoI. Intente nuevamente.");
      }
    });
  }

  justOwnerCanDelete() {
    this.alertText("No se puede eliminar", "Solo se permite que el propietario del workspace realice modificaciones.");
  }

  justOwnerCanEdit() {
    this.alertText("No se puede editar", "Solo se permite que el propietario del workspace realice modificaciones.");
  }

  cantDelete() {
    this.alertText("No se puede eliminar", "El propietario ha cerrado el workspace y no admite modificaciones.");
  }

  cantEdit() {
    this.alertText("No se puede editar", "El propietario ha cerrado el workspace y no admite modificaciones.");
  }

  changePoiVisual(visible) {
    this.poisService.updatePoiVisibility(this.poi, this.workspace, visible).then(response => {
      if (!response) {
        this.alertText("ERROR", "Hubo un error al intentar cambiar la visibilidad del POI. Intente nuevamente.");
      }
    });
  }

  public scanToUseExistingQR() {
    // Optionally request the permission early
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          this.qrAutorizado = true;
          this.inicializarSalidaHaciaAtras();
          this.ionApp = <HTMLElement>document.getElementsByTagName("ion-app")[0];
          this.pageModal = <HTMLElement>document.getElementsByTagName("page-modal")[0];
          this.ionModal = <HTMLElement>document.getElementsByTagName("ion-modal")[0];
          this.ionApp.style.opacity = "0";
          this.pageModal.style.opacity = "0";
          this.ionModal.style.opacity = "0";
          // camera permission was granted
          // start scanning
          let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            //var splitted = text.split(" ", 3);
            //console.log(splitted);
            this.ionApp.style.opacity = "1";
            this.pageModal.style.opacity = "1";
            this.ionModal.style.opacity = "1";
            this.editedPoi.hasQRCode = true;
            debugger;
            this.editedPoi.QRCodeID = text.toString();

            //this.alertText("LO ESCANEADO:", text.toString());
            this.qrScanner.hide(); // hide camera preview
            scanSub.unsubscribe(); // stop scanning
            this.closeQRScanner(true);
            //console.log('Scanned something', text);
          });
        } else if (status.denied) {
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
        } else {
          // permission was denied, but not permanently. You can ask for permission again at a later time.
        }
      })
      .catch((e: any) => console.log('Error is', e));
  }

  inicializarSalidaHaciaAtras() {
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
      this.customHandleBackButton(false);
    });
  }

  private customHandleBackButton(aBoolean): void {
    this.closeQRScanner(aBoolean);
    this.ionApp.style.opacity = "1";
    this.pageModal.style.opacity = "1";
    this.ionModal.style.opacity = "1";
  }

  public closeQRScanner(seHaEscaneado) {
    this.qrScanner.destroy();
    this.qrAutorizado = false;
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
    if (!seHaEscaneado) {
      this.alertText("ATENCIÓN:", 'Se volvió a seleccionar la opción "' + this.editedPoi.asociatedTrigger + '" debido a que no ha escaneado ningún código.');
    } else {
      if (this.editedPoi.QRCodeID == this.poi.QRCodeID) { //NO SE MODIFICÓ
        this.alertText("ATENCIÓN", 'Se debe escanear un código distinto.');
        this.editedPoi.asociatedTrigger = this.poi.asociatedTrigger;
      }
    }
  }

  private cambioFormaBrindarPoi(anElection) {
    this.editedPoi.QRCodeID = " ";
    debugger;
    if (anElection == "Usando WLAN") {
      this.editedPoi.hasQRCode = false;
      this.editedPoi.base64 = null;
      this.editedPoi.QRCodeID = null;
    } else {
      if (anElection == "QR Existente") {
        this.scanToUseExistingQR(); //ALGUN QR QUE YA EXISTA (DEBERIA SER HASHEADO)
      }
      if (anElection == "Nuevo QR") {
        this.editedPoi.QRCodeID = this.editedPoi.poiName; //EL NOMBRE (DEBERIA SER HASHEADO)  
      }
      this.editedPoi.hasQRCode = true;
    }
  }

  saveChanges() {
    this.loadingSave = this.createLoading("Guardando cambios...");
    this.loadingSave.present();
    this.poisService.updatePoi(this.editedPoi, this.workspace).then(response => {
      if (!response) {
        this.alertText("ERROR", "Hubo un error al editar el POI. Intente nuevamente.");
        this.hideLoading(this.loadingSave);
      } else {
        this.poi.poiName = this.editedPoi.poiName;
        this.poi.category = this.editedPoi.category;
        this.poi.asociatedTrigger = this.editedPoi.asociatedTrigger;
        this.hideLoading(this.loadingSave);
        this.switchEditionMode();
      }
    });
  }

  public okEncrypt(aBase64, loading) {
    loading.dismiss();
    this.editedPoi.base64 = aBase64;
    this.saveChanges();
  }

  public notOkEncrypt(loading, err) {
    loading.dismiss();
    console.dir(err);
    this.alertText("Error", "Se produjo un error al generar el código QR. Intente nuevamente.")
  }

  editFromFirebase(editedPoi) {
    let seModificoElTexto = ((editedPoi.poiName != this.poi.poiName) || (editedPoi.category != this.poi.category));
    let seModificoLaFormaDeBrindarPoi = (this.editedPoi.asociatedTrigger != this.poi.asociatedTrigger);
    debugger;
    let loading;
    if (seModificoElTexto || seModificoLaFormaDeBrindarPoi) { //SI NO SE CAMBIO NADA NO MANDO A GUARDAR NADA
      if (this.editedPoi.hasQRCode) { //SI TIENE QR TENGO QUE ENCRIPTARLO Y LUEGO CUARDA EN EL OK
        loading = this.createLoading("Encriptando código QR");
        loading.present();
        this.poisService.encriptQR(this.editedPoi, this, loading).then((result) => { });
      } else { //SI NO TIENE QR GUARDO DIRECTAMENTE
        this.saveChanges();
      }
    } else {
      this.switchEditionMode();
    }
  }

  saveEditedPoi(editedPoi) {
    this.workspace.status.editPoi(this, this.isOwner(), editedPoi);
  }

  switchEditionMode() {
    this.zone.run(() => {
      //run the code that should update the view
      if (this.editionMode) {
        this.editionMode = false;
      } else {
        this.editedPoi = Object.assign({}, this.poi);
        this.editionMode = true;
      }
    });
  }

  alertText(aTitle, aSubTitle) {
    let alert = this.alertCtrl.create({
      title: aTitle,
      subTitle: aSubTitle,
      buttons: ['Cerrar']
    });
    alert.present();
  }

  private createLoading(msg) {
    return this.loadingCtrl.create({
      content: msg
    });
  }

  private hideLoading(loading) {
    if (typeof loading != undefined && typeof loading != null) {
      loading.dismissAll();
      loading = null;
    }
  }

  public updateWorkspaceState(newStatusString) {
    this.statusString = newStatusString;
    this.showEditAndDelete();
    this.showSwithPoiVisibility();
    if (this.workspace) {
      this.workspace.status = this.getSelectedWorkspaceStatus(newStatusString);
      // this.alertText("CAMBIO EL ESTADO A:", newStatusString);
    }
  }

  getSelectedWorkspaceStatus(aStringStatusclass) {
    switch (aStringStatusclass) {
      case "EdicionDelCreador": {
        return new EdicionDelCreador();
      }
      case "EdicionColaborativa": {
        return new EdicionColaborativa();
      }
      case "EdicionDelCreadorVersionFinal": {
        return new EdicionDelCreadorVersionFinal();
      }
      case "VersionFinalPublica": {
        return new VersionFinalPublica();
      }
    }
  }

  isOwner() {
    return (this.workspace.idOwner == this.userLogged.uid);
  }

  showSwithPoiVisibility() {
    this.mustShowSwitchPoiVisibility = (this.isWorkspaceOwner && this.statusString == "EdicionDelCreadorVersionFinal");
    //SI SOY OWNER Y SÓLO SI ESTÁ EN ESTADO "NO EDITABLE"
  }

  showEditAndDelete() {
    this.mustShowEditAndDelete = ((this.isWorkspaceOwner && this.statusString != "VersionFinalPublica") || (!this.isWorkspaceOwner && this.statusString == "EdicionColaborativa"));
    //SI SOY OWNER Y AÚN ES EDITABLE o... SI NO SOW OWNER Y SE ENCUENTRA EN ESTADO DE EDICIÓN COLABORATIVA
  }

} 