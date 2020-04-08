import { Component } from '@angular/core';
import { Platform, NavParams, ViewController, AlertController, LoadingController, Keyboard } from 'ionic-angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Poi, PoisService } from '../../services/pois.service';
import { Workspace, WorkspaceService, EdicionDelCreador, EdicionColaborativa, EdicionDelCreadorVersionFinal, VersionFinalPublica } from '../../services/workspace.service';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner'; //lee QR
declare var cordova: any;
@Component({
  selector: 'page-nuevoPoi',
  templateUrl: 'nuevoPoi.html',
})
export class NuevoPoiPage {
  nuevoPoi: Poi;
  workspace: Workspace;
  qrOptionSelected: any;
  qrAutorizado: boolean;
  ionApp: any;
  pagenuevopoi: any;
  ionModal: any;
  options: any;
  modelQRPoi: string;
  loggedUser: any;
  constructor(
    public platform: Platform,
    public params: NavParams,
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private camera: Camera,
    private alertCtrl: AlertController,
    private qrScanner: QRScanner,
    private loadingCtrl: LoadingController,
    private anotherBCScanner: BarcodeScanner,
    private poisService: PoisService,
    private keyboard: Keyboard,
    private workspaceService: WorkspaceService
  ) {
    this.nuevoPoi = this.navParams.get("nuevoPoi");
    this.workspace = this.navParams.get("workspace");
    this.loggedUser = this.navParams.get("loggedUser");
    this.nuevoPoi.hasQRCode = false;
    this.qrAutorizado = false;
    this.options = ["Usando WLAN", "Nuevo QR", "QR Existente"];
    this.qrOptionSelected = "Usando WLAN";
    this.nuevoPoi.poiName = "";
    this.modelQRPoi = "A";
    this.workspaceService.subscribeToWorkspaceStateChangesFromModal(this.workspace, this);
  }
  public unregisterBackButtonAction: any; //Boton hacia atrás

  private tomarFoto() {
    const options: CameraOptions = {
      quality: 60,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 800,
      targetHeight: 600,
    }
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.nuevoPoi.infoHtml = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      // Handle error
    });
  }

  public okEncrypt(aBase64, loading) {
    loading.dismiss();
    this.nuevoPoi.base64 = aBase64;
    this.workspace.status.addPoi(this, this.isOwner(), this.nuevoPoi); //STATE PATTERN
  }

  public notOkEncrypt(loading, err) {
    loading.dismiss();
    console.dir(err);
    this.alertText("Error", "Se produjo un error al generar el código QR. Intente nuevamente.")
  }
  private acceptAddPoi() {
    this.modelQRPoi = this.nuevoPoi.poiName;
    let loading;
    this.nuevoPoi.asociatedTrigger = this.qrOptionSelected; //Mecanismo de sensado asociado al POI
    if (this.nuevoPoi.hasQRCode) {
      loading = this.createLoading("Encriptando QR");
      loading.present();
      this.poisService.encriptQR(this.nuevoPoi, this, loading).then((result) => {
      });
    } else {
      this.workspace.status.addPoi(this, this.isOwner(), this.nuevoPoi); //STATE PATTERN
    }
  }


  public dismissWithoutSave() { //CIERRO SIN GUARDAR
    this.blankPoi();
    this.viewCtrl.dismiss(undefined);
  }


  public savePoiToFirebaseAtDismiss(poiToSave) { //SE LLAMA DESDE EL PATRÓN STATE
    this.viewCtrl.dismiss(poiToSave);
  }

  justOwnerCanAdd() {
    this.alertText("No se puede agregar", "Solo se permite que el propietario del workspace agregue POIs.");
  }

  cantAdd() {
    this.alertText("No se puede agregar", "El propietario ha cerrado el workspace y no admite modificaciones.");
  }


  private printElection(anElection) {
    this.nuevoPoi.QRCodeID = " ";
    debugger;
    if (anElection == "Usando WLAN") {
      this.nuevoPoi.hasQRCode = false;
    } else {

      if (anElection == "QR Existente") {
        this.scanToUseExistingQR(); //ALGUN QR QUE YA EXISTA (DEBERIA SER HASHEADO)
      }
      if (anElection == "Nuevo QR") {
        this.nuevoPoi.QRCodeID = this.nuevoPoi.poiName; //EL NOMBRE (DEBERIA SER HASHEADO)
      }
      this.nuevoPoi.hasQRCode = true;
    }
  }

  alertText(aTitle, aSubTitle) {
    let alert = this.alertCtrl.create({
      title: aTitle,
      subTitle: aSubTitle,
      buttons: ['Cerrar']
    });
    alert.present();
  }

  private blankPoi() {
    this.nuevoPoi.poiName = "";
    this.nuevoPoi.category = "";
    this.nuevoPoi.infoHtml = "";
  }

  public closeQRScanner() {
    this.qrScanner.destroy();
    this.qrAutorizado = false;
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
    if (this.nuevoPoi.QRCodeID == " ") { //NO SE MODIFICÓ
      this.qrOptionSelected = "Usando WLAN";
      this.alertText("ATENCIÓN:", 'Se volvió a seleccionar la opción "Usando WLAN" debido a que no ha escaneado ningún código.');
    }
  }

  public scanToUseExistingQR() {
    // Optionally request the permission early
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          this.qrAutorizado = true;
          this.inicializarSalidaHaciaAtras();
          this.ionApp = <HTMLElement>document.getElementsByTagName("ion-app")[0];
          this.pagenuevopoi = <HTMLElement>document.getElementsByTagName("page-nuevopoi")[0];
          this.ionModal = <HTMLElement>document.getElementsByTagName("ion-modal")[0];
          this.ionApp.style.opacity = "0";
          this.pagenuevopoi.style.opacity = "0";
          this.ionModal.style.opacity = "0";
          // camera permission was granted
          // start scanning
          let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            //var splitted = text.split(" ", 3);
            //console.log(splitted);
            this.ionApp.style.opacity = "1";
            this.pagenuevopoi.style.opacity = "1";
            this.ionModal.style.opacity = "1";
            this.nuevoPoi.hasQRCode = true;
            debugger;
            this.nuevoPoi.QRCodeID = text.toString();

            //this.alertText("LO ESCANEADO:", text.toString());
            this.qrScanner.hide(); // hide camera preview
            scanSub.unsubscribe(); // stop scanning
            this.closeQRScanner();
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
      this.customHandleBackButton();
    });
  }

  private customHandleBackButton(): void {
    this.closeQRScanner();
    this.ionApp.style.opacity = "1";
    this.pagenuevopoi.style.opacity = "1";
    this.ionModal.style.opacity = "1";
  }

  public hideLoading(loading) {
    if (typeof loading != undefined && typeof loading != null) {
      loading.dismissAll();
      loading = null;
    }
  }

  public createLoading(msg) {
    return this.loadingCtrl.create({
      content: msg
    });
  }

  isOwner() {
    return (this.workspace.idOwner == this.loggedUser.uid);
  }

  public updateWorkspaceState(newStatusString) {
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

}