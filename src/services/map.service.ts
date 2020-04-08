import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, LatLng, ILatLng, GroundOverlayOptions, MarkerOptions, MarkerIcon, Marker, PolylineOptions, Polyline, GroundOverlay } from '@ionic-native/google-maps';
import { Injectable, ApplicationRef } from '@angular/core';

@Injectable()
export class MapService {

    map: GoogleMap;

    public createMap(aDomElement, aLatLng, aZoom) { //DEBERIA SER UNA PROMESA
        let options: GoogleMapOptions = {
            camera: {
                target: aLatLng,
                zoom: aZoom
            }
        };
        this.map = GoogleMaps.create(aDomElement, options);
        return this.map;
    }

    public addGroundOverlay(aMap, anUrlImage, aBounds, aRotation) {
        return new Promise<GroundOverlay>((resPromesa) => {
            let groundOptions: GroundOverlayOptions = {
                url: anUrlImage,
                bounds: aBounds,
                bearing: aRotation * 180 / Math.PI
            }
            aMap.addGroundOverlay(groundOptions).then((groundOverlay: GroundOverlay) => {
                resPromesa(groundOverlay);
            });
        });
    }

    public rePositioning(aMap, aLatLng, aZoom) {
        return new Promise<GoogleMap>((resPromesa) => {
            aMap.moveCamera({
                target: aLatLng,
                zoom: aZoom
            });
            resPromesa(aMap);
        });
    }

    public drawMarkerInMap(aMap, aLatLng, aTitleMarker, hexColour, aSize, hasQRCode) {
        let aSnippet = "Click aquí para abrir";
        let markerIcon: MarkerIcon = { size: { height: aSize, width: aSize }, };
        let colourWithoutHash = hexColour.substring(1); //QUITO EL HASH
        debugger;
        if (hasQRCode) {
            markerIcon.url = "assets/img/pinPoiQR" + colourWithoutHash + ".png";
        } else {
            markerIcon.url = "assets/img/pinPoi" + colourWithoutHash + ".png";
        }
        //markerIcon.url = "assets/img/pinPoiE040FB.png"
        /*let icon = { //CUANDO SE HABILITE LA OPCION DE SVG EN IONIC 
            path:'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
            fillOpacity: 1,
            fillColor: 'blue',
            strokeColor: 'blue',
            scale: 1
        }*/
        let markerOptions: MarkerOptions = {
            icon: markerIcon,
            snippet: aSnippet,
            position: aLatLng,
            title: aTitleMarker
        };
        return new Promise<Marker>((resPromesa) => {
            aMap.addMarker(markerOptions).then((marker: Marker) => {
                resPromesa(marker);
            });
            
        });
    }

}