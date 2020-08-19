import {
  Component,
  ChangeDetectorRef,
  EventEmitter,
  Injectable,
} from '@angular/core';
import {
  App,
  NavController,
  NavParams,
  Platform,
  Events,
  LoadingController,
  ToastController,
  AlertController,
  ModalController,
  FabContainer,
} from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  LatLng,
  ILatLng,
  MarkerOptions,
  MarkerIcon,
  Marker,
  PolylineOptions,
  Polyline,
  GroundOverlay,
} from '@ionic-native/google-maps';
import { PermissionsService } from '../../services/permissions';
import { PoisService, Poi, Creator } from '../../services/pois.service';
import { LoginService } from '../../services/login.service';
import { BuildingsService } from '../../services/buildings.service';
import { PositioningService } from '../../services/positioning.service';
import { MapService } from '../../services/map.service';
import { ModalContentPage } from '../modal/modal';
import { NuevoPoiPage } from '../nuevoPoi/nuevoPoi';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner'; //lee QR
import { QRCodeModule } from 'angularx-qrcode'; //genera QR (?
import { QRCodePage } from '../modalQR/modalQR'; //genera QR (?
import { Diagnostic } from '@ionic-native/diagnostic'; //GPS ENCENDIDO
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

//import { BarcodeScanner }  from '@ionic-native/barcode-scanner'; //NO ANDA

//PARA OBSERVAR EL MARCADOR
//import { Observer } from "rxjs/Observer";
//import { Observable } from 'rxjs/Observable';
import { ModalLogin } from '../login/modalLogin';
import {
  Workspace,
  EdicionDelCreador,
  EdicionColaborativa,
  EdicionDelCreadorVersionFinal,
  VersionFinalPublica,
  WorkspaceReference,
  WorkspaceService,
} from '../../services/workspace.service';
import { ShareWorkspaceViaQR } from '../modalShareWorkspaceViaQR/modalShareWorkspaceViaQR';
import { Camera } from '@ionic-native/camera';
import { ModalFilterPoi } from '../modalFilterPoi/modalFilterPoi';
/*import { iif } from 'rxjs';
import { IfStmt } from '@angular/compiler';*/
import { ModalWorkspaceRelease } from '../modalWorkspaceRelease/modalWorkspaceRelease';
declare var cordova: any;

const ROUTE_COLOR = '#00BFFF';

// Positioning parameters
const defaultOptionsMap = {
  useDeadReckoning: false,
  interval: 1000,
  indoorProvider: 'INPHONE',
  useBle: true,
  useWifi: true,
  motionMode: 'BY_FOOT',
  useForegroundService: true,
  outdoorLocationOptions: {
    continuousMode: true,
    userDefinedThreshold: false,
    burstInterval: 1,
    averageSnrThreshold: 25.0,
  },
  beaconFilters: [],
  smallestDisplacement: 1.0,
  realtimeUpdateInterval: 1000,
};

@Component({
  selector: 'page-positioning',
  templateUrl: 'positioning.html',
})
@Injectable()
export class PositioningPage {
  blankUser(): any {
    throw new Error('Method not implemented.');
  }
  dismiss(arg0: any): any {
    throw new Error('Method not implemented.');
  }
  userToLogOrRegister: any;
  workspaceIdStatus: any;
  isClickable: boolean = true;
  building: any;
  posActual = {};
  positioning: boolean = false;
  nroPisoActual: number;
  currentPosition: any = {};
  floors: any[];
  currentFloor: any;
  currentMarkers: Marker[];
  currentMarkersByCreator = {};
  currentPolylinesByCreator = {};
  map: GoogleMap;
  poiCategories: any[];
  marker: Marker;
  //pois: any[];
  pois = new Array<Array<Poi>>();
  //var arrayOfPoisByUser = new Array<Array<Poi>>();
  polyline: Polyline;
  overlayPisoActual: GroundOverlay;
  accessible: boolean = false;
  navigating: boolean = false;
  route: any;
  showBuildingMap: EventEmitter<any> = new EventEmitter<any>();
  currentDestinyPoi: any;
  qrAutorizado: any;
  public userLogged: any;
  public nameUserLogged: string;
  public buildings: any[] = [];
  listOfStatuses: any;
  errorLogin: any;
  isCurrentWorkspaceOwner: boolean;
  loadingGetPois;
  currentWorkspace: Workspace;
  userColour: string;
  zoomActual: number;
  timerTenSecondsExecuted: boolean;
  errorGPSDisabedExecuted: boolean;
  mapLoaded = false;
  private unregisterBackButtonAction: any; //Boton hacia atrás
  private ionAppStyle: any;
  private isFinalMode: boolean;
  private changeableColour: string;
  private modelQRPoi: string;
  public currentClassColour: string;
  public creators: any;
  public creatorsArrayOfString = new Array<string>();
  private savingPoi: boolean = false;
  private canChangeFloor: boolean = true;
  private drawingMarkers;
  private iconAddUserColour;
  private possiblesStatusesStrings = [
    'EdicionDelCreador',
    'EdicionColaborativa',
    'EdicionDelCreadorVersionFinal',
    'VersionFinalPublica',
  ];
  private mustShowAddPoiButton: any;
  private lastKnownStatus: any;
  resetView() {
    this.userToLogOrRegister = undefined;
    this.workspaceIdStatus = undefined;
    this.isClickable = true;
    this.building = undefined;
    this.posActual = {};
    this.positioning = false;
    this.nroPisoActual = undefined;
    this.currentPosition = {};
    this.floors = undefined;
    this.currentFloor = undefined;
    this.currentMarkers = [];
    this.map = undefined;
    this.poiCategories = undefined;
    this.marker = undefined;
    this.pois = undefined;
    this.polyline = undefined;
    this.overlayPisoActual = undefined;
    this.accessible = false;
    this.navigating = false;
    this.route = undefined;
    this.currentDestinyPoi = undefined;
    this.qrAutorizado = undefined;
    this.userLogged = undefined;
    this.nameUserLogged = undefined;
    this.buildings = [];
    this.listOfStatuses = [
      new EdicionDelCreador(),
      new EdicionColaborativa(),
      new EdicionDelCreadorVersionFinal(),
      new VersionFinalPublica(),
    ];
    this.isCurrentWorkspaceOwner = undefined;
    this.loadingGetPois = undefined;
    this.currentWorkspace = undefined;
    this.userColour = undefined;
  }
  constructor(
    public app: App,
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public detector: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    public loadingCtrl: LoadingController,
    public googleMaps: GoogleMaps,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private permissionsService: PermissionsService,
    private poisService: PoisService,
    private positioningService: PositioningService,
    private buildingsService: BuildingsService,
    private modalCtrl: ModalController,
    private mapService: MapService,
    private workspaceService: WorkspaceService,
    private qrGenerator: QRCodeModule,
    private qrScanner: QRScanner,
    private loginService: LoginService,
    private diagnostic: Diagnostic,
    private transfer: FileTransfer,
    private file: File,
    private cam: Camera
  ) {
    //CAMBIO DE COLOR
    this.modelQRPoi = 'Hola';
    this.isFinalMode = false;
    this.changeableColour = '#1576C9';
    //CAMBIO DE COLOR
    events.subscribe('functionCall:guardarPosicionActual', () => {
      this.saveCurrentPosition();
    });

    events.subscribe('functionCall:mostrarMapa', (unEdificio) => {
      this.building = unEdificio;
      this.verMapaReal(unEdificio);
    });

    events.subscribe('minimizeApp', () => {
      if (!this.savingPoi) {
        //Si se había hecho el "onPause" porque abrió la cámara para sacar una foto,
        //para guardar el poi, entonces no entra a parar el servicio de posicionamiento.
        this.stopPositioning(null);
      }
    });

    events.subscribe('killApp', () => {
      this.stopPositioning(null);
      this.platform.exitApp();
    });

    events.subscribe('disposeMarker', (aPoi) => {
      //this.alertText("OK","SE ELIMINO EL POI "+ aPoi.poiName);
      this.destroyOneMarkerForCreator(aPoi.creator, aPoi.poiName);
    });

    this.events.subscribe('workspace:setWorkspaceState', (newStatusString) => {
      //SE DISPARA CUANDO SE ABRE EL WORKSPACE
      debugger;
      if (this.currentWorkspace) {
        this.lastKnownStatus = this.currentWorkspace.status.idStatus;
        this.currentWorkspace.status = this.getSelectedWorkspaceStatus(
          newStatusString
        );
        if (!this.isOwner()) {
          //ES COLABORADOR
          switch (newStatusString) {
            case 'EdicionDelCreador': {
              this.mustShowAddPoiButton = false;
              return;
            }
            case 'EdicionColaborativa': {
              this.mustShowAddPoiButton = true;
              return;
            }
            case 'EdicionDelCreadorVersionFinal': {
              this.mustShowAddPoiButton = false;
              return;
            }
            case 'VersionFinalPublica': {
              this.mustShowAddPoiButton = false;
              return;
            }
          }
        } else {
          //ES AUTOR Y SIEMPRE PUEDE EDITAR
          switch (newStatusString) {
            case 'EdicionDelCreador': {
              this.mustShowAddPoiButton = true;
              return;
            }
            case 'EdicionColaborativa': {
              this.mustShowAddPoiButton = true;
              return;
            }
            case 'EdicionDelCreadorVersionFinal': {
              this.mustShowAddPoiButton = true;
              return;
            }
            case 'VersionFinalPublica': {
              this.mustShowAddPoiButton = false;
              return;
            }
          }
        }
      }
    });

    this.events.subscribe('workspace:updated', (newStatusString) => {
      //SE DISPARA CUANDO SE CAMBIA EL ESTADO DEL WORKSPACE
      debugger;
      if (this.currentWorkspace) {
        this.lastKnownStatus = this.currentWorkspace.status.idStatus;
        this.currentWorkspace.status = this.getSelectedWorkspaceStatus(
          newStatusString
        );
        if (!this.isOwner()) {
          //ES COLABORADOR
          switch (newStatusString) {
            case 'EdicionDelCreador': {
              this.alertText(
                '',
                'Se ha cambiado el estado del workspace y sólo el creador puede realizar modificaciones.'
              );
              this.mustShowAddPoiButton = false;
              return;
            }
            case 'EdicionColaborativa': {
              this.alertText(
                '',
                'Se ha cambiado el estado del workspace y ahora admite que los colaboradores participen.'
              );
              this.mustShowAddPoiButton = true;
              return;
            }
            case 'EdicionDelCreadorVersionFinal': {
              this.alertText(
                '',
                'Se ha cambiado el estado del workspace y sólo el creador puede realizar modificaciones.'
              );
              this.mustShowAddPoiButton = false;
              return;
            }
            case 'VersionFinalPublica': {
              this.alertText(
                '',
                'El workspace ha sido publicado y no admite modificaciones.'
              );
              this.mustShowAddPoiButton = false;
              return;
            }
          }
        } else {
          switch (newStatusString) {
            case 'EdicionDelCreador': {
              this.alertText(
                '',
                'Se ha cambiado el estado del workspace y sólo el creador puede realizar modificaciones.'
              );
              this.mustShowAddPoiButton = true;
              return;
            }
            case 'EdicionColaborativa': {
              this.alertText(
                '',
                'Se ha cambiado el estado del workspace y ahora admite que los colaboradores participen.'
              );
              this.mustShowAddPoiButton = true;
              return;
            }
            case 'EdicionDelCreadorVersionFinal': {
              this.alertText(
                '',
                'Se ha cambiado el estado del workspace y sólo el creador puede realizar modificaciones.'
              );
              this.mustShowAddPoiButton = true;
              return;
            }
            case 'VersionFinalPublica': {
              this.alertText(
                '',
                'El workspace ha sido publicado y no admite modificaciones.'
              );
              this.mustShowAddPoiButton = false;
              return;
            }
          }
        }
      }
    });

    this.events.subscribe('workspace:ready', (aWorkspace) => {
      this.lastKnownStatus = this.getSelectedWorkspaceStatus(
        aWorkspace.status.idStatus
      );
      this.isFinalMode = false;
      this.changeableColour = '#1576C9';
      let collaborators;
      if (aWorkspace.collaborators != undefined) {
        //SI TIENE COLABORADORES
        //UNA VEZ OBTENIDO EL WORKSPACE SE PODRIA PEDIR LA LISTA DE COLABORADORES ITERABLE A FIREBASE
        //PERO ESO SERÍAN DOS CONSULTAS A LA BASE
        collaborators = Object.keys(aWorkspace.collaborators).map(function (
          index
        ) {
          let col = aWorkspace.collaborators[index];
          return col;
        });
        aWorkspace.collaborators = collaborators;
      }
      this.currentWorkspace = aWorkspace;
      this.workspaceIdStatus = aWorkspace.status.idStatus;
      debugger;
      if (this.currentWorkspace.status.idStatus == 'VersionFinalPublica') {
        this.changeVisualMode();
      }

      if (this.isOwner()) {
        //EL WORKSPACE ES MIO PONGO MI COLOR PARA CREAR PoIs
        this.userColour = '#1576C9'; //COLOR DE LA MY BLUE COLOUR PARA QUIEN ES OWNER DEL WORKSPACE
        this.isCurrentWorkspaceOwner = true;
        this.iconAddUserColour =
          'assets/img/' + 'pinPoi' + this.userColour.substring(1) + '.png';

        // this.icon = "assets/img/"+"pinPoiQR"+this.colorString+".png";
      } else {
        //SINO, DEBO BUSCAR MI COLOR ENTRE LOS DE LOS COLABORADORES PARA CREAR PoIs
        let collaborator;
        debugger;
        this.isCurrentWorkspaceOwner = false;
        collaborator = aWorkspace.collaborators.find(
          (col) => col.idCollaborator === this.userLogged.uid
        );
        this.userColour = collaborator.idColour;
        this.iconAddUserColour =
          'assets/img/' + 'pinPoi' + this.userColour.substring(1) + '.png';
        debugger;
      }
      this.verMapaReal(this.currentWorkspace.building);
      this.initializeMustShowAddPoiButton(
        this.currentWorkspace.status.idStatus
      );
    });

    this.events.subscribe('scanToImportWorkspace', () => {
      this.scanToImportWorkspace();
    });
    this.platform.pause.subscribe(() => {
      //SI MINIMIZO LA CIERRO EN REALIDAD
      //this.stopPositioning(null);
    });
    this.currentMarkers = [];
    this.listOfStatuses = [
      new EdicionDelCreador(),
      new EdicionColaborativa(),
      new EdicionDelCreadorVersionFinal(),
      new VersionFinalPublica(),
    ];
    this.zoomActual = 18;
  }

