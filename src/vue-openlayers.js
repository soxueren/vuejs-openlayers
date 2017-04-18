(function () {
  var olMap = require('ol/map');
  var olView = require('ol/view');
  var olTile = require('ol/layer/tile');
  var olLayerVector = require('ol/layer/vector');
  var olSourceVector = require('ol/source/vector');
  var olOSM = require('ol/source/osm');
  var olXYZ = require('ol/source/xyz');
  var olControl = require('ol/control');
  var olInteraction = require('ol/interaction');
  var olProj = require('ol/proj');
  var olFeature = require('ol/feature');
  var olPoint = require('ol/geom/point');
  var olStyle = require('ol/style/style');
  var olIcon = require('ol/style/icon');

  var Maps = [];
  var Views = [];

  var VueOpenlayers = {
    install: function (Vue) {
      Vue.prototype.$openlayers = this;
      Vue.openlayers = this;
    },

    getMaps: function () {
      return Maps;
    },

    getMap: function (element) {
      return Maps[element];
    },

    addView: function (setting) {
      Views[setting.element] = new olView({
        center: setting.center,
        zoom: setting.zoom
      });

      return Views[setting.element];
    },

    getView: function (element) {
      return Views[element];
    },

    getLayers: function (element) {
      return Maps[element]['layers'];
    },

    getLayer: function (element, name) {
      return Maps[element]['layers'][name];
    },

    /* Add New Layer
    **
    ** Param
    ** - setting
    **   type = Object
    **   data =
    **   - element (String)
    **   - name (String)
    **   - type (Object String {OSM, XYZ, Vector})
    **   - url (String) -- If XYZ
    */
    addLayer: function (setting) {
      var layer;

      switch (setting.type) {
        case 'OSM':
          layer = new olTile({
            source: new olOSM()
          })
          break;
        case 'XYZ':
          layer = new olTile({
            source: new olXYZ({
              url: setting.url
            })
          })
          break;
        case 'Vector':
          layer = new olLayerVector({
            source: new olSourceVector({features: []})
          })
          break;
      }

      Maps[setting.element]['layers'][setting.name] = layer;
      Maps[setting.element].addLayer(Maps[setting.element]['layers'][setting.name]);
      return Maps[setting.element]['layers'][setting.name];
    },

    getVisibleLayer: function (element, name) {
      return Maps[element]['layers'][name].getVisible();
    },

    setVisibleLayer: function (element, name, isVisible) {
      Maps[element]['layers'][name].setVisible(isVisible);
    },

    getExtent: function (element) {
      return Views[element].calculateExtent(Maps[element].getSize());
    },

    getZoom: function (element) {
      return Views[element].getZoom();
    },

    getCenter: function (element) {
      return Views[element].getCenter();
    },

    transform: function (coord) {
      return Proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
    },

    transformExtent: function (extent) {
      return Proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    },

    /* Add Marker
    **
    ** Param
    ** - setting
    **   type = Object
    **   data =
    **   - id (String)
    **   - element (String)
    **   - layer (String)
    **   - coord (Array)
    **   - anchor (Array)
    **   - icon (String)
    */
    addMarker: function (setting) {
      var geom = new olPoint(olProj.fromLonLat(setting.coord));
      var feature = new olFeature(geom);

      feature.setStyle([
        new olStyle({
          image: new olIcon(({
            anchor: ((setting.anchor !== undefined) : return setting.anchor ? return [0, 0]),
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 1,
            src: setting.icon
          }))
        })
      ]);

      feature.setId(setting.id);
      Maps[setting.element]['layers'][setting.layer].getSource().addFeature(feature);
    },

    /* Initialize Openlayers Maps
    **
    ** Param
    ** - setting
    **   type = Object
    **   data =
    **   - element (String)
    **   - center (Array)
    **   - zoom (Number)
    **   - enableAttibution (Boolean)
    **   - enablePan (Boolean)
    **   - enableZoomButton (Boolean)
    **   - enableMouseWheelZoom (Boolean)
    **   - enableDoubleClickZoom (Boolean)
    */
    init: function (setting) {
      this.addView(setting);

      Maps[setting.element] = new olMap({
        layers: [],
        controls: olControl.defaults({
          attribution: (setting.enableAttibution !== undefined && setting.enableAttibution !== false),
          zoom: (setting.enableZoomButton !== undefined && setting.enableZoomButton !== false)
        }),
        target: setting.element,
        view: Views[setting.element],
        interactions: olInteraction.defaults({
          dragPan: (setting.enablePan !== undefined && setting.enablePan !== false),
          mouseWheelZoom: (setting.enableMouseWheelZoom !== undefined && setting.enableMouseWheelZoom !== false),
          doubleClickZoom: (setting.enableDoubleClickZoom !== undefined && setting.enableDoubleClickZoom !== false)
        })
      });

      Maps[setting.element]['layers'] = [];
      return Maps[setting.element];
    }
  };

  if (typeof exports == "object") {
    module.exports = VueOpenlayers;
  } else if (typeof define == "function" && define.amd) {
    define([], function(){ return VueOpenlayers; })
  } else if (window.Vue) {
    window.VueOpenlayers = VueOpenlayers;
    Vue.use(VueOpenlayers);
  }
})();