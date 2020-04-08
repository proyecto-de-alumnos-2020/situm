import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { ToastController } from 'ionic-angular';
/*import { Observable } from '@firebase/util';
import { getPromise } from '@ionic-native/core';
import { Observable } from 'rxjs/Observable';
import { PositioningPage } from '../pages/positioning/positioning';*/
import { Subscription } from 'rxjs';
declare var cordova: any;

export class Creator {
    name: string;
    colour: string;
    checked: boolean;
}

export class Poi {
    identifier: string;
    buildingIdentifier: string;
    cartesianCoordinate: {
        x: string,
        y: string
    };
    coordinate: {
        latitude: string,
        longitude: string
    };
    floorIdentifier: string;
    poiName: string;
    position: {
        buildingIdentifier: string,
        cartesianCoordinate: {
            x: string,
            y: string
        },
        coordinate: {
            latitude: string,
            longitude: string
        },
        floorIdentifier: string,
        isIndoor: string,
        isOutdoor: string
    };
    isIndoor: string;
    isOutdoor: string;
    category: string;
    colour: string;
    creator: string;
    infoHtml: string;
    customFields: {};
    hasQRCode: boolean;
    QRCodeID: string;
    workspaceId: string;
    base64: string;
    asociatedTrigger: string;
    visible: boolean;
}

@Injectable()
export class PoisService {
    poisTraidos: any[];
    tabla = 'pois/';
    public subscription: Subscription;

    constructor(public angularfirebaseDB: AngularFireDatabase, public toastCtrl: ToastController) { }



    public updatePoi(anEditedPoi, aWorkspace) {
        aWorkspace.building = null;
        return new Promise<boolean>((resPromesa) => {
            debugger;
            this.angularfirebaseDB.database.ref('pois/' + aWorkspace.idWorkspace + '/' +
                anEditedPoi.floorIdentifier + '/' + anEditedPoi.creator + '/' + anEditedPoi.identifier + '/').set(anEditedPoi).then(
                    resolve => {
                        resPromesa(true);
                    }, reject => {
                        debugger;
                        resPromesa(false);
                    });
        });
    }


    public updatePoiText(anEditedPoi, aWorkspace, text, cambioFormaBrindarPoi) {
        return new Promise<boolean>((resPromesa) => {
            debugger;
            aWorkspace.building = null;
            // if (text.includes("Nombre") || text.includes("Descripcion") || (cambioFormaBrindarPoi == true)) {
            /*SI TENGO QUE CAMBIAR ALGUNA, CAMBIO LAS TRES PARA NO ANIDAR PROMESAS,
            YA QUE SON MUCHOS CAMPOS, PERO LO QUE NO QUIERO ES PERSISTIR TODO EL OBJETO POI, YA QUE TIENE UNA IMAGEN Y AUMENTA EL TRÁFICO DE DATOS
            DEBERÍA ESTAR DIDIVIDO ENTRE CAMPOS SIMPLES(texto) Y CAMPOS COMPLEJOS(IMAGENES,ETC) PARA ASÍ PERSISTIR EL OBJETO SIMPLE
            Y NO AUMENTAR LA CARGA DE TRANSFERENCIA A LA BASE)*/
            /*NOMBRE DEL POI*/

            /*NOMBRE DEL POI*/
            // this.angularfirebaseDB.database.ref('pois/' + aWorkspace.idWorkspace + '/' +
            //     anEditedPoi.floorIdentifier + '/' + anEditedPoi.creator + '/' + anEditedPoi.identifier + '/').set(anEditedPoi).then(
            //         resolve => {
            //             resPromesa(true);
            //         }, reject => {
            //             debugger;
            //             resPromesa(false);
            //         });


            // this.angularfirebaseDB.database.ref('pois/' + aWorkspace.idWorkspace + '/' +
            //     anEditedPoi.floorIdentifier + '/' + anEditedPoi.creator + '/' + anEditedPoi.identifier + '/poiName/').set(anEditedPoi.poiName).then(
            //         resolve => {
            //             /*DESCRIPCION DEL POI*/
            //             this.angularfirebaseDB.database.ref('pois/' + aWorkspace.idWorkspace + '/' +
            //                 anEditedPoi.floorIdentifier + '/' + anEditedPoi.creator + '/' + anEditedPoi.identifier + '/category/').set(anEditedPoi.category).then(
            //                     resolve => {
            //                         /*FORMA DE BRINDAR EL POI*/
            //                         this.angularfirebaseDB.database.ref('pois/' + aWorkspace.idWorkspace + '/' +
            //                             anEditedPoi.floorIdentifier + '/' + anEditedPoi.creator + '/' + anEditedPoi.identifier + '/asociatedTrigger/').set(anEditedPoi.asociatedTrigger).then(
            //                                 resolve => {
            //                                     resPromesa(true);
            //                                 }, reject => {
            //                                     debugger;
            //                                     resPromesa(false);
            //                                 });
            //                     }, reject => {
            //                         debugger;
            //                         resPromesa(false);
            //                     });
            //         }, reject => {
            //             debugger;
            //             resPromesa(false);
            //         });
            // }
            /*else {
                if (text.includes("Nombre")) {
                    this.angularfirebaseDB.database.ref('pois/' + aWorkspace.idWorkspace + '/' +
                        anEditedPoi.floorIdentifier + '/' + anEditedPoi.creator + '/' + anEditedPoi.identifier + '/poiName/').set(anEditedPoi.poiName).then(
                            resolve => {
                                resPromesa(true);
                            }, reject => {
                                resPromesa(false);
                            });
                }
                if (text.includes("Descripcion")) {
                    this.angularfirebaseDB.database.ref('pois/' + aWorkspace.idWorkspace + '/' +
                        anEditedPoi.floorIdentifier + '/' + anEditedPoi.creator + '/' + anEditedPoi.identifier + '/category/').set(anEditedPoi.category).then(
                            resolve => {
                                resPromesa(true);
                            }, reject => {
                                resPromesa(false);
                            });
                }
            }*/

        });
    }