  private initializeMustShowAddPoiButton(stringStatus) {
    switch (stringStatus) {
      case 'EdicionDelCreador': {
        this.mustShowAddPoiButton = true;
        return;
      }
      case 'EdicionColaborativa': {
        this.mustShowAddPoiButton = true;
        return;
      }
      case 'EdicionDelCreadorVersionFinal': {
        if (this.isOwner()) {
          this.mustShowAddPoiButton = true;
        } else {
          this.mustShowAddPoiButton = false;
        }
        return;
      }
      case 'VersionFinalPublica': {
        this.mustShowAddPoiButton = false;
        return;
      }
    }
  }

  private getClassColour(anHexadecimalColour) {
    switch (anHexadecimalColour) {
      case '#000000': {
        return 'blackPoi';
      }
      case '#2E7D32': {
        return 'strongGreenPoi';
      }
      case '#7B1FA2': {
        return 'strongPurplePoi';
      }
      case '#9E9E9E': {
        return 'softGreyPoi';
      }
      case '#66BB6A': {
        return 'softGreenPoi';
      }
      case '#304FFE': {
        return 'softBluePoi';
      }
      case '#1576C9': {
        return 'myBlueColour';
      }
      case '#283593': {
        return 'strongBluePoi';
      }
      case '#424250': {
        return 'strongGreyPoi';
      }
      case '#860000': {
        return 'strongRedPoi';
      }
      case '#E040FB': {
        return 'softPinkPoi';
      }
      case '#F06292': {
        return 'strongPinkPoi';
      }
      case '#F44336': {
        return 'softRedPoi';
      }
      case '#FF6D00': {
        return 'strongOrangePoi';
      }
      case '#FF7043': {
        return 'softOrangePoi';
      }
    }
  }

  private changeVisualMode() {
    debugger;
    if (this.isFinalMode) {
      this.isFinalMode = false;
      this.changeableColour = '#1576C9';
    } else {
      this.isFinalMode = true;
      this.changeableColour = this.currentWorkspace.applicationColour;
      //this.changeableColour = this.getClassColour(this.currentWorkspace.applicationColour);
    }
  }

  isOwner() {
    return this.currentWorkspace.idOwner == this.userLogged.uid;
  }

  logOutActions() {
    this.events.publish('logout');
    this.nameUserLogged = undefined;
    this.map = undefined;
  }
  logout() {
    this.resetView();

    let loadingLogOut = this.createLoading('Hasta luego...');
    loadingLogOut.present();
    this.loginService.logout().then((result) => {
      this.hideLoading(loadingLogOut);
      if (result.logged) {
        this.alertText(result.errorMessage, 'Intente nuevamente');
      } else {
        if (!result.logged) {
          //no está loggeado, se deslogueo -- muestro modal
          this.logOutActions();
          this.abrirModalLogin();
        }
      }
    });
  }

