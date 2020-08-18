import { USER_EMAIL, USER_API_KEY } from './situm';
import { GoogleMapsEvent, MarkerIcon } from '@ionic-native/google-maps';

declare var cordova: any;

const defaultOptionsMap = {
    useDeadReckoning: false,
    interval: 1000,
    indoorProvider: 'INPHONE',
    useBle: true,
    useWifi: true,
    motionMode: 'BY_FOOT',
    useForegroundService: true, //BACKGROUND SERVICE
    outdoorLocationOptions: {
        continuousMode: true,
        userDefinedThreshold: false,
        burstInterval: 1,
        averageSnrThreshold: 25.0
    },
    beaconFilters: [],
    smallestDisplacement: 1.0,
    realtimeUpdateInterval: 1000
};
export abstract class SensingMechanism {
    idPositioning: string;
    constructor(idPositioning) {
        this.idPositioning = idPositioning;
    }
    abstract startPositioning(page); 
    abstract stopPositioning(page);
    abstract getCartesianCoordinate(page): { x: string; y: string; }
    abstract getCoordinate(page): { latitude: string; longitude: string; } 
    abstract getOutdoor(page);
    abstract getIndoor(page);
    abstract getPosition(page);
}


export class Fixed extends SensingMechanism {
    
    constructor(){
        super("Fixed")
    }
    public startPositioning(page){
        page.positioning = true;
        page.enableMapDrag = true;
        page.map.on(GoogleMapsEvent.MAP_DRAG).subscribe((data) => {
            if (page.enableMapDrag){
                let position = page.map.getCameraTarget();
                let iconPosition: MarkerIcon = {
                size: { height: 44, width: 44 },
                };
                iconPosition.url = 'assets/img/finalFootPrint.png';
                page.marker.setIcon(iconPosition);
                page.marker.setPosition(position);
            }
        });
    }
    public stopPositioning(page) {
        page.enableMapDrag = false;
        return true;
    }

    public getCartesianCoordinate(page): { x: string; y: string; } {
      return page.map.fromLatLngToPoint(page.map.getCameraTarget());
    }

    public getCoordinate(page): { latitude: string; longitude: string; } {
      let res = page.map.getCameraTarget();
      return {
        latitude: res.lat,
        longitude: res.lng,
      };
    }

    public getOutdoor(page) {
      return false;
    }

    public getIndoor(page) {
      return true;
    }

    public getPosition(page) {
      return {
        buildingIdentifier: page.currentWorkspace.buildingIdentifier,
        cartesianCoordinate: this.getCartesianCoordinate(page),
        coordinate: this.getCoordinate(page),
        floorIdentifier: page.currentFloor.floorIdentifier, 
        isIndoor: this.getIndoor(page),
        isOutdoor: this.getOutdoor(page),
      };
    }
}

export class Situm extends SensingMechanism {

    constructor(){
        super("Situm");
        cordova.plugins.Situm.setApiKey(USER_EMAIL, USER_API_KEY);
    }

    stopPositioning(page) {
      let ok: boolean;
      return new Promise<any>((resPromesa) => {
            cordova.plugins.Situm.stopPositioning( (res: any) => {
                ok = true;
                resPromesa(ok);
            }, (err: any) => {
                ok = false;
                resPromesa(ok);
            });
        }); 
    }

    private mountLocationOptions(building) {
        debugger;
        let locationOptions = new Array();
        locationOptions.push(building);
        defaultOptionsMap['buildingIdentifier'] = building.buildingIdentifier,
            locationOptions.push(defaultOptionsMap);
        return locationOptions;
    }

    public startPositioning(page) {
      const locationOptions = this.mountLocationOptions(page.building);
      cordova.plugins.Situm.startPositioning( locationOptions, (res: any) => {
        debugger;
        page.positioning = true;
        page.currentPosition = res;
        if (!page.currentPosition || !page.currentPosition.coordinate)
          return;
        let position = page.mountPositionCoords(page.currentPosition);

        // Update the navigation
        if (page.navigating) page.updateNavigation(page.currentPosition);
        let iconPosition: MarkerIcon = {
          size: { height: 44, width: 44 },
        };
        iconPosition.url = 'assets/img/finalFootPrint.png';
        page.marker.setIcon(iconPosition);
        page.marker.setPosition(position);
        page.detector.detectChanges();
        //this.mostrarPosicionActual(res);
      },
      (err: any) => {
        const reason = err.match('reason=(.*),');
        let errorMessage = reason ? reason[1] : err;
        //page.stopPositioning(loadingIndoorPositioning);
        console.log('Error when starting positioning.', err);
        const message = `Error when starting positioning. ${errorMessage}`;
        page.presentToast(message, 'bottom', null);
      });
    }

    public getCartesianCoordinate(page): { x: string; y: string; } {
      return page.currentPosition.cartesianCoordinate;
    }
    
    public getCoordinate(page): { latitude: string; longitude: string; } {
      return page.currentPosition.coordinate;
    }

    public getOutdoor(page) {
      return page.currentPosition.isOutdoor;
    }

    public getIndoor(page) {
      return page.currentPosition.isIndoor;
    }
    
    public getPosition(page) {
      return page.currentPosition.position;
    }
}

  /*let resultArray = new Array();
  let ret = new Promise<any>((resPromesa) => {
      const locationOptions = this.mountLocationOptions(page.building);
      cordova.plugins.Situm.startPositioning(locationOptions, (res: any) => {
          resultArray['ok'] = true;
          resultArray['content'] = res;
          resPromesa(resultArray);
      }, (err: any) => {
          resultArray['ok'] = false;
          resultArray['content'] = err;
          resPromesa(resultArray);
      });
  }); */


    /*
      const locationOptions = this.mountLocationOptions();
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
        },
        (err: any) => {
          const reason = err.match('reason=(.*),');
          let errorMessage = reason ? reason[1] : err;
          this.stopPositioning(loadingIndoorPositioning);
          console.log('Error when starting positioning.', err);
          const message = `Error when starting positioning. ${errorMessage}`;
          this.presentToast(message, 'bottom', null);
        }
      ); */