    public updatePoiVisibility(aPoi, aWorkspace, visible) {
        return new Promise<boolean>((resPromesa) => {
            debugger;
            aWorkspace.building = null;
            this.angularfirebaseDB.database.ref('pois/' + aWorkspace.idWorkspace + '/' +
                aPoi.floorIdentifier + '/' + aPoi.creator + '/' + aPoi.identifier + '/visible/').set(visible).then(
                    resolve => {
                        debugger;
                        resPromesa(true);
                    }, reject => {
                        debugger;
                        resPromesa(false);
                    });
        });
    }


    public encriptQR(aPoi, pagina, loading) {
        return new Promise<boolean>((result) => {
            let options: {
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
            };
            cordova.plugins.qrcodejs.encode('TEXT_TYPE', aPoi.QRCodeID, (base64EncodedQRImage) => {
                pagina.okEncrypt(base64EncodedQRImage, loading);
            }, (err) => {
                pagina.notOkEncrypt(loading, err);
            }, options);
        });
    }

    public getPois(workspaceId, currentFloor, pagina, loading, trigger) {
        if (this.subscription) {
            this.subscription.unsubscribe();
            // pagina.destroyAllMarkers();
        }

        let changeFloor = true;
        if (loading) {
            pagina.hideLoading(loading);
        }
        return new Promise<Poi[]>((resPromesa) => { //EL LISTENER DE FIREBASE EJECUTA DESDE EL SUBSCRIBE
            this.subscription = this.angularfirebaseDB.list('pois/' + workspaceId + '/' + currentFloor.floorIdentifier).valueChanges().subscribe(pois => {
                debugger;
                if (loading) { //FUNCIONA PARA CUANDO CAMBIO DE PISO CREO
                    pagina.hideLoading(loading);
                }
                if (changeFloor == true) {
                    changeFloor = false;
                    pagina.updatePoisWithResult2(pois, trigger); //PRIMERA VEZ VA POR CAMBIO DE PISO
                } else {
                    trigger = "updatedPois";
                    pagina.updatePoisWithResult2(pois, trigger);
                }

            }, (error) => {
                const errorMsg = 'Un error ha ocurrido actualizar el poi'
                console.log(`${errorMsg}`, error);
            });
        });
    }

    public savePoi(workspaceId, aPoi) {
        return new Promise<boolean>((result) => {
            aPoi.workspaceId = workspaceId; //PONGO EL ID DEL WORKSPACE EN EL POI
            this.angularfirebaseDB.database.ref(this.tabla +
                workspaceId + '/' + aPoi.floorIdentifier + '/' + aPoi.creator + '/' + //CAMBIOS ACA
                aPoi.identifier).set(aPoi).then(resolve => {
                    result(true);
                }, reject => {
                    result(false);
                });
        });
    }

    public deletePoi(aPoi) {
        return new Promise<boolean>((result) => {
            this.angularfirebaseDB.database.ref('pois/' +
                aPoi.workspaceId + '/' + aPoi.floorIdentifier + '/' + aPoi.creator + '/' +
                aPoi.identifier).set(null).then(resolve => {
                    result(true);
                }, reject => {
                    result(false);
                })
        });

    }
}


