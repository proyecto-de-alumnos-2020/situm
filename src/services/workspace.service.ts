import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Building, BuildingsService } from '../services/buildings.service';
import { Subscription } from 'rxjs';

export interface WorkspaceStatus {
    idStatus: string;
    deletePoi(caller, isOnwer, aPoi);
    editPoi(caller, isOwner, anEditedPoi);
    addPoi(caller, isOwner, aPoi);
    openWorkspace(caller, isOwner, aWorkspace);
    openPoiByStatus(aPoi, caller);
}

export class ConcreteStatus {
    idStatus: string;
    constructor(idStatus) {
        this.idStatus = idStatus;
    }
    isOwner(workspace, userLogged) {
        return (workspace.idOwner == userLogged.uid);
    }
}

export class EdicionDelCreador extends ConcreteStatus implements WorkspaceStatus {
    constructor() { super("EdicionDelCreador"); }
    public deletePoi(caller, isOwner, aPoi) {
        if (isOwner) {
            caller.deleteFromFirebase(aPoi);
        } else {
            caller.justOwnerCanDelete();
        }
    }
    public editPoi(caller, isOwner, anEditedPoi) {
        if (isOwner) {
            caller.editFromFirebase(anEditedPoi);
        } else {
            caller.justOwnerCanEdit();
        }
    }
    public addPoi(caller, isOwner, aNewPoi) {
        if (isOwner) {
            caller.savePoiToFirebaseAtDismiss(aNewPoi);
        } else {
            caller.justOwnerCanAdd();
        }
    }
    public openWorkspace(caller, isOwner, aWorkspace) {
        if (isOwner) {
            caller.openWorkspace(aWorkspace);
        } else {
            caller.justOwnerCanOpen();
        }
    }
    public openPoiByStatus(aPoi, caller) {
        caller.abrirPoiDirectamente(aPoi);
    }
}

export class EdicionColaborativa extends ConcreteStatus implements WorkspaceStatus {
    constructor() { super("EdicionColaborativa"); }
    public deletePoi(caller, isOwner, aPoi) {
        caller.deleteFromFirebase(aPoi);
    }
    public editPoi(caller, isOwner, anEditedPoi) {
        caller.editFromFirebase(anEditedPoi);
    }
    public addPoi(caller, isOwner, aNewPoi) {
        caller.savePoiToFirebaseAtDismiss(aNewPoi);
    }
    public openWorkspace(caller, isOwner, aWorkspace) {
        caller.openWorkspace(aWorkspace);
    }
    public openPoiByStatus(aPoi, caller) {
        caller.abrirPoiDirectamente(aPoi);
    }
}

export class EdicionDelCreadorVersionFinal extends ConcreteStatus implements WorkspaceStatus {
    constructor() { super("EdicionDelCreadorVersionFinal") }
    public deletePoi(caller, isOwner, aPoi) {
        if (isOwner) {
            caller.deleteFromFirebase(aPoi)
        } else {
            caller.cantDelete();
        }
    }
    public editPoi(caller, isOwner, anEditedPoi) {
        if (isOwner) {
            caller.editFromFirebase(anEditedPoi);
        } else {
            caller.cantEdit();
        }
    }
    public addPoi(caller, isOwner, aPoi) {
        if (isOwner) {
            caller.savePoiToFirebaseAtDismiss(aPoi);
        } else {
            caller.cantAdd();
        }
    }
    public openWorkspace(caller, isOwner, aWorkspace) {
        caller.openWorkspace(aWorkspace);
    }
    public openPoiByStatus(aPoi, caller) {
        caller.abrirPoiDirectamente(aPoi);
    }
}