  alertText(aTitle, aSubTitle) {
    let alert = this.alertCtrl.create({
      title: aTitle,
      subTitle: aSubTitle,
      buttons: ['Cerrar'],
    });
    alert.present();
  }
  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Prueba',
      subTitle: 'Alert de prueba',
      buttons: ['Cerrar'],
    });
    alert.present();
  }
  public closeQRScanner() {
    this.qrScanner.destroy();

    this.qrAutorizado = false;
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  public closeQRScannerToImportWorkspace(wsReference) {
    this.qrScanner.destroy();
    this.qrAutorizado = false;
    this.events.publish('addWorkspaceAsCollaborator', wsReference);
  }

  goToFolderAndSave(storeDirectory) {
    let ok = true;
    this.pois.forEach((arrayByUser) => {
      if (ok) {
        arrayByUser.forEach((poi) => {
          if (poi.hasQRCode && poi.visible) {
            let nombreImagen = this.currentWorkspace.name + '_' + poi.poiName;
            const ft: FileTransferObject = this.transfer.create();
            var uri = encodeURI(poi.base64);

            ft.download(
              uri,
              storeDirectory + nombreImagen + '.png',
              false,
              {}
            ).then(
              function (result) {
                console.log('SE GUARDO!');
              },
              function (err) {
                debugger;
                console.log('HUBO UN ERROR');
                ok = false;
              }
            );
          }
        });
      }
    });
    if (ok) {
      this.alertText(
        '¡Guardados!',
        'Se han exportado todos códigos QR de este piso a su galería de imágenes. Puede encontrarlos en la carpeta "CodigosQR/NombreDelWorkspace". Para exportar el resto de los QR de los demás pisos debe usar la opción "Exportar Imágenes QR" del menú contextual"'
      );
    } else {
      this.alertText(
        'Error',
        'Se produjo un error al intentar guardar los códigos QR. Intente nuevamente.'
      );
    }
  }

  private exportImages() {
    let storeDirectory;
    if (this.platform.is('ios')) {
      storeDirectory = cordova.file.syncedDataDirectory;
    } else {
      storeDirectory = cordova.file.externalApplicationStorageDirectory;
      storeDirectory = cordova.file.externalRootDirectory;
    }
    if (this.platform.is('android')) {
      this.file
        .checkDir(this.file.externalRootDirectory, 'CodigosQR')
        .then((response) => {
          console.log('Directory exists' + response);
          if (response) {
            this.goToFolderAndSave(
              storeDirectory + '/CodigosQR/' + this.currentWorkspace.name + '/'
            );
          }
          debugger;
        })
        .catch((err) => {
          console.log("Directory doesn't exist" + JSON.stringify(err));
          this.file
            .createDir(this.file.externalRootDirectory, 'CodigosQR', false)
            .then((response) => {
              console.log('Directory create' + response);
              this.goToFolderAndSave(
                storeDirectory +
                  '/CodigosQR/' +
                  this.currentWorkspace.name +
                  '/'
              );
              debugger;
            })
            .catch((err) => {
              debugger;
              console.log('Directory no create' + JSON.stringify(err));
            });
        });
    }
    // this.file.checkDir(storeDirectory + "", "CodigosQR/" + this.currentWorkspace.name + "/").then((response) => {
    //   console.log(response);
    //   this.goToFolderAndSave(storeDirectory + "/CodigosQR/" + this.currentWorkspace.name + "/");
    // }).catch((err) => {
    //   console.log(err)
    //   this.file.createDir(storeDirectory + "", "CodigosQR/" + this.currentWorkspace.name + "/", true).then(aDirectoryEntry => {
    //     this.goToFolderAndSave(storeDirectory + "/CodigosQR/" + this.currentWorkspace.name + "/");
    //   });
    // });
  }

  permissionGranted(status): boolean {
    const grantedValue = this.diagnostic.permissionStatus.GRANTED;
    const grantedWhenInUseValue = this.diagnostic.permissionStatus
      .GRANTED_WHEN_IN_USE;
    return status == grantedValue || status == grantedWhenInUseValue;
  }

  solicitarPermiso(permissions) {
    debugger;
    permissions.requestPermission(
      'WRITE_EXTERNAL_STORAGE',
      this.exportImages(),
      this.aviso()
    );
  }

  aviso() {
    debugger;
    this.alertText(
      '',
      'Debe permitir el acceso al sistema de archivos para exportar las imágenes.'
    );
  }

  // lalala() {
  //   debugger;
  //   var permissions = cordova.plugins.permissions;
  //   permissions.checkPermission("WRITE_EXTERNAL_STORAGE", this.exportImages(), this.solicitarPermiso(permissions));
  //   //permissions.requestPermission("WRITE_EXTERNAL_STORAGE", this.successCallbackStorage(), this.aviso());
  //   //permissions.requestPermissions(permissions, successCallback, errorCallback);
  // }

  private exportQRImages() {
    //this.diagnostic.isExternalStorageAuthorized true/false
    this.diagnostic.getExternalStorageAuthorizationStatus().then((response) => {
      debugger;
      if (this.permissionGranted(response)) {
        //"GRANTED" / "DENIED"
        this.exportImages();
      } else {
        this.diagnostic
          .requestExternalStorageAuthorization()
          .then((r) => {
            debugger;
            if (this.permissionGranted(r)) {
              //"GRANTED" / "DENIED"
              this.exportImages(); //LO LLAMA PERO NO TIENE PERMISOS AUN
            } else {
              this.alertText(
                '',
                'Debe permitir el acceso al sistema de archivos para exportar las imágenes.'
              );
            }
          })
          .catch((error) => {
            console.log(
              'Error when requesting location authorization for the application',
              error
            );
          });
      }
    });

    // this.permissionsService.checkExternalStoragePermission().then(permission => { //VER SI QUEDA GUARDADO EL PERMISO
    //   debugger;
    //   if (permission) {
    //     debugger;
    //     this.pois.forEach(poi => {
    //       if (poi.hasQRCode) {
    //         let nombreImagen = this.currentWorkspace.name + "_" + poi.poiName;
    //         cordova.base64ToGallery(poi.base64, { prefix: nombreImagen, mediaScanner: true },
    //           function (path) { console.log(path); },
    //           function (err) { console.log(err); }
    //         );
    //       }
    //     });
    //     this.alertText("Fin", "Se han exportado todos códigos QR a su galería de imágenes.");
    //   }
    //   else {
    //     this.diagnostic.requestExternalStorageAuthorization().then(resolve => {
    //       this.diagnostic.permission.WRITE_EXTERNAL_STORAGE
    //       debugger;
    //       if (resolve == "GRANTED") {
    //         this.exportImages();
    //       } else {
    //         if (resolve == "DENIED") {
    //           this.alertText("ERROR", "Otorgue el permiso necesario para exportar las imágenes de los códigos QR.");
    //         }
    //       }
    //     });
    //   }
    // });
  }
  /*

  let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            //ionApp.style.display = "block";

            // DEBO BUSCAR EN UN ARRAY DE ARRAYS
            var BreakException = {};
            try {
              let poiFound;
              this.pois.forEach(aPoisByUser => { //LOS POIS ESTAN GUARDADOS POR USUARIO
                poiFound = aPoisByUser.find(poi => poi.QRCodeID === text);
                if (poiFound) {
                  this.alertText("AVISO", "Punto encontrado");
                  this.verDatosPoi(poiFound);
                  throw BreakException;
                }
              });
              if(!poiFound){
                this.alertText("AVISO","El código QR leído no corresponde a esta aplicación.");
              }
            } catch (e) {
              if (e !== BreakException) throw e;
            }
          });


  */

  private iniciarQRScannerToPoi() {
    this.qrScanner
      .prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          this.inicializarSalidaHaciaAtras();
          this.ionAppStyle = <HTMLElement>(
            document.getElementsByTagName('ion-app')[0]
          );

          this.ionAppStyle.style.opacity = '0';
          // camera permission was granted
          this.qrAutorizado = true;
          // start scanning
          let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            this.ionAppStyle.style.opacity = '1';
            this.qrScanner.hide(); // hide camera preview
            scanSub.unsubscribe(); // stop scanning
            this.closeQRScannerFromScanPoi(text);
            //var BreakException = {};
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
  public closeQRScannerFromScanPoi(aText) {
    this.qrScanner.destroy();
    this.qrAutorizado = false;
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
    let poiFound; // DEBO BUSCAR EN UN ARRAY DE ARRAYS
    this.pois.forEach((aPoisByUser) => {
      //LOS POIS ESTAN GUARDADOS POR USUARIO
      if (!poiFound) {
        poiFound = aPoisByUser.find((poi) => poi.QRCodeID === aText);
      } else {
        this.abrirPoi(poiFound.poiName);
      }
    });
    if (!poiFound) {
      this.alertText(
        'AVISO',
        'El código QR leído no corresponde al piso en el que se encuentra posicionado, o no corresponde a esta aplicación.'
      );
    }
  }

  // public initQRScanner() {
  //   // Optionally request the permission early
  //   this.qrScanner.prepare()
  //     .then((status: QRScannerStatus) => {
  //       if (status.authorized) {
  //         // camera permission was granted
  //         this.qrAutorizado = true;
  //         // start scanning
  //         var ionApp = <HTMLElement>document.getElementsByTagName("ion-app")[0];
  //         ionApp.style.display = "none";
  //         let scanSub = this.qrScanner.scan().subscribe((text: string) => {
  //           ionApp.style.display = "block";
  //           let selectedPoi = this.pois.find(poi => poi.QRCodeID === text); //ENCUENTRA EL POI Y LO MANDA COMPLETO
  //           if (selectedPoi) {
  //             this.dibujarPoiQREnMapa(selectedPoi)
  //           }
  //           else {
  //             this.alertText("El código QR leído no corresponde a esta aplicación.", "");
  //           }
  //           this.qrScanner.hide(); // hide camera preview
  //           scanSub.unsubscribe(); // stop scanning
  //           this.closeQRScanner();
  //           //console.log('Scanned something', text);
  //         });

  //       } else if (status.denied) {
  //         // camera permission was permanently denied
  //         // you must use QRScanner.openSettings() method to guide the user to the settings page
  //         // then they can grant the permission from there
  //       } else {
  //         // permission was denied, but not permanently. You can ask for permission again at a later time.
  //       }
  //     })
  //     .catch((e: any) => console.log('Error is', e));
  // }

  public scanToImportWorkspace() {
    // Optionally request the permission early
    this.qrScanner
      .prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          this.inicializarSalidaHaciaAtras();
          this.ionAppStyle = <HTMLElement>(
            document.getElementsByTagName('ion-app')[0]
          );

          this.ionAppStyle.style.opacity = '0';
          // camera permission was granted
          this.qrAutorizado = true;
          // start scanning
          let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            var splitted = text.split(' ', 3);
            console.log(splitted);
            this.ionAppStyle.style.opacity = '1';
            this.qrScanner.hide(); // hide camera preview
            scanSub.unsubscribe(); // stop scanning
            let wsReference = new WorkspaceReference(
              splitted[0],
              splitted[1],
              splitted[2]
            );
            this.closeQRScannerToImportWorkspace(wsReference);
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
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(
      () => {
        this.customHandleBackButton();
      }
    );
  }

  private customHandleBackButton(): void {
    this.closeQRScanner();
    this.ionAppStyle.style.opacity = '1';
  }

  private mostrarQRCode(aPoi) {
    debugger;
    let QRModal = this.modalCtrl.create(QRCodePage, aPoi); //Le paso el string
    QRModal.present();
  }

  private shareViaQR() {
    let shareWorkspaceViaQRModal = this.modalCtrl.create(
      ShareWorkspaceViaQR,
      this.currentWorkspace
    );
    shareWorkspaceViaQRModal.present();
  }

  private getRouteAndDrawInMap(poiTo) {
    this.removeRouteFromMap();
    let loadingObteniendoRuta = this.createLoading('Cargando ruta...');
    loadingObteniendoRuta.present();
    debugger;
    /*let directionsOptionsMap = {
      accesible: this.accessible,
      startingAngle: this.currentPosition.bearing.degrees,
    };*/
    var directionsOptionsMap = new Object();
    directionsOptionsMap['minimizeFloorChanges'] = true;
    this.currentDestinyPoi = poiTo;
    //EDIFICIO;        FROM;          TO;    OPTIONS;
    cordova.plugins.Situm.requestDirections(
      [
        this.building,
        this.currentPosition,
        this.currentDestinyPoi,
        directionsOptionsMap,
      ],
      (route) => {
        // Route Situm object, DEBO PINTAR ESA RUTA.
        debugger;
        this.route = route;
        this.hideLoading(loadingObteniendoRuta); //PUEDE SER
        this.drawRouteOnMap(this.route);
        this.detector.detectChanges();
      },
      (error) => {
        const message = `Error al dibujar la ruta. ${error}`;
        this.presentToast(message, 'top', null);
        return;
      }
    );
  }

  public destroyPolylinesForCreator(aCreatorString) {
    if (this.currentPolylinesByCreator[aCreatorString] != undefined) {
      this.currentPolylinesByCreator[aCreatorString].forEach((polyline) => {
        polyline.remove();
      });
    }
  }

  // public eliminarPoiDelMapa(aPoi) {
  //   this.pois.some(poisByCreator => { //BUSCO EN EL ARREGLO DE ARREGLO PERO DETENIENDO LA EJECUCION
  //     if (poisByCreator[0].creator == aPoi.creator) { //BUSCO LA COLECCION DEL USUARIO DUEÑO DEL POI Y LA ACTUALIZO
  //       poisByCreator = poisByCreator.filter(poiByCreator => poiByCreator.poiName !== aPoi.poiName);
  //       return true;
  //     }
  //   });
  //   this.destroyOneMarkerForCreator(aPoi.creator, aPoi.poiName);
  //   //this.destroyPolylinesForCreator(aPoi.creator);
  // }

  newCreator(aPoi) {
    var creator = new Creator();
    creator.checked = true;
    creator.name = aPoi.creator;
    creator.colour = aPoi.colour;
    return creator;
  }

  addNewCreator(aCreator) {
    if (this.creators != null) {
      let arrayRepeatedElements = this.creators.filter(
        (c) => c.name === aCreator.name
      );
      if (arrayRepeatedElements.length == 0) {
        //Debo meter un solo usuario creador, pero cada uno pudo haber creado muchos pois.
        this.creators.push(aCreator);
      }
    }
  }

  setCreatorCollaborator() {
    if (this.creators != null) {
      return;
    }
    this.creators = new Array<Creator>();
    this.addNewCreator;
  }

  setCreators() {
    //PONE TODOS LOS CREADORES EN UN ARREGLO ITERABLE
    // debugger;
    // if (this.creators != null) {
    //   return;
    // }
    this.creators = new Array<Creator>();
    this.pois.forEach((poisByUser) => {
      this.addNewCreator(this.newCreator(poisByUser[0]));
    });
  }

  visibleCreator(anCreatorName) {
    let visibleCreators = this.creators.filter((c) => c.checked == true); //ME QUEDO CON LOS QUE ESTÁN MARCADOS COMO VISIBLES
    let arrayStringCreators = visibleCreators.map((creator) => creator.name); //CREA ARRAY DE PROPIEDADES DE STRINGS
    return arrayStringCreators.includes(anCreatorName);
  }

  // updateMarkers(creators) {
  //   //this.clearMarkers();
  //   this.destroyMarkers();
  //   this.pois.forEach(poisByUser => {
  //     let userCreator = poisByUser[0].creator;
  //     if (creators.includes(userCreator)) { //Si la colección está entre los usuarios que quiero mostrar
  //       let sizeOfMarkers = this.getCorrectSizeMarker(this.zoomActual);
  //       let array = new Array<Array<Poi>>();
  //       array.push(poisByUser);
  //       this.dibujarPoisEnMapa(array, sizeOfMarkers);
  //     }
  //   });
  // }

  updateCreators(updatedCreators) {
    this.creators = updatedCreators;
  }

  openPoisFilter() {
    let jsonCreators = JSON.stringify(this.creators);
    let modalFilterPoi = this.modalCtrl.create(ModalFilterPoi, {
      creators: this.creators,
    });
    modalFilterPoi.onDidDismiss((filteredCreators) => {
      //CUANDO SE CIERRE EL MODAL VUELVE CON DATOS
      debugger;
      if (filteredCreators != undefined) {
        this.updateCreators(filteredCreators);
        let jsonFilteredCreators = JSON.stringify(filteredCreators);
        if (jsonCreators != jsonFilteredCreators) {
          let arrayCreators = JSON.parse(jsonFilteredCreators);
          console.log('LOS CREADORES SON:');
          console.log(arrayCreators);
          this.creators = arrayCreators;
          //arrayCreators = arrayCreators.filter(creator => creator.checked !== false);
          this.eliminarMarcadoresCorrespondientes(arrayCreators); //USA destroyMarkersForCreator
          let enabledCreators = this.creators.filter((c) => c.checked === true);
          if (enabledCreators.length != 0) {
            //Tiene que haber algun creador para el cual dibujar.
            this.dibujarMarcadoresCorrespondientes(false); //ACA ENTRA SIEMPRE A BORRAR (SOLO LOS DEL COLABORADOR O LOS DE TODOS)
          }
          // this.eliminarCaminosCorrespondientes(arrayCreators);
          // this.dibujarCaminosCorrespondientes();
          // let arrayStringCreators = arrayCreators.map(creator => creator.name); //CREA ARRAY DE NOMBRES DE CREADORES
          // this.updateMarkers(arrayStringCreators);
        }
      }
    });
    modalFilterPoi.present();
  }

  getCorrectSizeMarker(aZoom) {
    if (aZoom > 20) {
      return 36;
    }
    if (aZoom <= 20 && aZoom >= 18) {
      return 40;
    }
    if (aZoom <= 18 && aZoom >= 16) {
      return 44;
    }
    if (aZoom < 16) {
      return 48;
    }
  }

  generateMarkersArrayForOwner() {}

  generateMarkersArrayForCollaborator() {}

  public updatePoisWithResult2(aPoisByUser, trigger) {
    let message;
    let previousCreators;
    let arrayOfPois;
    let lookSameFloor: boolean;
    let latestPois = this.pois;
    this.pois = new Array<Array<Poi>>(); //BORRO TODOS LOS PoIs

    if (this.currentWorkspace.status.idStatus == 'VersionFinalPublica') {
      if (aPoisByUser.length > 0) {
        aPoisByUser.forEach((listOfAnUser) => {
          arrayOfPois = Object.keys(listOfAnUser).map(function (index) {
            let pois = listOfAnUser[index];
            return pois;
          });
          this.pois.push(arrayOfPois);
        });
        if (this.creators != undefined) {
          //ME QUEDO CON LOS CREADORES ANTERIORES
          if (this.creators.length > 0) {
            previousCreators = this.creators.map((x) => Object.assign({}, x));
          }
        }
        this.setCreators();
        this.eliminarMarcadoresCorrespondientes(previousCreators);
        this.dibujarMarcadoresCorrespondientes(false);
      }
    } else {
      //SI NO ESTOY EN VERSIONFINALPUBLICA, SE COMPORTA COMO SIEMPRE.
      if (aPoisByUser.length > 0) {
        if (!this.soyOwner()) {
          //SI SOY COLABORADOR
          //this.pois = new Array<Array<Poi>>(); //BORRO TODOS LOS PoIs
          aPoisByUser.forEach((listOfAnUser) => {
            //VOY A BUSCAR LA COLECCION QUE ME PERTENECE
            arrayOfPois = Object.keys(listOfAnUser).map(function (index) {
              let pois = listOfAnUser[index];
              return pois;
            });
            let currentCreator = arrayOfPois[0].creator;
            if (currentCreator == this.nameUserLogged) {
              //SOLO LOS DEL COLABORADOR SI ESTOY LOGUEADO COMO TAL
              //this.destroyMarkersForCreator(currentCreator); //BORRO LOS MARCADORES DEL USUARIO LOGUEADO (LOS UNICOS QUE HAY)
              this.pois.push(arrayOfPois);
            }
          });
        } else {
          aPoisByUser.forEach((listOfAnUser) => {
            arrayOfPois = Object.keys(listOfAnUser).map(function (index) {
              let pois = listOfAnUser[index];
              return pois;
            });
            debugger;
            if (
              arrayOfPois[0].floorIdentifier ==
              this.currentFloor.floorIdentifier
            ) {
              lookSameFloor = true;
            } else {
              lookSameFloor = false;
            }
            if (lookSameFloor == true) {
              //ACTUALIZO SOLO SI ESTOY MIRANDO EL MISMO PISO
              this.pois.push(arrayOfPois);
            } else {
              this.pois = latestPois; //Sino me quedo con lo que tenía.
            }
          });
        }
      } else {
        message = 'Este piso no posee PoIs.';
        this.presentToast(message, 'top', null);
      }
      if (this.soyOwner()) {
        if (trigger == 'changeFloor') {
          // this.alertText("", "ENTRO POR CAMBIO DE PISO");
          if (this.creators != undefined) {
            if (this.creators.length > 0) {
              previousCreators = this.creators.map((x) => Object.assign({}, x));
            }
          }
          this.setCreators();
          this.eliminarMarcadoresCorrespondientes(previousCreators);
          this.dibujarMarcadoresCorrespondientes(false);
        } else {
          if (trigger == 'updatedPois' && lookSameFloor === true) {
            //    this.alertText("", "ENTRO POR ACTUALIZACION Y MISMO PISO");
            if (this.creators != undefined) {
              if (this.creators.length > 0) {
                previousCreators = this.creators.map((x) =>
                  Object.assign({}, x)
                );
              }
            }
            this.setCreators();
            this.eliminarMarcadoresCorrespondientes(previousCreators);
            this.dibujarMarcadoresCorrespondientes(false);
          } else {
            //    this.alertText("", "ENTRO POR ACTUALIZACION Y PISO DISTINTO, NO HAGO NADA");
          }
        }
      } else {
        if (this.creators != undefined) {
          if (this.creators.length > 0) {
            previousCreators = this.creators.map((x) => Object.assign({}, x));
          }
        }
        this.setCreators();
        this.eliminarMarcadoresCorrespondientes(previousCreators);
        this.dibujarMarcadoresCorrespondientes(false);
      }
    }

    // this.eliminarCaminosCorrespondientes(previousCreators);
    // this.dibujarCaminosCorrespondientes();
  }

  soyOwner() {
    return this.currentWorkspace.idOwner == this.userLogged.uid;
  }

  dibujarMarcadoresCorrespondientes(resize) {
    var marcadoresADibujar = 0;
    var marcadoresDibujados = 0;
    if (this.currentWorkspace.status.idStatus == 'VersionFinalPublica') {
      //DIBUJAR SOLO LOS MARCADORES VISIBLES PARA CUALQUIER USUARIO FINAL
      //this.alertText("ESTA EN VERSION FINAL PUBLICA", "RENDERIZANDO SOLO LOS VISIBLES");
      debugger;
      this.pois.forEach((poisByUser) => {
        debugger;
        let poisByUserVisibles;
        poisByUserVisibles = poisByUser.filter((pbu) => pbu.visible == true);
        marcadoresADibujar = marcadoresADibujar + poisByUserVisibles.length;
        debugger;
        let sizeOfMarkers = this.getCorrectSizeMarker(this.zoomActual);
        let arrayOfUser = new Array<Array<Poi>>();
        arrayOfUser.push(poisByUserVisibles);
        this.dibujarPoisEnMapa(
          arrayOfUser,
          sizeOfMarkers,
          marcadoresADibujar,
          marcadoresDibujados,
          this.drawingMarkers
        ); //VOY A LLAMAR UNA VEZ POR CADA USUARIO QUE ESTÉ VISIBLE
      });
    } else {
      //this.alertText("ES OTRO ESTADO NO FINAL", "RENDERIZANDO TODOS");
      if (!this.soyOwner()) {
        //PARA EL USUARIO COLABORADOR
        console.log('DIBUJANDO MARCADORES PARA COLABORADOR');
        this.pois.some((poisByUser) => {
          let poi = poisByUser[0];
          if (poi.creator == this.nameUserLogged) {
            marcadoresADibujar = poisByUser.length;
            console.log('PUTA');
            if (!resize) {
              //SI ME ACERQUE O ME ALEJE NO MUESTRO EL CARTEL
              this.drawingMarkers = this.createLoading(
                'Dibujando marcadores...'
              );
              this.drawingMarkers.present();
            }

            let sizeOfMarkers = this.getCorrectSizeMarker(this.zoomActual);
            let arrayOfUser = new Array<Array<Poi>>();
            arrayOfUser.push(poisByUser);
            this.dibujarPoisEnMapa(
              arrayOfUser,
              sizeOfMarkers,
              marcadoresADibujar,
              marcadoresDibujados,
              this.drawingMarkers
            );
            // this.hideLoading(drawingMarkers);
            return true;
          }
        });
      } else {
        //PARA EL USUARIO PROPIETARIO
        console.log('DIBUJANDO MARCADORES PARA EL DUEÑO DEL WORKSPACE');
        console.log('THIS.PoIs TIENE: ');
        console.log(this.pois);
        if (this.pois.length > 0) {
          console.log('PUTA');
          if (!resize) {
            this.drawingMarkers = this.createLoading('Dibujando marcadores...');
            this.drawingMarkers.present();
          }
        }
        this.pois.forEach((poisByUser) => {
          //RECORRO LOS PUNTOS DE INTERÉS
          let poi = poisByUser[0];
          debugger;
          if (this.visibleCreator(poi.creator)) {
            //SI ESTÁ FILTRADO NO LO MUESTRO
            console.log('EL CREADOR ES VISIBLE!');
            marcadoresADibujar = marcadoresADibujar + poisByUser.length;
            debugger;
            let sizeOfMarkers = this.getCorrectSizeMarker(this.zoomActual);
            let arrayOfUser = new Array<Array<Poi>>();
            arrayOfUser.push(poisByUser);
            this.dibujarPoisEnMapa(
              arrayOfUser,
              sizeOfMarkers,
              marcadoresADibujar,
              marcadoresDibujados,
              this.drawingMarkers
            ); //VOY A LLAMAR UNA VEZ POR CADA USUARIO QUE ESTÉ VISIBLE
          } else {
            console.log('EL CREADOR NO ES VISIBLE');
          }
        });
        //this.hideLoading(drawingMarkers);
      }
    }
  }

  eliminarMarcadoresCorrespondientes(creatorsAnteriores) {
    if (this.currentWorkspace.status.idStatus == 'VersionFinalPublica') {
      if (creatorsAnteriores != undefined) {
        creatorsAnteriores.forEach((creator) => {
          //BORRO LOS MARCADORES PARTIENDO DE LOS DUEÑOS ANTERIORES
          this.destroyMarkersForCreator(creator.name);
        });
      }
    } else {
      if (!this.soyOwner()) {
        //
        console.log('ELIMINANDO MARCADORES DEL COLABORADOR LOGUEADO');
        //let array = this.creators.filter(c => c.name === this.nameUserLogged);
        //if (array.length == 0) {//SI YA NO ESTÁ ENTRE LOS CREADORES DEBO BORRAR SUS MARCADORES
        this.destroyMarkersForCreator(this.nameUserLogged);
        //}
      } else {
        console.log(
          'ELIMINANDO MARCADORES DE TODOS YA QUE SOY EL OWNER Y LOS VEO TODOS'
        );
        if (creatorsAnteriores != undefined) {
          creatorsAnteriores.forEach((creator) => {
            //BORRO LOS MARCADORES PARTIENDO DE LOS DUEÑOS ANTERIORES
            this.destroyMarkersForCreator(creator.name);
          });
        }
      }
    }
  }

  eliminarCaminosCorrespondientes(creatorsAnteriores) {
    if (!this.soyOwner()) {
      //SOY COLABORADOR
      console.log('ELIMINANDO CAMINOS DEL COLABORADOR');
      this.destroyPolylinesForCreator(this.nameUserLogged);
    } else {
      console.log('ELIMINANDO CAMINOS DE TODOS');
      if (creatorsAnteriores != undefined) {
        creatorsAnteriores.forEach((creator) => {
          this.destroyPolylinesForCreator(creator.name);
        });
      }
    }
  }

  dibujarCaminosCorrespondientes() {
    if (!this.soyOwner()) {
      console.log('DIBUJANDO CAMINOS DEL COLABORADOR');
      this.drawPolylinesForCreator(this.nameUserLogged);
    } else {
      console.log('DIBUJANDO TODOS LOS CAMINOS');
      if (this.creators != undefined) {
        this.creators.forEach((creator) => {
          console.log('CREATORS CONTIENE:');
          console.log(this.creators);
          if (creator.checked) {
            this.drawPolylinesForCreator(creator.name);
          }
        });
      }
    }
  }

  drawPolylinesForCreator(aCreatorString) {
    debugger;

    this.pois.some((poisByCreator) => {
      let creator = poisByCreator[0].creator;
      if (creator == aCreatorString) {
        //Si encontre la colección de pois la itero.
        let arrayOfPolylines = new Array<Polyline>();
        let poiFrom = poisByCreator[0];
        poisByCreator.forEach((poi) => {
          let poiTo = poi; //OBTENGO HASTA DONDE
          if (poiFrom.identifier != poiTo.identifier) {
            //SI NO SON EL MISMO PUNTO, DEBO DIBUJAR LA RUTA
            let colourRoute = poiFrom.colour;
            //configuración de la direccion//
            let directionsOptionsMap = new Object();
            directionsOptionsMap['minimizeFloorChanges'] = true;
            //configuración del camino//
            let polylineOptions: PolylineOptions = {
              color: colourRoute,
              width: 4,
              points: [],
            };
            cordova.plugins.Situm.requestDirections(
              [this.building, poiFrom, poiTo, directionsOptionsMap],
              (route) => {
                route.points.forEach((point) => {
                  polylineOptions.points.push({
                    lat: point.coordinate.latitude,
                    lng: point.coordinate.longitude,
                  });
                });
                this.map
                  .addPolyline(polylineOptions)
                  .then((polyline: Polyline) => {
                    arrayOfPolylines.push(polyline);
                  });
              },
              (error) => {
                const message = `Error al dibujar la ruta. ${error}`;
                console.log(error);
                this.presentToast(message, 'top', null);
                return undefined;
              }
            );
          }
          poiFrom = poiTo;
        });
        this.currentPolylinesByCreator[aCreatorString] = arrayOfPolylines;
        return true;
      }
    });
  }

  // dibujarCaminoParaUnCreador() {
  //   let loadingObteniendoRuta = this.createLoading('Obteniendo ruta...');
  //   loadingObteniendoRuta.present();
  //   /*let directionsOptionsMap = { accesible: this.accessible, startingAngle: this.currentPosition.bearing.degrees,};*/
  //   var directionsOptionsMap = new Object();
  //   directionsOptionsMap["minimizeFloorChanges"] = true;
  //   let poiFrom = this.pois[0][0];
  //   let poiTo = this.pois[0][1];
  //   //EDIFICIO;        FROM;          TO;    OPTIONS;
  //   cordova.plugins.Situm.requestDirections([this.building, poiFrom, poiTo, directionsOptionsMap], (route) => {
  //     // Route Situm object, DEBO PINTAR ESA RUTA.
  //     debugger;
  //     this.route = route;
  //     this.hideLoading(loadingObteniendoRuta);
  //     this.drawRouteOnMap(this.route);
  //     this.detector.detectChanges();
  //   }, (error) => {
  //     const message = `Error al dibujar la ruta. ${error}`;
  //     this.presentToast(message, 'top', null);
  //     return;
  //   });
  // }

  // reloadMarkers() { //SOLO ACTUALIZA LOS MARCADORES DE LOS PoIs CUYO CREADOR ESTÁ VISIBLE
  //   this.pois.forEach(poisByUser => { //RECORRO LOS PUNTOS DE INTERÉS
  //     let poi = poisByUser[0];
  //     if (this.visibleCreator(poi.creator)) {
  //       debugger;
  //       let sizeOfMarkers = this.getCorrectSizeMarker(this.zoomActual);
  //       let arrayOfUser = new Array<Array<Poi>>();
  //       arrayOfUser.push(poisByUser);
  //       this.dibujarPoisEnMapa(arrayOfUser, sizeOfMarkers); //VOY A LLAMAR UNA VEZ POR CADA USUARIO QUE ESTÉ VISIBLE
  //     }
  //   });
  // }

  eliminarTodosLosCaminos() {
    this.creators.forEach((creator) => {
      this.eliminarcaminosAnUser(creator.name);
    });
  }

  eliminarcaminosAnUser(anUser) {
    if (this.currentPolylinesByCreator[anUser] != undefined)
      this.currentPolylinesByCreator[anUser].forEach((polyline) => {
        polyline.remove();
      });
  }

  getRouteToDraw(poiFrom, poiTo) {
    var directionsOptionsMap = new Object();
    directionsOptionsMap['minimizeFloorChanges'] = true;
    cordova.plugins.Situm.requestDirections(
      [this.building, poiFrom, poiTo, directionsOptionsMap],
      (route) => {
        this.route = route;
        return route;
      },
      (error) => {
        const message = `Error al dibujar la ruta. ${error}`;
        this.presentToast(message, 'top', null);
        return undefined;
      }
    );
  }

  dibujarTodosLosCaminos() {
    this.pois.forEach((aPoisByUser) => {
      //RECORRO LOS PoIs POR USUARIO
      debugger;
      let stringCreator = aPoisByUser[0].creator; //ME QUEDO CON EL USUARIO DUEÑO DE LA COLECCION
      var userPolylines = new Array<Polyline>();
      var poiFrom = aPoisByUser[0];
      aPoisByUser.forEach((poi) => {
        let poiTo = poi; //OBTENGO HASTA DONDE
        if (poiFrom.identifier != poiTo.identifier) {
          //SI NO SON EL MISMO PUNTO, DEBO DIBUJAR LA RUTA
          let colourRoute = poiFrom.colour;
          //configuración de la direccion//
          var directionsOptionsMap = new Object();
          directionsOptionsMap['minimizeFloorChanges'] = true;
          //configuración del camino//
          let polylineOptions: PolylineOptions = {
            color: colourRoute,
            width: 4,
            points: [],
          };
          console.log(
            'LA POLYLINE VA ENTRE: ' +
              poiFrom.poiName.toString() +
              ' Y ' +
              poiTo.poiName.toString()
          );
          cordova.plugins.Situm.requestDirections(
            [this.building, poiFrom, poiTo, directionsOptionsMap],
            (route) => {
              route.points.forEach((point) => {
                polylineOptions.points.push({
                  lat: point.coordinate.latitude,
                  lng: point.coordinate.longitude,
                });
              });
              this.map
                .addPolyline(polylineOptions)
                .then((polyline: Polyline) => {
                  userPolylines.push(polyline);
                });
            },
            (error) => {
              const message = `Error al dibujar la ruta. ${error}`;
              this.presentToast(message, 'top', null);
              return undefined;
            }
          );
        }
        poiFrom = poiTo;
      });
      debugger;
      this.currentPolylinesByCreator[stringCreator] = userPolylines;
    });
    console.log('LAS POLYLINES SON:');
    console.log(this.currentPolylinesByCreator);
  }

  printMarkers() {
    //this.alertText("Markardores de: ceciliachalliol", this.currentMarkersByCreator["ceciliachalliol"].length.toString());
    this.alertText(
      'Markardores de: fmendiburu',
      this.currentMarkersByCreator['fmendiburu'].length.toString()
    );
  }

  printPolylines() {
    //this.alertText("CAMINOS de: ceciliachalliol", this.currentPolylinesByCreator["ceciliachalliol"].length.toString());
    this.alertText(
      'CAMINOS de: fmendiburu',
      this.currentPolylinesByCreator['fmendiburu'].length.toString()
    );
  }

  // public updatePoisWithResult(aPois) {
  //   debugger;
  //   let message;
  //   debugger;

  //   if (aPois.length > 0) {
  //     //ACA DEBO QUEDARME CON MIS PoIs SI SOY COLABORADOR
  //     let myPois;
  //     if (this.currentWorkspace.idOwner != this.userLogged.uid) { //SI NO SOY EL USUARIO CREADOR DEL WORKSPACE
  //       myPois = aPois.filter(poi => poi.creator === this.nameUserLogged); //SOLO PUEDO VER LOS MÍOS
  //       this.pois = myPois;
  //     } else { //CARGO UN CONJUNTO CON LOS NOMBRES DE LOS USUARIOS QUE CREARON PoIs
  //       this.pois = aPois; //EN PoIs GUARDO TODOS LOS PoIs
  //     }
  //     this.setCreators();
  //     let poisPisoActual = this.pois.filter(poi => poi.floorIdentifier === this.currentFloor.floorIdentifier); //Filtro los pois del piso donde estoy ya que los guardo por edificio
  //     if (poisPisoActual.length > 0) { //PoIs DEL PISO ACTUAL
  //       debugger;

  //       this.clearMarkers();
  //       let sizeOfMarkers = this.getCorrectSizeMarker(this.zoomActual);
  //       this.dibujarPoisEnMapa(poisPisoActual, sizeOfMarkers);
  //       //message = 'Los POIs han sido cargados correctamente.';
  //     } else {
  //       message = 'Este piso no posee POIs.';
  //       this.presentToast(message, 'top', null);
  //     }
  //   } else {
  //     message = 'Este edificio no posee POIs.';
  //     this.presentToast(message, 'top', null);
  //     return;
  //   }
  // }
  private getPois() {
    if (!this.map) {
      const message = 'Debe haber un mapa para mostrar los PoIs';
      this.presentToast(message, 'top', null);
      return;
    } else {
      this.loadingGetPois = this.createLoading('Recuperando PoIs');
      this.loadingGetPois.present();
      this.poisService
        .getPois(
          this.currentWorkspace.idWorkspace,
          this.currentFloor,
          this,
          this.loadingGetPois,
          'changeFloor'
        )
        .then((resPromesa) => {
          debugger;
          //this.updatePoisWithResult2(resPromesa);
        });
    }
  }

  dibujarPoiQREnMapa(aPoi) {
    let markerPosition: ILatLng = {
      lat: aPoi.coordinate.latitude,
      lng: aPoi.coordinate.longitude,
    };
    /*let urlMarkerColorQR = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|";
    let hexColour = "#FFFF00";*/
    this.mapService
      .drawMarkerInMap(
        this.map,
        markerPosition,
        aPoi.poiName,
        aPoi.colour,
        48,
        aPoi.hasQRCode
      )
      .then((marker) => {
        //marker es el resultado de la promesa
        this.currentMarkers.push(marker);

        marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
          this.verDatosPoi(marker.getTitle());
        });
      });
  }

  private verSiCerrarLoading(marcadoresADibujar, marcadoresDibujados, loading) {
    console.log('VIENDO SI CERRAR EL LOADING');
    console.log(
      'A DIBUJAR: ' +
        marcadoresADibujar.toString() +
        ' DIBUJADOS: ' +
        marcadoresDibujados.toString()
    );
    if (marcadoresADibujar == marcadoresDibujados) {
      if (loading) {
        this.hideLoading(loading);
      }
    }
  }

  private dibujarPoisEnMapa(
    arrayOfPoisByUser,
    size,
    marcadoresADibujar,
    marcadoresDibujados,
    loadingDrawingPois
  ) {
    debugger;
    arrayOfPoisByUser.forEach((aPoisByUser) => {
      let stringCreator = aPoisByUser[0].creator;
      //let markersOfUserAux = new Array<Marker>();
      this.currentMarkersByCreator[stringCreator] = new Array<Marker>();
      aPoisByUser.forEach((poi) => {
        this.addNewCreator(this.newCreator(poi)); //AGREGA UN NUEVO CREADOR SI ES QUE CORRESPONDE
        let markerPosition: ILatLng = {
          lat: poi.coordinate.latitude,
          lng: poi.coordinate.longitude,
        };
        console.log('SERVICIO DE MAPA:');
        console.log(this.mapService);
        if (this.currentWorkspace.status.idStatus == 'VersionFinalPublica') {
          if (poi.visible) {
            this.mapService
              .drawMarkerInMap(
                this.map,
                markerPosition,
                poi.poiName,
                this.currentWorkspace.applicationColour,
                size,
                poi.hasQRCode
              )
              .then((marker) => {
                //marker es el resultado de la promesa
                //this.currentMarkers.push(marker);
                
                marcadoresDibujados = marcadoresDibujados + 1;
                marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
                  this.verDatosPoi(poi);
                  // if(!poi.hasQRCode){/*SE DELEGA A DISTINTO TIPO DE ESTRATEGIA, POR ESO SE PREGUNTA SI TIENE O NO QR*/
                  //   this.verDatosPoiWLAN(marker.getTitle());
                  // }else{
                  //   this.verDatosPoiQR(marker.getTitle());
                  // }
                });
                //markersOfUserAux.push(marker);
                this.currentMarkersByCreator[stringCreator].push(marker);
                this.verSiCerrarLoading(
                  marcadoresADibujar,
                  marcadoresDibujados,
                  loadingDrawingPois
                );
              });
          } else {
            marcadoresDibujados = marcadoresDibujados + 1;
          }
        } else {
          this.mapService
            .drawMarkerInMap(
              this.map,
              markerPosition,
              poi.poiName,
              poi.colour,
              size,
              poi.hasQRCode
            )
            .then((marker) => {
              //marker es el resultado de la promesa
              //this.currentMarkers.push(marker);
              marcadoresDibujados = marcadoresDibujados + 1;
              //marker.setIconAnchor(25,-75);
              marker.setDraggable(true);
              marker.on(GoogleMapsEvent.MARKER_DRAG_END).subscribe(()=>{this.guardarPosicion(marker,poi)})
              marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(()=>
          {this.turnMarkerGreen(poi)});
              marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
                this.verDatosPoi(poi);
                // if(!poi.hasQRCode){/*SE DELEGA A DISTINTO TIPO DE ESTRATEGIA, POR ESO SE PREGUNTA SI TIENE O NO QR*/
                //   this.verDatosPoiWLAN(marker.getTitle());
                // }else{
                //   this.verDatosPoiQR(marker.getTitle());
                // }
              });
              //markersOfUserAux.push(marker);
              this.currentMarkersByCreator[stringCreator].push(marker);
              this.verSiCerrarLoading(
                marcadoresADibujar,
                marcadoresDibujados,
                loadingDrawingPois
              );
            });
        }
      });

      //delete this.currentMarkersByCreator[stringCreator];
      //this.currentMarkersByCreator[stringCreator] = markersOfUserAux;
      console.log('EL ARREGLO DE MARCADORES POR USUARIO TIENE:');
      console.log(this.currentMarkersByCreator);
    });
    if (arrayOfPoisByUser.length == 0) {
      console.log('MMM ME PARECE QUE ACA SI ENTRA');
      this.verSiCerrarLoading(
        marcadoresADibujar,
        marcadoresDibujados,
        loadingDrawingPois
      );
    }
  }

  badPosition(aPoi) {
    return (
      aPoi.buildingIdentifier == undefined ||
      aPoi.cartesianCoordinate == undefined ||
      aPoi.coordinate == undefined ||
      aPoi.floorIdentifier == undefined ||
      aPoi.position == undefined ||
      aPoi.isIndoor == undefined ||
      aPoi.isOutdoor == undefined
    );
  }

  savePoi(aPoi) {
    let message;
    let loadingSavePoi = this.createLoading('Guardando punto de interés (PoI)');
    this.poisService
      .savePoi(this.currentWorkspace.idWorkspace, aPoi)
      .then((resPromesa) => {
        if (resPromesa) {
          message = 'Se ha guardado el PoI correctamente.';
          this.presentToast(message, 'top', null);
          this.canChangeFloor = true; //Libero que pueda cambiar de piso el usuario
          this.hideLoading(loadingSavePoi);
          // if (poiResultado.QRCodeID == poiResultado.poiName) {
          //   this.mostrarQRCode(poiResultado); //MOSTRAR EL CODIGO QR PORQUE NO EXISTE
          // }
        } else {
          message = 'Hubo un error al guardar el PoI, intente nuevamente.';
          this.presentToast(message, 'top', null);
          this.hideLoading(loadingSavePoi);
        }
      });
  }

  private repositionAndSave(aPoi) {
    let loadingIndoorPositioning = this.createLoading('Reposicionando...');
    loadingIndoorPositioning.present();
    this.createPositionMarker();
    const locationOptions = this.mountLocationOptions();
    cordova.plugins.Situm.startPositioning(
      locationOptions,
      (res: any) => {
        this.positioning = true;
        this.currentPosition = res;
        aPoi.identifier = Date.now().toString();
        aPoi.buildingIdentifier = this.currentWorkspace.buildingIdentifier;
        aPoi.cartesianCoordinate = this.currentPosition.cartesianCoordinate;
        aPoi.coordinate = this.currentPosition.coordinate;
        aPoi.floorIdentifier = this.currentFloor.floorIdentifier;
        aPoi.position = this.currentPosition.position;
        aPoi.isIndoor = this.currentPosition.isIndoor;
        aPoi.isOutdoor = this.currentPosition.isOutdoor;
        if (!this.currentPosition || !this.currentPosition.coordinate) return;
        let position = this.mountPositionCoords(this.currentPosition);
        if (this.navigating) this.updateNavigation(this.currentPosition);
        debugger;
        let iconPosition: MarkerIcon = { size: { height: 60, width: 60 } };
        iconPosition.url = 'assets/img/finalFootPrint.png';
        this.marker.setIcon(iconPosition);
        this.marker.setPosition(position);
        this.hideLoading(loadingIndoorPositioning);
        this.detector.detectChanges();
        this.savePoi(aPoi);
        this.stopPositioning(null);
        this.startPositioning();
      },
      (err: any) => {
        const reason = err.match('reason=(.*),');
        let errorMessage = reason ? reason[1] : err;
        this.stopPositioning(loadingIndoorPositioning);
        console.log('Error when starting positioning.', err);
        const message = `Error when starting positioning. ${errorMessage}`;
        this.presentToast(message, 'bottom', null);
      }
    );
  }

  private saveCurrentPosition() {
    let primerPoi = new Poi();
    primerPoi.identifier = Date.now().toString();
    primerPoi.buildingIdentifier = this.currentWorkspace.buildingIdentifier;
    primerPoi.cartesianCoordinate = this.currentPosition.cartesianCoordinate;
    primerPoi.coordinate = this.currentPosition.coordinate;
    primerPoi.floorIdentifier = this.currentFloor.floorIdentifier;
    primerPoi.position = this.currentPosition.position;
    primerPoi.isIndoor = this.currentPosition.isIndoor;
    primerPoi.isOutdoor = this.currentPosition.isOutdoor;
    primerPoi.colour = this.userColour;
    primerPoi.creator = this.nameUserLogged;
    primerPoi.visible = true;
    let nuevoPoiModal = this.modalCtrl.create(NuevoPoiPage, {
      nuevoPoi: primerPoi,
      workspace: this.currentWorkspace,
      loggedUser: this.userLogged,
    }); //Le paso el poi casi completo
    nuevoPoiModal.onDidDismiss((poiResultado) => {
      //CUANDO SE CIERRE EL MODAL VUELVE CON DATOS
      debugger;
      let message;
      this.canChangeFloor = false;
      if (poiResultado != undefined) {
        //SI EL POI NO ESTA VACIO
        delete poiResultado.component; //LE SACO COSAS QUE AGREGO EL MODAL
        delete poiResultado.opts; //LE SACO COSAS QUE AGREGO EL MODAL

        if (this.badPosition(poiResultado)) {
          //A VECES LA POSICION SE LE ANULAN PARAMETROS, POR ESO ES BUENO CHEQUEARLO
          console.log('LA POSICION NO ERA BUENA');
          this.stopPositioning(null);
          this.repositionAndSave(poiResultado);
        } else {
          this.savePoi(poiResultado);
        }
      } else {
        this.canChangeFloor = true;
        //Se canceló la parte de agregar un POI
      }
      this.savingPoi = false; //Ya se cerró la ventana.
    });
    this.savingPoi = true; //Se va a abrir la ventana
    nuevoPoiModal.present();
  }

  /* private mostrarPosicionActual(res) { //PARA MOSTRAR LAS COORDENADAS ACTUALES COMO SE HACÍA BAJO EL NAVVAR
     this.posActual = {
       x: res.position.cartesianCoordinate.x.toString(),
       y: res.position.cartesianCoordinate.y.toString()
     };
   }*/
  private setUserData() {
    debugger;
    this.nameUserLogged = this.userLogged.email.split('@')[0]; //LE SACO LA PARTE DEL EMAIL
  }
  abrirModalLogin() {
    //let blockScreenPage = this.modalCtrl.create(BlockScreenPage);
    //blockScreenPage.onDidDismiss(poiResultado => { //CUANDO SE CIERRE EL MODAL VUELVE CON DATOS
    let modalLogin = this.modalCtrl.create(ModalLogin, {
      cssClass: 'modal-not-fullscreen-size',
    });
    modalLogin.onDidDismiss((user) => {
      //CUANDO SE CIERRE EL MODAL VUELVE CON DATOS
      console.log(user);
      debugger;
      this.userLogged = user;
      this.setUserData();
      this.events.publish('functionCall:successLogin', this.userLogged);
    });
    modalLogin.present();
    //});
    //blockScreenPage.present();
  }

  private checkIfIsLogged() {
    this.loginService.estadoDelUsuario().then((user) => {
      debugger;
      if (user.logged) {
        this.userLogged = user; //Tipo User (propio)
        this.setUserData();
        this.events.publish('functionCall:successLogin', this.userLogged);
        // this.nameUserLogged = user.userData.displayName;
      } else {
        this.userLogged = undefined;
        this.nameUserLogged = undefined;
        this.abrirModalLogin();
      }
    });
  }

  //ESTO VIENE DEL HOME TS
  ionViewDidEnter() {
    //ACA TENGO QUE LLAMAR A MI SERVICIO ;)+
    this.checkIfIsLogged();
  }

  // ionViewDidLeave(){
  //   this.stopPositioning(null);
  // }

  onViewDidLoad() {}

  private removeOverlayPiso() {
    if (this.overlayPisoActual) {
      this.overlayPisoActual.remove();
    }
  }

  cambiarPiso(selectedValue: any, fab: FabContainer) {
    //this.eliminarMarcadoresCorrespondientes(this.creators);
    //this.clearMarkers(); //SACA LOS MARCADORES
    //this.eliminarMarcadoresCorrespondientes(this.creators); //USA destroyMarkersForCreator
    // this.eliminarCaminosCorrespondientes(this.creators); //USA destroyPolylinesForCreator
    this.nroPisoActual = selectedValue;
    this.currentFloor = this.floors[this.nroPisoActual];
    //this.destroyAllMarkers();
    // if (this.positioning) { //Si está prendida la posición
    //   console.log("POSICION PRENDIDA AL CAMBIAR DE PISO")
    //   this.stopPositioning(null);
    //   this.startPositioning();
    // } else {
    //   console.log("POSICION APAGADA AL CAMBIAR DE PISO");
    // }

    let loading = this.createLoading('Cambiando piso...');
    this.mountOverlay(loading);
    this.closeFab(fab);
  }
  private closeFab(fab: FabContainer) {
    fab.close();
    this.habilitarMapa();
  }

  getSelectedWorkspaceStatus(aStringStatusclass) {
    switch (aStringStatusclass) {
      case 'EdicionDelCreador': {
        return new EdicionDelCreador();
      }
      case 'EdicionColaborativa': {
        return new EdicionColaborativa();
      }
      case 'EdicionDelCreadorVersionFinal': {
        return new EdicionDelCreadorVersionFinal();
      }
      case 'VersionFinalPublica': {
        return new VersionFinalPublica();
      }
    }
  }

  changeWorkspaceStatus(newStatusString) {
    //CUANDO CAMBIA EL USUARIO OWNER A MANO, LUEGO DE CAMBIARLO AVISA CUAL ES EL NUEVO ESTADO
    //this.lastKnownStatus = this.getSelectedWorkspaceStatus(this.currentWorkspace.status.idStatus);
    let newStatus = this.getSelectedWorkspaceStatus(newStatusString);
    debugger;
    if (newStatusString == 'VersionFinalPublica') {
      //LO ESTOY INTENTANDO CERRAR
      let modalWorkspaceRelease = this.modalCtrl.create(ModalWorkspaceRelease, {
        workspace: this.currentWorkspace,
      });
      modalWorkspaceRelease.onDidDismiss((strategies) => {
        //CUANDO SE CIERRE EL MODAL VUELVE CON DATOS
        debugger;
        if (strategies) {
          this.workspaceService
            .defineWorkspaceStrategiesAndUpdateState(
              this.currentWorkspace,
              newStatus,
              strategies
            )
            .then((response) => {
              if (!response) {
                this.currentWorkspace.status = this.getSelectedWorkspaceStatus(
                  this.lastKnownStatus.idStatus
                ); //VUELVO AL ESTADO ANTERIOR
                this.alertText(
                  'ERROR',
                  'Hubo un error al cerrar el workspace. Intente nuevamente.'
                );
              } else {
                this.lastKnownStatus = this.getSelectedWorkspaceStatus(
                  this.currentWorkspace.status.idStatus
                ); //GUARDO EL NUEVO ESTADO
                this.currentWorkspace.strategyToShowPoIWLAN =
                  strategies.estrategiaSeleccionadaParaMostrarPOIWLAN;
                this.currentWorkspace.strategyToShowPoIQR =
                  strategies.estrategiaSeleccionadaParaMostrarPOIQR;
                this.currentWorkspace.strategyToShowInformationPoIWLAN =
                  strategies.estrategiaSeleccionadaParaMostrarInformacionPOIWLAN;
                this.currentWorkspace.strategyToShowInformationPoIQR =
                  strategies.estrategiaSeleccionadaParaMostrarInformacionPOIQR;
                this.exportQRImages();
              }
            });
        } else {
          this.currentWorkspace.status = this.getSelectedWorkspaceStatus(
            this.lastKnownStatus.idStatus
          ); //VUELVO AL ESTADO ANTERIOR
          this.alertText(
            'AVISO',
            'Para cerrar el workspace debe definir las todas estrategias correspondientes.'
          );
        }
      });
      modalWorkspaceRelease.present();
    } else {
      this.workspaceService
        .updateWorkspaceState(this.currentWorkspace, newStatus)
        .then((response) => {
          if (!response) {
            //MARQUITA
            this.alertText(
              'ERROR',
              'Hubo un error al cambiar el estado del workspace. Intente nuevamente.'
            );
            this.currentWorkspace.status = this.getSelectedWorkspaceStatus(
              this.lastKnownStatus.idStatus
            ); //VUELVO AL ESTADO ANTERIOR
          } else {
            this.lastKnownStatus = this.getSelectedWorkspaceStatus(
              this.currentWorkspace.status.idStatus
            ); //GUARDO EL NUEVO ESTADO
          }
        });
    }
  }

  private toggleClickeable() {
    if (this.isClickable) {
      this.map.setClickable(false);
      this.isClickable = false;
    } else {
      this.map.setClickable(true);
      this.isClickable = true;
    }
  }

  private preventClick() {}

  private habilitarMapa() {
    this.map.setClickable(true);
    this.isClickable = true;
  }

  public verMapaReal(unEdificio) {
    this.mapLoaded = true;
    if (!this.map) {
      //SI HAY O NO HAY MAPA DA IGUAL (SI LO SACO REVIENTA PORQUE EL LOADING ES DEL MAPA)
      this.platform
        .ready()
        .then(() => {
          // Shows a loading while the map is not displayed
          let loading = this.createLoading('Cargando mapa...');
          loading.present();
          this.building = unEdificio;
          this.floors = unEdificio.floors;
          this.currentFloor = this.floors[0];

          this.nroPisoActual = 0;
          debugger;
          this.mountMap(unEdificio);

          this.map
            .one(GoogleMapsEvent.MAP_READY)
            .then(() => {
              this.mountOverlay(loading);
            })
            .catch((err: any) => this.handleError(err, loading));

          // Fetchs all floors of a building, more details in http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.fetchFloorsFromBuilding
          /*cordova.plugins.Situm.fetchFloorsFromBuilding(unEdificio, (res) => {
          this.floors = res;
          this.currentFloor = this.floors[0];
          this.nroPisoActual = 0;
          this.mountMap();
          this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
            this.mountOverlay(loading);
          }).catch((err: any) => this.handleError(err, loading));
        });*/
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      let loading = this.createLoading('Redireccionando...');
      loading.present();
      this.building = unEdificio;
      this.floors = unEdificio.floors;
      this.currentFloor = this.floors[0];
      this.nroPisoActual = 0;
      this.currentFloor = this.floors[this.nroPisoActual];
      //this.clearMarkers();
      this.destroyAllMarkers();
      this.moverMapa(loading);
      debugger;
    }
  }

  private moverMapa(loading) {
    let latlng = this.getCenter(this.building);
    let zoom = 19;
    this.mapService.rePositioning(this.map, latlng, zoom).then((resPromesa) => {
      //this.map = resPromesa; //SETEA EL MAPA CON LA CAMARA CAMBIADA
      this.mountOverlay(loading); //LLAMA A MONTAR LA IMAGEN DEL EDIFICIO
    });
  }

  needResize(newZoom) {
    if (this.zoomActual > 20) {
      //SI ESTOY EN EL RANGO MAS ALTO Y BAJÉ
      if (newZoom <= 20) {
        return true;
      }
    }
    if (this.zoomActual <= 20 && this.zoomActual > 18) {
      //SI ESTOY EN UN RANGO DEL MEDIO, Y ME FUI DE RANGO HACIA ARRIBA O HACIA ABAJO
      if (newZoom > 20 || newZoom <= 18) {
        return true;
      }
    }
    if (this.zoomActual <= 18 && this.zoomActual > 16) {
      //SI ESTOY EN UN RANGO DEL MEDIO, Y ME FUI DE RANGO HACIA ARRIBA O HACIA ABAJO
      if (newZoom > 18 || newZoom <= 16) {
        return true;
      }
    }
    if (this.zoomActual < 16) {
      //ESTOY EN EL RANGO MAS BAJO Y SUBO
      if (newZoom >= 16) {
        return true;
      }
    }
    return false;
  }

  private mountMap(aBuilding) {
    //CREA UN MAPA CON LOS ELEMENTOS QUE LE PASO

    this.map = this.mapService.createMap(
      this.getElementById('map'),
      this.getCenter(aBuilding),
      this.zoomActual
    );
    this.map.on(GoogleMapsEvent.CAMERA_MOVE).subscribe((data) => {
      let nuevoZoom = data[0].zoom;
      if (this.needResize(nuevoZoom)) {
        // SI ES QUE NECESITO REDIMENCIONAR LOS ICONOS, ME FIJO A QUE TAMAÑO LUEGO
        this.destroyAllMarkers();
        this.dibujarMarcadoresCorrespondientes(true);
        // let markerSize = this.getCorrectSizeMarker(nuevoZoom);
        // this.dibujarPoisEnMapa(this.pois, markerSize);
      }
      this.zoomActual = nuevoZoom;
    });
  }

  private mountOverlay(loading) {
    let bounds = this.getBounds(this.building);
    debugger;
    this.mapService
      .addGroundOverlay(
        this.map,
        this.currentFloor.mapUrl,
        bounds,
        this.building.rotation
      )
      .then((resPromesa) => {
        this.removeOverlayPiso();
        this.overlayPisoActual = resPromesa;
        if (loading) {
          this.hideLoading(loading);
        }
        this.getPois();
        //this.startPositioning();
      });
  }
  // private resetPositioning(loadingIndoorPositioning) {
  //   debugger;
  //   if (this.positioning == false) {
  //     this.currentPosition = undefined;
  //     this.stopPositioning(loadingIndoorPositioning);
  //     this.timerTenSecondsExecuted = true;
  //     if (this.errorGPSDisabedExecuted == false) {
  //       this.alertText("No se pudo posicionar.", "Por favor intente nuevamente.");
  //     }
  //   }
  // }
  private imprimirPaso() {}

  private checkGPSEnabled() {
    let successCallback = (isAvailable) => {
      //CALLBACK VUELVE DE PREGUNTAR SI ESTABA PRENDIDO
      if (isAvailable) {
        this.startPositioning(); //SI ESTABA PRENDIDO VOY A INTENTAR POSICIONAR
      } else {
        this.diagnostic.switchToLocationSettings(); //SINO VOY A LA CONFIGURACION
        this.diagnostic.registerLocationStateChangeHandler(function (state) {
          console.log('ESTADO: ', state);
          /*VOY A REPETIR CODIGO PERO NO DEBERIA*/
          if (state != 'location_off') {
            let loadingIndoorPositioning;
            // let timer;
            // this.timerTenSecondsExecuted = false;
            // this.errorGPSDisabedExecuted = false;
            this.permissionsService
              .checkLocationPermissions()
              .then((permission) => {
                console.log('Location permission?', permission);
                debugger;
                if (permission) {
                  if (this.positioning == true) {
                    debugger;
                    const message = 'Position listener is already enabled.';
                    this.presentToast(message, 'bottom', null);
                    return;
                  }
                  if (!this.map) {
                    debugger;
                    const message =
                      'The map must be visible in order to launch the positioning';
                    this.presentToast(message, 'bottom', null);
                    return;
                  }
                  debugger;
                  loadingIndoorPositioning = this.createLoading(
                    'Cargando posición indoor...'
                  );
                  loadingIndoorPositioning.present();
                  this.createPositionMarker();
                  const locationOptions = this.mountLocationOptions();
                  // Set callback and starts listen onLocationChanged event
                  // More details in http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.startPositioning
                  //timer = setTimeout(() => this.resetPositioning(loadingIndoorPositioning), 10000);
                  debugger;

                  cordova.plugins.Situm.startPositioning(
                    locationOptions,
                    (res: any) => {
                      //debugger;
                      this.positioning = true;
                      this.currentPosition = res;
                      console.log('LA POSICION ES:');
                      console.log(res);
                      if (
                        !this.currentPosition ||
                        !this.currentPosition.coordinate
                      )
                        return;
                      let position = this.mountPositionCoords(
                        this.currentPosition
                      );

                      // Update the navigation
                      if (this.navigating)
                        this.updateNavigation(this.currentPosition);
                      debugger;
                      let iconPosition: MarkerIcon = {
                        size: { height: 60, width: 60 },
                      };
                      iconPosition.url = 'assets/img/finalFootPrint.png';

                      this.marker.setIcon(iconPosition);
                      this.marker.setPosition(position);
                      this.hideLoading(loadingIndoorPositioning);
                      this.detector.detectChanges();
                      //this.mostrarPosicionActual(res);
                    },
                    (err: any) => {
                      debugger;
                      const reason = err.match('reason=(.*),');
                      let errorMessage = reason ? reason[1] : err;
                      this.stopPositioning(loadingIndoorPositioning);
                      /*if (this.timerTenSecondsExecuted == false) {*/
                      //this.alertText("No se pudo posicionar.", "Encienda el GPS e intente nuevamente.");
                      //this.errorGPSDisabedExecuted = true;
                      /* }*/
                      console.log('Error when starting positioning.', err);
                      const message = `Error when starting positioning. ${errorMessage}`;
                      this.presentToast(message, 'bottom', null);
                    }
                  );
                } else {
                  debugger;
                  this.stopPositioning(loadingIndoorPositioning);
                  const message = `You must have the location permission granted for positioning.`;
                  this.presentToast(message, 'bottom', null);
                }
              })
              .catch((error) => {
                debugger;
                //this.hideLoading(loadingIndoorPositioning);
                console.log(error);
                this.stopPositioning(loadingIndoorPositioning);
                //timer = 0;
                const message = `Debe activar el gps y el bluetooth para el posicionamiento indoor . ${error}`;
                //const message = `Error when requesting for location permissions. ${error}`
                this.presentToast(message, 'bottom', null);
              });
          }
          /*FIN REPETIR CODIGO STARTW*/
        });
      }
    };
    let errorCallback = (e) => console.error('ERROR: ', e);
    //this.diagnostic.isLocationEnabled().then(successCallback).catch(errorCallback);
    // only android
    this.diagnostic.isGpsLocationEnabled().then(successCallback, errorCallback);
  }

  private startPositioning() {
    let loadingIndoorPositioning;
    // let timer;
    // this.timerTenSecondsExecuted = false;
    // this.errorGPSDisabedExecuted = false;
    this.permissionsService
      .checkLocationPermissions()
      .then((permission) => {
        console.log('Location permission?', permission);
        debugger;
        if (permission) {
          if (this.positioning == true) {
            debugger;
            const message = 'Position listener is already enabled.';
            this.presentToast(message, 'bottom', null);
            return;
          }
          if (!this.map) {
            const message =
              'The map must be visible in order to launch the positioning';
            this.presentToast(message, 'bottom', null);
            return;
          }

          loadingIndoorPositioning = this.createLoading(
            'Cargando posición indoor...'
          );
          loadingIndoorPositioning.present();
          this.createPositionMarker();
          const locationOptions = this.mountLocationOptions();
          // Set callback and starts listen onLocationChanged event
          // More details in http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.startPositioning
          //timer = setTimeout(() => this.resetPositioning(loadingIndoorPositioning), 10000);

          cordova.plugins.Situm.startPositioning(
            locationOptions,
            (res: any) => {
              debugger;
              this.positioning = true;
              this.currentPosition = res;
              if (!this.currentPosition || !this.currentPosition.coordinate)
                return;
              let position = this.mountPositionCoords(this.currentPosition);

              // Update the navigation
              if (this.navigating) this.updateNavigation(this.currentPosition);
              let iconPosition: MarkerIcon = {
                size: { height: 44, width: 44 },
              };
              iconPosition.url = 'assets/img/finalFootPrint.png';
              this.marker.setIcon(iconPosition);
              this.marker.setPosition(position);
              this.hideLoading(loadingIndoorPositioning);
              this.detector.detectChanges();
              //this.mostrarPosicionActual(res);
            },
            (err: any) => {
              const reason = err.match('reason=(.*),');
              let errorMessage = reason ? reason[1] : err;
              this.stopPositioning(loadingIndoorPositioning);
              /*if (this.timerTenSecondsExecuted == false) {*/
              //this.alertText("No se pudo posicionar.", "Encienda el GPS e intente nuevamente.");
              //this.errorGPSDisabedExecuted = true;
              /* }*/
              console.log('Error when starting positioning.', err);
              const message = `Error when starting positioning. ${errorMessage}`;
              this.presentToast(message, 'bottom', null);
            }
          );
        } else {
          debugger;
          this.stopPositioning(loadingIndoorPositioning);
          const message = `You must have the location permission granted for positioning.`;
          this.presentToast(message, 'bottom', null);
        }
      })
      .catch((error) => {
        debugger;
        //this.hideLoading(loadingIndoorPositioning);
        console.log(error);
        this.stopPositioning(loadingIndoorPositioning);
        //timer = 0;
        const message = `Debe activar el gps y el bluetooth para el posicionamiento indoor . ${error}`;
        //const message = `Error when requesting for location permissions. ${error}`
        this.presentToast(message, 'bottom', null);
      });
  }

  private mountLocationOptions() {
    debugger;
    let locationOptions = new Array();
    locationOptions.push(this.building);
    (defaultOptionsMap[
      'buildingIdentifier'
    ] = this.building.buildingIdentifier),
      locationOptions.push(defaultOptionsMap);
    return locationOptions;
  }

  private mountPositionCoords(position): ILatLng {
    return {
      lat: position.coordinate.latitude,
      lng: position.coordinate.longitude,
    };
  }

  private updateNavigation(position) {
    // Sends a position to the location manager for calculate the navigation progress

    cordova.plugins.Situm.updateNavigationWithLocation(
      position,
      (result) => {
        debugger;
        console.log('RESULT ES:');
        console.log(result);
        this.presentAlert();
      },
      (error) => {
        debugger;
        // If errors will come here
      }
    );
    /*cordova.plugins.Situm.updateNavigationWithLocation([position], function (error) {
      console.log(error);
    }, function (error) {
      console.log(error);
    });*/
  }

  private stopPositioning(loading) {
    if (loading == null) {
      this.positioning = true;
    }
    if (this.positioning == false) {
      console.log('Position listener is not enabled.');
      this.hideLoading(loading);
      return;
    }
    cordova.plugins.Situm.stopPositioning(() => {
      if (this.marker) this.marker.remove();
      if (this.polyline) {
        this.polyline.remove();
        this.route = null;
      }
      this.positioning = false;
      this.detector.detectChanges();
      this.hideLoading(loading);
    });
  }

  /*private showRoute() {
    debugger;
    if (!this.map || (!this.pois || this.pois.length == 0) || !this.positioning) {
      const message = 'El mapa y los POIs deben ser visibles, y la posición actual debe conocerse para determinar la ruta';
      //const message = 'The map with the POIs must be visible and the positioning must be started in order to determine the route';
      this.presentToast(message, 'top', null);
      return;
    }

    if (this.route) {
      const message = 'La ruta ya está pintada en el mapa.';
      //const message = 'The route is already painted on the map.';
      this.presentToast(message, 'top', null);
      return;
    }

    console.log("Position is: " + this.currentPosition.bearing.degrees);

    let directionsOptionsMap = {
      accesible: this.accessible,
      startingAngle: this.currentPosition.bearing.degrees,
    };

    // Calculates a route between two points
    // In this case, determining route between the current position and the second POI
    // More details in http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.requestDirections
    cordova.plugins.Situm.requestDirections([this.building, this.currentPosition, this.pois[0], directionsOptionsMap], (route: any) => {
      //debugger;
      this.route = route;
      this.drawRouteOnMap(route);
      this.detector.detectChanges();
    }, (err: any) => {
      console.error(err);
      const message = `Error when drawing the route. ${err}`;
      this.presentToast(message, 'bottom', null);
      return;
    });
  }*/

  private removeRouteFromMap() {
    if (this.polyline) {
      this.polyline.remove();
    }
  }

  private drawRouteOnMap(route) {
    //debugger;
    let polylineOptions: PolylineOptions = {
      color: ROUTE_COLOR,
      width: 8,
      points: [],
    };
    route.points.forEach((point) => {
      polylineOptions.points.push({
        lat: point.coordinate.latitude,
        lng: point.coordinate.longitude,
      });
    });
    this.map.addPolyline(polylineOptions).then((polyline: Polyline) => {
      this.polyline = polyline;
    });
  }

  private updateAccessible() {
    console.log(`Accessibility status: ${this.accessible}`);
    this.accessible = !this.accessible;
    this.detector.detectChanges();
  }

  private createPositionMarker() {
    let defaultOptions: MarkerOptions = {
      position: { lat: 0, lng: 0 },
      title: 'Usted está aquí',
    };
    this.createMarker(defaultOptions, this.map, true);
  }
  private stopNavigation() {
    this.navigating = false;
    this.removeRouteFromMap();
    this.setPositioningIcon();
  }

  private startNavigationToPoi(aPoi) {
    if (this.navigating) {
      this.removeRouteFromMap();
      this.getRouteAndDrawInMap(aPoi);
    } else {
      this.navigating = true;
      this.getRouteAndDrawInMap(aPoi);
      this.setNavigationIcon();
    }
  }

  private setNavigationIcon() {
    let markerIcon: MarkerIcon = {
      size: { height: 35, width: 35 },
    };
    markerIcon.url =
      'http://wfarm2.dataknet.com/static/resources/icons/set52/d41abb1b.png';
    this.marker.setIcon(markerIcon);
  }

  private setPositioningIcon() {
    this.marker.remove();
    this.createPositionMarker();
    this.marker.showInfoWindow();
  }

  private comenzarNavegacion() {
    //NUEVO METODO SEGUN LA DOCUMENTACION

    var navigationOptions = new Object();
    navigationOptions['distanceToIgnoreFirstIndication'] = 0.3; // (Optional) meters;
    navigationOptions['outsideRouteThreshold'] = 10; // (Optional) meters;
    navigationOptions['distanceToGoalThreshold'] = 7; // (Optional) meters;
    navigationOptions['distanceToFloorChangeThreshold'] = 10; // (Optional) meters;
    navigationOptions['distanceToChangeIndicationThreshold'] = 5; // (Optional) meters
    cordova.plugins.Situm.requestNavigationUpdates(
      [navigationOptions],
      (res: any) => {
        // Progress and other navigation status messages can be processed here
        debugger;
        console.log(res);
      },
      (error: any) => {
        debugger;
        // If errors will come here
      }
    );
  }

  /* private requestNavigation() { ESTE METODO NUNCA LO TOQUE
     if (this.navigating) {
       const message = 'Navigation is already activated';
       this.presentToast(message, 'bottom', null);
       return;
     }
     // Adds a listener to receive navigation updates when the
     // updateNavigationWithLocation method is called
     cordova.plugins.Situm.requestNavigationUpdates();
     this.navigating = true;
     const msg = 'Added a listener to receive navigation updates';
     this.presentToast(msg, 'bottom', null);
   }*/

  private removeNavigation() {
    if (!this.navigating) {
      const message = 'Navigation is already deactivated';
      this.presentToast(message, 'bottom', null);
      return;
    }
    // Removes the listener from navigation updates
    cordova.plugins.Situm.removeNavigationUpdates();
    this.navigating = false;
    const msg = 'Removed the listener from navigation updates';
    this.presentToast(msg, 'bottom', null);
  }

  private clearCache() {
    // Invalidate all the resources in the cache
    // More details in
    // http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.invalidateCache
    cordova.plugins.Situm.invalidateCache();
    const msg = `All resources in the cache have been invalidated.`;
    this.presentToast(msg, 'bottom', null);
  }

  private stablishCache() {
    // Sets the maximum age of a cached response.
    // More details in http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.setCacheMaxAge
    const maxAge: number = 7000;
    cordova.plugins.Situm.setCacheMaxAge(maxAge);
    const msg = `The maximun age of cached responses has been set at ${maxAge} seconds.`;
    this.presentToast(msg, 'bottom', null);
  }

  /*ver datos poi*/
  public abrirPoi(unTituloPoi) {
    debugger;
    let searchedPoi;
    this.pois.some((poisByCreator) => {
      let found;
      found = poisByCreator.find((poi) => poi.poiName === unTituloPoi);
      if (found != undefined) {
        searchedPoi = found;
        return true;
      }
    });
    //let selectedPoi = this.pois.find(poi => poi.poiName === unTituloPoi); //ENCUENTRA EL POI Y LO MANDA COMPLETO
    if (searchedPoi) {
      //{ cssClass: 'modal-not-fullscreen-size', poi: this.poi }
      let modalDetallePoi = this.modalCtrl.create(ModalContentPage, {
        workspace: this.currentWorkspace,
        poi: searchedPoi,
        userLogged: this.userLogged,
      });
      modalDetallePoi.onDidDismiss((poi) => {
        //CUANDO SE CIERRE EL MODAL VUELVE CON DATOS
        if (poi) {
          this.startNavigationToPoi(poi);
        }
      });
      modalDetallePoi.present();
    } //SI NO ES UNDEFINED EL ELEMENTO (POR EJEMPLO SI ERA LA POSICION ACTUAL)
  }

  private noAbrirPoi(unTituloPoi) {
    this.alertText(
      'AVISO',
      'Sólo se puede brindar la información del PoI "' +
        unTituloPoi +
        '", escaneando el código QR presente en el sitio donde está positionado el marcador, a través de la opción "Escanear código QR" presente en el menú contextual.'
    );
  }

  public abrirPoiDirectamente(aPoi) {
    /* NO SE DELEGA EN NINGUNA ESTRATEGIA */
    this.abrirPoi(aPoi.poiName);
  }

  public abrirPoiSegunEstrategia(aPoi) {
    /* SE EJECUTA CUANDO EL WORKSPACE HA SIDO PUBLICADO */
    /*PUEDE MANDAR A ABRIR UN POI o A NO ABRIRLO */
    if (!aPoi.hasQRCode) {
      this.currentWorkspace.strategyToShowInformationPoIWLAN.verDatosPoi(
        aPoi,
        this
      );
    } else {
      this.currentWorkspace.strategyToShowInformationPoIQR.verDatosPoi(
        aPoi,
        this
      );
    }
  }

  private verDatosPoi(aPoi) {
    this.currentWorkspace.status.openPoiByStatus(aPoi, this);
    /*VA A ABRIR UN POI DIRECTAMENTE O SEGUN LA ESTRATEGIA */
  }

  //QUEDARME CON EL MARCADOR PARA CAMBIARLE EL ICONO CUANDO NAVEGO O NO
  // private clearMarkers() { //FALTA LLAMARLO
  //   debugger;
  //   // this.alertText("SE LLAMO AL CLEAR MARKERS","");
  //   if (this.currentMarkers.length > 0) {
  //     this.currentMarkers.forEach(marker => {
  //       marker.remove()
  //     });
  //   }
  //   this.currentMarkers = [];
  // }

  destroyOneMarkerForCreator(aCreatorString, aMarkerTitle) {
    if (this.currentMarkersByCreator[aCreatorString] != undefined) {
      this.currentMarkersByCreator[aCreatorString].some((marker) => {
        if (marker.getTitle() == aMarkerTitle) {
          marker.remove();
          console.log('ENCONTRE EL MARCADOR Y LO BORRE');
          return true;
        }
      });
      this.currentMarkersByCreator[
        aCreatorString
      ] = this.currentMarkersByCreator[aCreatorString].filter(
        (marker) => marker.getTitle() != aMarkerTitle
      );
    } else {
      console.log('LA COLECCION DE MARCADORES DEL USUARIO ERA UNDEFINED');
    }
  }

  destroyMarkersForCreator(aCreatorString) {
    debugger;
    if (this.currentMarkersByCreator[aCreatorString] != undefined) {
      this.currentMarkersByCreator[aCreatorString].forEach((marker) => {
        marker.remove();
      });
      delete this.currentMarkersByCreator[aCreatorString];
    }
  }

  destroyAllMarkers() {
    Object.keys(this.currentMarkersByCreator).forEach((creatorString) => {
      this.currentMarkersByCreator[creatorString].forEach((marker) => {
        marker.remove();
      });
      delete this.currentMarkersByCreator[creatorString];
    });
  }

  /*Delegar el create marker al tipo de estrategia*/

  private createMarker(options: MarkerOptions, map, currentPosition) {
    //PONE EL MARCADOR EN EL MAPA
    map.addMarker(options).then((marker: Marker) => {
      marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
        this.verDatosPoi(marker.getTitle());
      });
      if (currentPosition) {
        this.marker = marker;
      }
    });
  }

  private handleError(error, loading) {
    this.hideLoading(loading);
  }

  private getElementById(id): HTMLElement {
    return document.getElementById(id);
  }

  private hideLoading(loading) {
    if (typeof loading != undefined && typeof loading != null) {
      if (loading) {
        loading.dismissAll();
      }
      loading = null;
    }
  }

  private createLoading(msg) {
    return this.loadingCtrl.create({
      content: msg,
    });
  }

  private getBounds(building) {
    if (!building) return;
    return [
      {
        lat: building.bounds.southWest.latitude,
        lng: building.bounds.southWest.longitude,
      },
      {
        lat: building.bounds.northEast.latitude,
        lng: building.bounds.northEast.longitude,
      },
    ];
  }

  private getCenter(building): LatLng {
    return new LatLng(building.center.latitude, building.center.longitude);
  }

  ionViewWillLeave() {
    this.stopPositioning(null);
  }

  presentToast(text, position, toastClass) {
    const toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: position,
      cssClass: toastClass ? toastClass : '',
    });
    toast.present();
  }

  mapHidden() {
    if (!this.map) return true;
    return false;
  }

  positioningStopped() {
    if (!this.positioning) return true;
    return false;
  }

  noPois() {
    if (!this.pois || this.pois.length == 0) return true;
    return false;
  }

  routeConditionsNotSet() {
    if (this.noPois() || this.mapHidden() || this.positioningStopped())
      return true;
    return false;
  }

  navigationConditionsNotSet() {
    if (this.routeConditionsNotSet() || !this.route) return true;
    return false;
  }


  // * Probando cambiar color de marker
  turnMarkerGreen(poi:Poi){
    poi.colour = '#66BB6A';
    this.poisService.savePoi(this.currentWorkspace.idWorkspace,poi).then((res)=>{});
  }
  
  guardarPosicion(marker:Marker,poi:Poi){
    poi.coordinate.latitude = marker.getPosition().lat.toString();
    poi.coordinate.longitude = marker.getPosition().lng.toString();
    this.poisService.savePoi(this.currentWorkspace.idWorkspace,poi).then((res)=>{});
  }
  ///
}