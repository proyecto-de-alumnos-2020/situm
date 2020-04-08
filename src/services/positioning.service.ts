import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { ToastController } from 'ionic-angular';
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

@Injectable()
export class PositioningService {
    poisTraidos: any[];
    tabla = 'pois/';

    constructor(public angularfirebaseDB: AngularFireDatabase, public toastCtrl: ToastController) { }

    private mountLocationOptions(building) {
        debugger;
        let locationOptions = new Array();
        locationOptions.push(building);
        defaultOptionsMap['buildingIdentifier'] = building.buildingIdentifier,
            locationOptions.push(defaultOptionsMap);
        return locationOptions;
    }

    public startPositioning(building) {
        let resultArray = new Array();
        return new Promise<any>((resPromesa) => {
            const locationOptions = this.mountLocationOptions(building);
            cordova.plugins.Situm.startPositioning(locationOptions, (res: any) => {
                resultArray['ok'] = true;
                resultArray['content'] = res;
                resPromesa(resultArray);
            }, (err: any) => {
                resultArray['ok'] = false;
                resultArray['content'] = err;
                resPromesa(resultArray);
            });
        });
    }

    presentToast(text, position, toastClass) {
        const toast = this.toastCtrl.create({
            message: text,
            duration: 3000,
            position: position,
            cssClass: toastClass ? toastClass : ''
        });
        toast.present();
    }

}


