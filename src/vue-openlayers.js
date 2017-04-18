import OlMap from 'ol/map'
import OlView from 'ol/view'
import OlTile from 'ol/layer/tile'
import OlLayerVector from 'ol/layer/vector'
import OlSourceVector from 'ol/source/vector'
import OlOSM from 'ol/source/osm'
import OlXYZ from 'ol/source/xyz'
import OlControl from 'ol/control'
import OlInteraction from 'ol/interaction'
import OlProj from 'ol/proj'
import OlFeature from 'ol/feature'
import OlPoint from 'ol/geom/point'
import OlStyle from 'ol/style/style'
import OlIcon from 'ol/style/icon'

export default {
  install: function (Vue) {
    this.Maps = []
    this.Views = []

    Vue.prototype.$openlayers = this
    Vue.openlayers = this
  },

  getMaps: function () {
    return this.Maps
  },

  getMap: function (element) {
    return this.Maps[element]
  },

  addView: function (setting) {
    this.Views[setting.element] = new OlView({
      center: setting.center,
      zoom: setting.zoom
    })

    return this.Views[setting.element]
  },

  getView: function (element) {
    return this.Views[element]
  },

  getLayers: function (element) {
    return this.Maps[element]['layers']
  },

  getLayer: function (element, name) {
    return this.Maps[element]['layers'][name]
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
    var layer

    switch (setting.type) {
      case 'OSM':
        layer = new OlTile({
          source: new OlOSM()
        })
        break
      case 'XYZ':
        layer = new OlTile({
          source: new OlXYZ({
            url: setting.url
          })
        })
        break
      case 'Vector':
        layer = new OlLayerVector({
          source: new OlSourceVector({features: []})
        })
        break
    }

    this.Maps[setting.element]['layers'][setting.name] = layer
    this.Maps[setting.element].addLayer(this.Maps[setting.element]['layers'][setting.name])
    return this.Maps[setting.element]['layers'][setting.name]
  },

  getVisibleLayer: function (element, name) {
    return this.Maps[element]['layers'][name].getVisible()
  },

  setVisibleLayer: function (element, name, isVisible) {
    this.Maps[element]['layers'][name].setVisible(isVisible)
  },

  getExtent: function (element) {
    return this.Views[element].calculateExtent(this.Maps[element].getSize())
  },

  getZoom: function (element) {
    return this.Views[element].getZoom()
  },

  getCenter: function (element) {
    return this.Views[element].getCenter()
  },

  transform: function (coord) {
    return OlProj.transform(coord, 'EPSG:3857', 'EPSG:4326')
  },

  transformExtent: function (extent) {
    return OlProj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326')
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
    var geom = new OlPoint(OlProj.fromLonLat(setting.coord))
    var feature = new OlFeature(geom)

    feature.setStyle([
      new OlStyle({
        image: new OlIcon(({
          anchor: setting.anchor,
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          opacity: 1,
          src: setting.icon
        }))
      })
    ])

    feature.setId(setting.id)
    this.Maps[setting.element]['layers'][setting.layer].getSource().addFeature(feature)
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
    this.addView(setting)

    this.Maps[setting.element] = new OlMap({
      layers: [
        new OlTile({
          source: new OlOSM()
        })
      ],
      controls: OlControl.defaults({
        attribution: (setting.enableAttibution !== undefined && setting.enableAttibution !== false),
        zoom: (setting.enableZoomButton !== undefined && setting.enableZoomButton !== false)
      }),
      target: setting.element,
      view: this.Views[setting.element],
      interactions: OlInteraction.defaults({
        dragPan: (setting.enablePan !== undefined && setting.enablePan !== false),
        mouseWheelZoom: (setting.enableMouseWheelZoom !== undefined && setting.enableMouseWheelZoom !== false),
        doubleClickZoom: (setting.enableDoubleClickZoom !== undefined && setting.enableDoubleClickZoom !== false)
      })
    })

    this.Maps[setting.element]['layers'] = []
    return this.Maps[setting.element]
  }
}