export class VersionFinalPublica extends ConcreteStatus implements WorkspaceStatus {
    constructor() { super("VersionFinalPublica"); }
    public deletePoi(caller, isOwner, aPoi) {
        caller.cantDelete();
    }
    public editPoi(caller, isOwner, aPoi) {
        caller.cantEdit();
    }
    public addPoi(caller, isOwner, aPoi) {
        caller.cantAdd();
    }
    public openWorkspace(caller, isOwner, aWorkspace) {
        caller.openWorkspace(aWorkspace);
    }
    public openPoiByStatus(aPoi, caller) {
        caller.abrirPoiSegunEstrategia(aPoi);
    }
}

export interface KindInterface {
    idKind;
}

export class Kind {
    idKind: string;
    constructor(idKind) {
        this.idKind = idKind;
    }
}

export class RecorridoLineal extends Kind implements KindInterface {
    constructor() { super("RecorridoLineal"); }

}

export class CrearLugaresRelevantes extends Kind implements KindInterface {
    constructor() { super("CrearLugaresRelevantes"); }
}

export class Workspace {
    applicationColour: string;
    idWorkspace: number;
    name: string;
    idOwner: string;
    collaborators: any[];
    buildingIdentifier: string;
    building: Building;
    status: WorkspaceStatus;
    kind: Kind;
    strategyToShowPoIWLAN?: StrategyToShowMarker;
    strategyToShowPoIQR?: StrategyToShowMarker
    strategyToShowInformationPoIWLAN?: StrategyToShowInformation;
    strategyToShowInformationPoIQR?: StrategyToShowInformation;
}

export class WorkspaceReference {
    idOwner: string;
    idWorkspace: string;
    idColour: string;
    constructor(anIdOwner, anIdWorkspace, anIdColour) {
        this.idOwner = anIdOwner;
        this.idWorkspace = anIdWorkspace;
        this.idColour = anIdColour;
    }
}



export class StrategyToShowMarker {
    idStrategyShowMarker: string;
    constructor(idStrategyShowMarker) {
        this.idStrategyShowMarker = idStrategyShowMarker;
    }
}
export class MostrarMarcadorSiempre extends StrategyToShowMarker {
    constructor() { super("MostrarMarcadorSiempre"); }

}

export class MostrarMarcadorPorProximidad extends StrategyToShowMarker {
    constructor() { super("MostrarMarcadorPorProximidad"); }
}

export class MostrarMarcadorPorEscaneo extends StrategyToShowMarker {
    constructor() { super("MostrarMarcadorPorEscaneo"); }
}


export interface StrategyToShowInformation {
    verDatosPoi(aPoi, paginaInvocante);
}

export class StrategyToShowInformation {
    idStrategyShowInformation: string;
    constructor(idStrategyShowInformation) {
        this.idStrategyShowInformation = idStrategyShowInformation;
    }
}
export class MostrarInformacionSiempreQueEstePosicionadoEnElEdificio extends StrategyToShowInformation implements StrategyToShowInformation {
    constructor() { super("MostrarInformacionSiempreQueEstePosicionadoEnElEdificio"); }
    public verDatosPoi(aPoi, paginaInvocante) {
        paginaInvocante.abrirPoi(aPoi.poiName);
    }
}

export class MostrarInformacionPorProximidad extends StrategyToShowInformation {
    constructor() { super("MostrarInformacionPorProximidad"); }
    /*Realizar la implementación*/
}

export class MostrarInformacionPorEscaneo extends StrategyToShowInformation {
    constructor() { super("MostrarInformacionPorEscaneo"); }
    public verDatosPoi(aPoi, paginaInvocante) {
        paginaInvocante.noAbrirPoi(aPoi.poiName);
    }
}

export class Params {
    idStatus: string;
    idWorkspace: string;
}

@Injectable()
export class WorkspaceService {
    myWorkspaces: any[];
    private subscriptionStatusChange: Subscription;
    private subscriptionStatusChangeFromModal: Subscription;
    tabla = 'workspaces/';
    constructor(public angularfirebaseDB: AngularFireDatabase,
        private buildingService: BuildingsService) { }



