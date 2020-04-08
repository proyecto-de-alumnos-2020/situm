import { Component } from '@angular/core';
import { Platform, ViewController } from 'ionic-angular';
import { WorkspaceService } from '../../services/workspace.service';


@Component({
  selector: 'page-modalWorkspaceRelease',
  templateUrl: 'modalWorkspaceRelease.html',
})
export class ModalWorkspaceRelease {
  //CUANDO MUESTRO LOS MARKERS
  //MARKERS WLAN
  estrategiaSeleccionadaParaMostrarPOIWLAN: any;
  estrategiasParaMostrarPOIWLAN = ["MostrarMarcadorSiempre", "MostrarMarcadorPorProximidad"];
  //MARKERS QR
  estrategiaSeleccionadaParaMostrarPOIQR: any;
  estrategiasParaMostrarPOIQR = ["MostrarMarcadorSiempre", "MostrarMarcadorPorProximidad", "MostrarMarcadorPorEscaneo"];

  //CUANDO MUESTRO LA INFORMACION DE ESOS MARKERS
  //MARKERS WLAN
  estrategiaSeleccionadaParaMostrarInformacionPOIWLAN: any;
  estrategiasParaMostrarInformacionPOIWLAN = ["MostrarInformacionPorProximidad", "MostrarInformacionSiempreQueEstePosicionadoEnElEdificio"];
  //MARKERS QR
  estrategiaSeleccionadaParaMostrarInformacionPOIQR: any;
  estrategiasParaMostrarInformacionPOIQR = ["MostrarInformacionPorEscaneo"];

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    private workspaceService: WorkspaceService
  ) {
  }

  estrategiasCompletas() {
    return (this.estrategiaSeleccionadaParaMostrarPOIWLAN != undefined && this.estrategiaSeleccionadaParaMostrarPOIWLAN != "undefined" &&
      this.estrategiaSeleccionadaParaMostrarPOIQR != undefined && this.estrategiaSeleccionadaParaMostrarPOIQR != "undefined" &&
      this.estrategiaSeleccionadaParaMostrarInformacionPOIWLAN != undefined && this.estrategiaSeleccionadaParaMostrarInformacionPOIWLAN != "undefined" &&
      this.estrategiaSeleccionadaParaMostrarInformacionPOIQR != undefined && this.estrategiaSeleccionadaParaMostrarInformacionPOIQR != "undefined")
  }

  cerrarWorkspace() {
    let unaEstrategiaParaMostrarPOIWLAN = this.workspaceService.getStrategyToShowMarker(this.estrategiaSeleccionadaParaMostrarPOIWLAN);
    let unaEstrategiaParaMostrarPOIQR = this.workspaceService.getStrategyToShowMarker(this.estrategiaSeleccionadaParaMostrarPOIQR);
    let unaEstrategiaParaMostrarInformacionPOIWLAN = this.workspaceService.getStrategyToShowInformation(this.estrategiaSeleccionadaParaMostrarInformacionPOIWLAN);
    let unaEstrategiaParaMostrarInformacionPOIQR = this.workspaceService.getStrategyToShowInformation(this.estrategiaSeleccionadaParaMostrarInformacionPOIQR);
    this.viewCtrl.dismiss(
      {
        estrategiaSeleccionadaParaMostrarPOIWLAN: unaEstrategiaParaMostrarPOIWLAN,
        estrategiaSeleccionadaParaMostrarPOIQR: unaEstrategiaParaMostrarPOIQR,
        estrategiaSeleccionadaParaMostrarInformacionPOIWLAN: unaEstrategiaParaMostrarInformacionPOIWLAN,
        estrategiaSeleccionadaParaMostrarInformacionPOIQR: unaEstrategiaParaMostrarInformacionPOIQR
      }
    )
  }

  cancelar() {
    this.viewCtrl.dismiss(undefined);
    //ACA DEBO VOLVER AL ESTADO ANTERIOR
  }
}
