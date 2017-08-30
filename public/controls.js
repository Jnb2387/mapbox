   map.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    }));
    // Add the zoom and viewpoint to the map
    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-right');
    map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
    }));
//for the 3D button toggle
    class PitchToggle { //create a class that has the pitch and bearing
        constructor({ bearing = 0, pitch = 60, minpitchzoom = null }) {
            this._bearing = bearing;
            this._pitch = pitch;
            this._minpitchzoom = minpitchzoom;
        }
        onAdd(map) {
            this._map = map;
            let _this = this;
            this._btn = document.createElement('button');// create the 3d button
            this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-3d';// set the class name for css styling
            this._btn.type = 'button';
            this._btn['aria-label'] = 'Toggle Pitch';//not sure
            this._btn.onclick = function () { //when the button is clicked
                if (map.getPitch() === 0) {// if the pitch is 0 then run this
                    let options = { pitch: _this._pitch, bearing: _this._bearing };// grab the pitch & bearing from the class constructor 
                    // if (_this._minpitchzoom && map.getZoom() > _this._minpitchzoom) {//dont really need
                    //     options.zoom = _this._minpitchzoom;
                    // }
                    map.easeTo(options);
                    _this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-2d';//change button to show 2d after change
                } else {
                    map.easeTo({ pitch: 0, bearing: 0 });// reset back to 2D if the pitch is not 0
                    _this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-3d';//change button to show 3d after change
                }
            };
            this._container = document.createElement('div');// create a div
            this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
            this._container.appendChild(this._btn);
            return this._container;
        }
        onRemove() {
            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }
    }
    //add the new class or 3D button to the map.
    map.addControl(new PitchToggle({ minpitchzoom: 11 }));