    public getWorkspaceFromReference(workspaceReference) {
        return new Promise<Workspace>((result) => {
            debugger;                                       //VALOR DEL OBJETO
            var ref = this.angularfirebaseDB.database.ref('workspaces/' + workspaceReference.idOwner + '/' + workspaceReference.idWorkspace);
            ref.once('value').then(function (snapshot) {
                result(snapshot.val());
            });
        });
    }

    public getWorkspacesReferences(idCollaborator) {
        return new Promise<Object[]>((result) => {
            this.angularfirebaseDB.list('workspacesReferences/' + idCollaborator).valueChanges().subscribe(references => {
                result(references);
            });
        });
    };

    public importWorkspaceFromAnotherUser(workspaceRef) {
        return new Promise<Workspace>((resPromesa) => {
            var workspaceReference = this.angularfirebaseDB.database.ref(this.tabla + workspaceRef.idOwner + "/" + workspaceRef.idWorkspace);
            workspaceReference.once('value').then(function (snapshot) {
                debugger;
                resPromesa(snapshot.val());
            });
        });
    }

    public getWorkspaces(anIdUser) {
        return new Promise<Workspace[]>((resPromesa) => {
            this.angularfirebaseDB.list(this.tabla + anIdUser).valueChanges().subscribe(ownWorkspaces => {
                this.myWorkspaces = ownWorkspaces;
                resPromesa(this.myWorkspaces);
            }, (error) => {
                const errorMsg = 'Un error ha ocurrido mientras se recuperaban los workspaces'
                console.log(`${errorMsg}`, error);
            });
        });
    }

    saveABuilding(aBuilding) {
        return new Promise<boolean>((resPromesa) => {
            this.buildingService.saveBuilding(aBuilding).then(
                resolve => {
                    debugger;
                    resPromesa(true);
                },
                reject => {
                    debugger;
                    resPromesa(false);
                }
            );
        });
    }

    public saveWorkspace(aWorkspace) {
        return new Promise<boolean>((resPromesa) => {
            debugger;
            let building = aWorkspace.building[0];
            aWorkspace.building = null;
            this.angularfirebaseDB.database.ref(this.tabla + '/' + aWorkspace.idOwner + '/' + aWorkspace.idWorkspace).set(aWorkspace).then(
                resolve => {
                    debugger;
                    resPromesa(this.saveABuilding(building));
                }, reject => {
                    debugger;
                    resPromesa(false);
                });
        });
    }



    public subscribeToWorkspaceStateChangesFromModal(aWorkspace, aPage) {
        if (this.subscriptionStatusChangeFromModal) {
            this.subscriptionStatusChangeFromModal.unsubscribe();
        }
        return new Promise<Object>((resPromesa) => { //EL LISTENER DE FIREBASE EJECUTA DESDE EL SUBSCRIBE
            this.subscriptionStatusChangeFromModal = this.angularfirebaseDB.list('workspaces/' + aWorkspace.idOwner + '/' + aWorkspace.idWorkspace + '/status/').valueChanges().subscribe(response => {
                debugger;
                //resPromesa(response[0]);
                aPage.updateWorkspaceState(response[0]);
            }, (error) => {
                //resPromesa(undefined);
                aPage.updateWorkspaceState(undefined);
                const errorMsg = 'Un error ha ocurrido al cambiar el estado del workspace.'
                console.log(`${errorMsg}`, error);
            });
        });
    }

    /*ESTO ES PARA EL LISTADO DE LOS WORKSPACES QUE NO SON MIOS*/
    public subscribeToWorkspaceStateChangeForList(aWorkspace, appComponents) {
        return new Promise<Params>((resPromesa) => { //EL LISTENER DE FIREBASE EJECUTA DESDE EL SUBSCRIBE

            this.subscriptionStatusChange = this.angularfirebaseDB.list('workspaces/' + aWorkspace.idOwner + '/' + aWorkspace.idWorkspace + '/status/').valueChanges().subscribe(response => {
                debugger;
                let params = new Params();
                params.idWorkspace = aWorkspace.idWorkspace.toString();
                params.idStatus = response[0].toString();
                appComponents.buscarWorkspaceEnElListadoYActualizar(params);
            }, (error) => {
                appComponents.buscarWorkspaceEnElListadoYActualizar(undefined);
                const errorMsg = 'Un error ha ocurrido al cambiar el estado del workspace.'
                console.log(`${errorMsg}`, error);
            });
        });
    }
    /*ESTO ES PARA EL LISTADO DE LOS WORKSPACES QUE NO SON MIOS*/

