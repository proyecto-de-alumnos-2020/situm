import { Injectable, ApplicationRef } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Platform, LoadingController, ToastController } from 'ionic-angular';
import { USER_EMAIL, USER_API_KEY } from './situm';

declare var cordova: any;
export class Building {
    address: string;
    bounds: {
        northEast: {
            latitude: string,
            longitude: string
        },
        northWest: {
            latitude: string,
            longitude: string
        },
        southEast: {
            latitude: string,
            longitude: string
        },
        southWest: {
            latitude: string,
            longitude: string
        }
    };
    boundsRotated: {
        northEast: {
            latitude: string,
            longitude: string
        },
        northWest: {
            latitude: string,
            longitude: string
        },
        southEast: {
            latitude: string,
            longitude: string
        },
        southWest: {
            latitude: string,
            longitude: string
        }
    };
    center: {
        latitude: string,
        longitude: string
    };
    dimensions: {
        width: string,
        height: string
    };
    infoHtml: string;
    name: string;
    pictureThumbUrl: string;
    pictureUrl: string;
    rotation: string;
    userIdentifier: string;
    buildingIdentifier: string;
    floors: Floor[];
    customFields: {}
}
export class Floor {
}
@Injectable()
export class BuildingsService {
    buildings: Building[] = [];
    tabla = 'buildings/';
    constructor(public angularfirebaseDB: AngularFireDatabase,
        public platform: Platform,
        public loadingCtrl: LoadingController,
        public ref: ApplicationRef,
        public toastCtrl: ToastController
    ) {
        this.platform.ready().then(() => {
            cordova.plugins.Situm.setApiKey(USER_EMAIL, USER_API_KEY);
        }).catch(error => {
            console.log(error);
        });
    }
    public saveBuilding(aBuilding) { //SOLO SE GUARDARA EN EL CASO DE QUE SE CREE UN NUEVO WORKSPACE, SI EXISTÍA, LO PISA.
        return new Promise<boolean>((resPromesa) => {
            debugger;
            this.angularfirebaseDB.database.ref(this.tabla + aBuilding.buildingIdentifier).set(aBuilding).then(             
                resolve => {
                    resPromesa(true);
                }, reject => {
                    resPromesa(false);
                });
        });
    }

    public getBuildingForWorkspace(aBuildingIdentifier) {
        return new Promise<Building>((resPromesa) => {
            var buildingReference = this.angularfirebaseDB.database.ref(this.tabla + aBuildingIdentifier);
            buildingReference.once('value').then(function (snapshot) {
                resPromesa(snapshot.val());
            });
        });
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
    presentToast(text, position, toastClass) {
        const toast = this.toastCtrl.create({
            message: text,
            duration: 3000,
            position: position,
            cssClass: toastClass ? toastClass : ''
        });
        toast.present();
    }

    /* METODOS PARA CREAR UN WORKSPACE */

    public fetchBuildings() {
        // Fetchs the buildings for the current user
        // More details in http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.fetchBuildings
        return new Promise<Building[]>((resPromesa) => {
            cordova.plugins.Situm.fetchBuildings((res) => {
                this.buildings = res;
                this.buildings.forEach( //A CADA EDIFICIO PIDO SUS PISOS
                    edificio => {
                        this.fetchFloorsFromBuilding(edificio).then(res => {
                            debugger;
                            edificio.floors = res; //LE AGREGO LOS PISOS
                        }, (error) => {
                            // If errors will come here
                            console.log(error);
                            const errorMsg = "Hubo un error al cargar los pisos, intente nuevamente.";
                            this.presentToast(errorMsg, 'top', null);
                        });
                    });
                resPromesa(this.buildings);
            }, (error) => {
                const errorMsg = "Hubo un error al cargar los edificios, intente nuevamente.";
                this.presentToast(errorMsg, 'top', null);
            });
        });
    };

    public fetchFloorsFromBuilding(aBuilding) {
        return new Promise<Floor[]>((resPromesa) => {
            cordova.plugins.Situm.fetchFloorsFromBuilding(aBuilding, (floors) => {
                resPromesa(floors);
            });
        });
    }


}
