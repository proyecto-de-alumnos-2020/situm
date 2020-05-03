import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, ChangeDetectorRef } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { GoogleMaps } from '@ionic-native/google-maps';
import { Diagnostic } from '@ionic-native/diagnostic';
import { PermissionsService } from '../services/permissions';

//Imports de páginas
import { MyApp } from './app.component';
import { PositioningPage } from '../pages/positioning/positioning';
import { NavbarComponent } from '../components/navbar/navbar';
import { MapButtonComponent } from '../components/mapButton/mapButton';
import { ModalContentPage } from '../pages/modal/modal';
import { QRCodePage } from '../pages/modalQR/modalQR';
import { ModalLogin } from '../pages/login/modalLogin';
import { ModalNewWorkspace } from '../pages/nuevoWorkspace/newWorkspace';
import { ShareWorkspaceViaQR } from '../pages/modalShareWorkspaceViaQR/modalShareWorkspaceViaQR';
import { ModalWorkspacesList } from '../pages/modalWorkspacesList/modalWorkspacesList';
import { ModalInformation } from '../pages/modalInformation/modalInformation';
import { ModalDeletePOI } from '../pages/modalDeletePoi/modalDeletePoi';
import { ModalFilterPoi } from '../pages/modalFilterPoi/modalFilterPoi';
import { ModalExitApp } from '../pages/modalExitApp/modalExitApp';
import { ModalWorkspaceRelease } from '../pages/modalWorkspaceRelease/modalWorkspaceRelease';

//Imports de Firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

//Imports de mis servicios
import { PoisService } from '../services/pois.service';
import { BuildingsService } from '../services/buildings.service';
import { NuevoPoiPage } from '../pages/nuevoPoi/nuevoPoi';
import { MapService } from '../services/map.service';
import { LoginService } from '../services/login.service';
import { WorkspaceService } from '../services/workspace.service';
import { PositioningService } from '../services/positioning.service';
import { Network } from '@ionic-native/network';

//Imports de Camara
import { Camera } from '@ionic-native/camera';
import { QRScanner } from '@ionic-native/qr-scanner';
import { QRCodeModule } from 'angularx-qrcode';

//Imports para exportar los códigos QR
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { BlockScreenPage } from '../pages/blockScreen/blockScreen';

import { firebaseConfig } from '../firebaseConfig';

@NgModule({
  declarations: [
    MyApp,
    PositioningPage,
    NavbarComponent,
    MapButtonComponent,
    ModalContentPage,
    NuevoPoiPage,
    QRCodePage,
    ModalLogin,
    ModalNewWorkspace,
    ModalWorkspacesList,
    ShareWorkspaceViaQR,
    ModalInformation,
    ModalDeletePOI,
    ModalFilterPoi,
    ModalExitApp,
    ModalWorkspaceRelease,
    BlockScreenPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp), //Imports de Firebase
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    QRCodeModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    PositioningPage,
    ModalContentPage,
    NuevoPoiPage,
    QRCodePage,
    ModalLogin,
    ModalNewWorkspace,
    ModalWorkspacesList,
    ShareWorkspaceViaQR,
    ModalInformation,
    ModalDeletePOI,
    ModalFilterPoi,
    ModalExitApp,
    ModalWorkspaceRelease,
    BlockScreenPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    GoogleMaps,
    Diagnostic,
    PermissionsService,
    PoisService,
    BuildingsService,
    LoginService,
    MapService,
    WorkspaceService,
    PositioningService,
    Camera,
    PositioningPage,
    BarcodeScanner, //PARA ENCODE SIN MOSTRAR
    QRScanner,
    FileTransfer,
    File,
    Network,
  ],
})
export class AppModule {}