    public subscribeToWorkspaceStateChanges(aWorkspace, appComponents) {

        if (this.subscriptionStatusChange) { //AL ABRIR UN WORKSPACE
            this.subscriptionStatusChange.unsubscribe();

        }
        return new Promise<String>((resPromesa) => { //EL LISTENER DE FIREBASE EJECUTA DESDE EL SUBSCRIBE
            let workspaceAbiertoPrimeraVez = true;
            this.subscriptionStatusChange = this.angularfirebaseDB.list('workspaces/' + aWorkspace.idOwner + '/' + aWorkspace.idWorkspace + '/status/').valueChanges().subscribe(response => {
                debugger;
                if (workspaceAbiertoPrimeraVez) {
                    workspaceAbiertoPrimeraVez = false;
                    appComponents.setWorkspaceState(response[0]);
                } else {
                    appComponents.updateWorkspaceState(response[0]);
                }
            }, (error) => {
                appComponents.updateWorkspaceState(undefined);
                const errorMsg = 'Un error ha ocurrido al cambiar el estado del workspace.'
                console.log(`${errorMsg}`, error);
            });
        });
    }

    public updateWorkspaceState(aWorkspace, newStatus) {
        return new Promise<boolean>((resPromesa) => {
            debugger;
            aWorkspace.building = null;
            this.angularfirebaseDB.database.ref(this.tabla + '/' + aWorkspace.idOwner + '/' + aWorkspace.idWorkspace + '/status/').set(newStatus).then(
                resolve => {
                    debugger;
                    resPromesa(true);
                }, reject => {
                    debugger;
                    resPromesa(false);
                });
        });
    }

    public defineWorkspaceStrategiesAndUpdateState(aWorkspace, VersionFinalPublica, strategies) {
        debugger;
        let editedWorkspace = new Workspace(); //CREO UN WORKSPACE NUEVO 
        //editedWorkspace = Object.assign({}, aWorkspace); //CLONO LO QUE TENÍA EL QUE QUIERO EDITAR
        editedWorkspace.applicationColour = aWorkspace.applicationColour;
        editedWorkspace.buildingIdentifier = aWorkspace.buildingIdentifier;
        editedWorkspace.collaborators = aWorkspace.collaborators;
        editedWorkspace.idOwner = aWorkspace.idOwner;
        editedWorkspace.idWorkspace = aWorkspace.idWorkspace;
        editedWorkspace.kind = aWorkspace.kind;
        editedWorkspace.name = aWorkspace.name;
        editedWorkspace.status = aWorkspace.status;
        editedWorkspace.strategyToShowPoIWLAN = strategies.estrategiaSeleccionadaParaMostrarPOIWLAN; //AGREGO ESTRATEGIA PARA MOSTRAR POI SIN QR
        editedWorkspace.strategyToShowPoIQR = strategies.estrategiaSeleccionadaParaMostrarPOIQR;  //AGREGO ESTRATEGIA PARA MOSTRAR POI CON QR
        editedWorkspace.strategyToShowInformationPoIWLAN = strategies.estrategiaSeleccionadaParaMostrarInformacionPOIWLAN; //AGREGO ESTRATEGIA PARA MOSTRAR INFORMACION DEL POI SIN QR
        editedWorkspace.strategyToShowInformationPoIQR = strategies.estrategiaSeleccionadaParaMostrarInformacionPOIQR; //AGREGO ESTRATEGIA PARA MOSTRAR INFORMACION CON QR

        return new Promise<boolean>((resultadoPromesa) => {
            this.angularfirebaseDB.database.ref(this.tabla + '/' + aWorkspace.idOwner + '/' + aWorkspace.idWorkspace + '/').update({
                status: VersionFinalPublica,
                strategyToShowPoIWLAN: strategies.estrategiaSeleccionadaParaMostrarPOIWLAN,
                strategyToShowPoIQR: strategies.estrategiaSeleccionadaParaMostrarPOIQR,
                strategyToShowInformationPoIWLAN: strategies.estrategiaSeleccionadaParaMostrarInformacionPOIWLAN,
                strategyToShowInformationPoIQR: strategies.estrategiaSeleccionadaParaMostrarInformacionPOIQR}         
            ).then(
                resolve => {
                    debugger;
                    resultadoPromesa(true);
                }, reject => {
                    debugger;
                    resultadoPromesa(false);
                });
        });
    }

    public addMeAsCollaborator(wsRef, userData) {//AGREGO EL COLABORADOR AL WORKSPACE AL QUE ACABA DE ESCANEAR ROLLBACKS?
        return new Promise<boolean>((result) => {           //
            this.angularfirebaseDB.database.ref(this.tabla + '/' + wsRef.idOwner + '/' + wsRef.idWorkspace + '/collaborators/' + userData.idCollaborator + '/').set(userData).then(
                resolve => {
                    this.angularfirebaseDB.database.ref("workspacesReferences/" + userData.idCollaborator + '/').push(wsRef).then(
                        res => {
                            result(true);
                        }, rej => {
                            result(false);
                        }
                    )
                }, reject => {
                    result(false);
                })
        });
    }
    public addMeAsFinalUser(wsRef, userData) {
        return new Promise<boolean>((result) => {           //
            this.angularfirebaseDB.database.ref(this.tabla + '/' + wsRef.idOwner + '/' + wsRef.idWorkspace + '/collaborators/' + userData.idCollaborator + '/').set(userData).then(
                resolve => {
                    this.angularfirebaseDB.database.ref("workspacesReferences/" + userData.idCollaborator + '/').push(wsRef).then(
                        res => {
                            result(true);
                        }, rej => {
                            result(false);
                        }
                    )
                }, reject => {
                    result(false);
                })
        });
    }
    public updateFinalUserOrCollaborator(wsRef, userData) {
        return new Promise<boolean>((resPromesa) => {
            debugger;
            this.angularfirebaseDB.database.ref(this.tabla + '/' + wsRef.idOwner + '/' + wsRef.idWorkspace + '/collaborators/'
                + userData.idCollaborator + '/').update(
                    {isCollaborator: userData.isCollaborator,
                    isFinalUser: userData.isFinalUser}
                ).then(
                    resolve => {
                        resPromesa(true);
                    }, reject => {
                        debugger;
                        resPromesa(false);
                    });


        });
    }



    public getStrategyToShowInformation(aStringStrategyToShowInformation) {
        debugger;
        switch (aStringStrategyToShowInformation) {
            case "MostrarInformacionSiempreQueEstePosicionadoEnElEdificio": {
                return new MostrarInformacionSiempreQueEstePosicionadoEnElEdificio();
            }
            case "MostrarInformacionPorProximidad": {
                return new MostrarInformacionPorProximidad();
            }
            case "MostrarInformacionPorEscaneo": {
                return new MostrarInformacionPorEscaneo();
            }
        }
    }

    public getStrategyToShowMarker(aStringStrategyToShowMarker) {
        switch (aStringStrategyToShowMarker) {
            case "MostrarMarcadorSiempre": {
                return new MostrarMarcadorSiempre();
            }
            case "MostrarMarcadorPorProximidad": {
                return new MostrarMarcadorPorProximidad();
            }
            case "MostrarMarcadorPorEscaneo": {
                return new MostrarMarcadorPorEscaneo();
            }
        }
    }

}