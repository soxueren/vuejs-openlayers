import OlMap from 'ol/map'
import OlView from 'ol/view'
import OlTile from 'ol/layer/tile'
import OlLayerVector from 'ol/layer/vector'
import OlSourceVector from 'ol/source/vector'
import OlOSM from 'ol/source/osm'
import OlXYZ from 'ol/source/xyz'
import OlControl from 'ol/control'
import OlControlScaleLine from 'ol/control/scaleline'
import OlInteraction from 'ol/interaction'
import OlProj from 'ol/proj'
import OlExtent from 'ol/extent'
import OlFeature from 'ol/feature'
import OlPoint from 'ol/geom/point'
import OlStyle from 'ol/style/style'
import OlIcon from 'ol/style/icon'

const VueOpenlayers = {
  install: function (Vue) {
    this.Maps = {}
    this.Views = {}

    Vue.prototype.$openlayers = this
    Vue.openlayers = this
  },

  getMaps: function () {
    return this.Maps
  },

  /* Get Map
  **
  ** Param
  ** - element (String)
  */
  getMap: function (element) {
    return this.Maps[element]
  },

  /* Add New View
  **
  ** Param
  ** - setting
  **   type = Object
  **   data =
  **   - center (Array)
  **   - zoom (Number)
  **   - minZoom (Number)
  **   - maxZoom (Number)
  */
  addView: function (setting) {
    if (this.Views[setting.element] !== undefined) {
      console.log('View already exist')
      return null
    }

    this.Views[setting.element] = new OlView({
      center: (setting.center === undefined) ? [0, 0] : setting.center,
      zoom: (setting.zoom === undefined) ? 4 : setting.zoom,
      minZoom: (setting.minZoom === undefined) ? 4 : setting.minZoom,
      maxZoom: (setting.maxZoom === undefined) ? 18 : setting.maxZoom
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

  getLastLayerKey: function (element) {
    return Object.keys(this.Maps[element]['layers'])[(Object.keys(this.Maps[element]['layers']).length - 1)]
  },

  /* Add Layer
  **
  ** Param
  ** - setting
  **   type = Object
  **   data =
  **   - element (String)
  **   - name (String)
  **   - type (String {OSM, XYZ, Vector})
  **   - url (String) -- If XYZ
  */
  addLayer: function (setting) {
    if (this.Maps[setting.element] === undefined) {
      console.log('Map undefined')
      return null
    }

    if (this.Maps[setting.element]['layers'][setting.name] === undefined) {
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
    }

    this.updateSize(setting.element)
    return this.Maps[setting.element]['layers'][setting.name]
  },

  /* Set Layer
  **
  ** Param
  ** -- addLayer --
  */
  setLayer: function (setting) {
    if (this.Maps[setting.element] === undefined) {
      console.log('Map undefined')
      return null
    }

    this.removeLayer(setting.element, setting.name)
    return this.addLayer(setting)
  },

  removeLayer: function (element, name) {
    if (this.Maps[element]['layers'][name] !== undefined) {
      this.Maps[element].removeLayer(this.Maps[element]['layers'][name])
      this.Maps[element]['layers'][name] = undefined
    }
  },

  getVisibleLayer: function (element, name) {
    return this.Maps[element]['layers'][name].getVisible()
  },

  setVisibleLayer: function (element, name, isVisible) {
    if (this.Maps[element] === undefined) {
      console.log('Map undefined')
      return
    }

    if (this.Maps[element]['layers'][name] === undefined) {
      console.log('Layer undefined')
      return
    }

    this.Maps[element]['layers'][name].setVisible(isVisible)
  },

  getMarkerLayers: function (element) {
    return this.Maps[element]['markers']
  },

  getMarkerLayer: function (element, name) {
    return this.Maps[element]['markers'][name]
  },

  /* Add Marker Layer
  **
  ** Param
  **  - element (String)
  **  - name (String)
  */
  addMarkerLayer: function (element, name) {
    if (this.Maps[element] === undefined) {
      console.log('Map undefined')
      return null
    }

    if (this.Maps[element]['markers'][name] === undefined) {
      var layer = new OlLayerVector({ source: new OlSourceVector({features: []}) })

      this.Maps[element]['markers'][name] = layer
      this.Maps[element].addLayer(this.Maps[element]['markers'][name])
    }

    this.updateSize(element)
    return this.Maps[element]['markers'][name]
  },

  setMarkerLayer: function (element, name) {
    if (this.Maps[element] === undefined) {
      console.log('Map undefined')
      return null
    }

    this.removeMarkerLayer(element, name)
    this.addMarkerLayer(element, name)
  },

  removeMarkerLayer: function (element, name) {
    if (this.Maps[element]['markers'][name] !== undefined) {
      this.Maps[element].removeLayer(this.Maps[element]['markers'][name])
      this.Maps[element]['markers'][name] = undefined
    }
  },

  getVisibleMarkerLayer: function (element, name) {
    if (this.Maps[element] !== undefined) {
      if (this.Maps[element]['markers'][name] !== undefined) {
        return this.Maps[element]['markers'][name].getVisible()
      } else {
        console.log('Layer undefined')
      }
    } else {
      console.log('Map undefined')
    }
  },

  setVisibleMarkerLayer: function (element, name, isVisible) {
    if (this.Maps[element] === undefined) {
      console.log('Map undefined')
      return
    }

    if (this.Maps[element]['markers'][name] === undefined) {
      console.log('Layer undefined')
      return
    }

    this.Maps[element]['markers'][name].setVisible(isVisible)
  },

  getExtent: function (element) {
    return this.Views[element].calculateExtent(this.Maps[element].getSize())
  },

  getZoom: function (element) {
    return this.Views[element].getZoom()
  },

  setZoom: function (element, to) {
    if (this.Views[element] === undefined) {
      console.log('View undefined')
      return
    }

    this.Views[element].setZoom(to)
  },

  setZoomAll: function (to) {
    for (var index in this.Views) {
      this.Views[index].setZoom(to)
    }
  },

  getCenter: function (element) {
    return this.Views[element].getCenter()
  },

  setCenter: function (element, to) {
    if (this.Views[element] === undefined) {
      console.log('View undefined')
      return
    }

    this.Views[element].setCenter(to)
  },

  setCenterAll: function (to) {
    for (var index in this.Views) {
      this.Views[index].setCenter(to)
    }
  },

  fromLonLat: function (coord) {
    return OlProj.fromLonLat(coord)
  },

  transform: function (coord) {
    return OlProj.transform(coord, 'EPSG:3857', 'EPSG:4326')
  },

  transformExtent: function (extent) {
    return OlProj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326')
  },

  updateSize: function (element) {
    if (this.Maps[element] === undefined) {
      console.log('Map undefined')
      return
    }

    this.Maps[element].updateSize()
  },

  updateSizeAll: function () {
    for (var index in this.Maps) {
      this.Maps[index].updateSize()
    }
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
    if (this.Maps[setting.element] === undefined) {
      console.log('Map undefined')
      return
    }

    if (this.Maps[setting.element]['markers'][setting.layer] === undefined) {
      console.log('Layer undefined')
      return
    }

    var geom = new OlPoint(OlProj.fromLonLat((setting.coord === undefined) ? [0, 0] : setting.coord))
    var feature = new OlFeature(geom)

    feature.setStyle([
      new OlStyle({
        image: new OlIcon(({
          anchor: (setting.anchor === undefined) ? [0.5, 0.5] : setting.anchor,
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          opacity: 1,
          src: (setting.icon === undefined) ? '' : setting.icon
        }))
      })
    ])

    feature.setId(setting.id)
    this.Maps[setting.element]['markers'][setting.layer].getSource().addFeature(feature)
  },

  animate: function (element, setting) {
    this.Views[element].animate(setting)
  },

  fitPoints: function (element, point) {
    var ext = OlExtent.boundingExtent(point)
    ext = OlProj.transformExtent(ext, OlProj.get('EPSG:4326'), OlProj.get('EPSG:3857'))
    this.Views[element].fit(ext, {duration: 2000})
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
  **   - enableScaleLine (Boolean)
  */
  init: function (setting) {
    if (this.Maps[setting.element] !== undefined) {
      console.log('Map already exist')
      return
    }

    var controls = OlControl.defaults({
      attribution: (setting.enableAttibution !== undefined && setting.enableAttibution !== false),
      zoom: (setting.enableZoomButton !== undefined && setting.enableZoomButton !== false)
    })

    if (setting.enableScaleLine !== undefined && setting.enableScaleLine !== false) {
      controls = OlControl.defaults({
        attribution: (setting.enableAttibution !== undefined && setting.enableAttibution !== false),
        zoom: (setting.enableZoomButton !== undefined && setting.enableZoomButton !== false)
      }).extend([
        new OlControlScaleLine()
      ])
    }

    this.addView(setting)

    this.Maps[setting.element] = new OlMap({
      layers: [],
      controls: controls,
      target: setting.element,
      view: this.Views[setting.element],
      interactions: OlInteraction.defaults({
        dragPan: (setting.enablePan !== undefined && setting.enablePan !== false),
        mouseWheelZoom: (setting.enableMouseWheelZoom !== undefined && setting.enableMouseWheelZoom !== false),
        doubleClickZoom: (setting.enableDoubleClickZoom !== undefined && setting.enableDoubleClickZoom !== false)
      })
    })

    this.Maps[setting.element]['layers'] = {}
    this.Maps[setting.element]['markers'] = {}

    return this.Maps[setting.element]
  }
}

var GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(VueOpenlayers)
}

export default VueOpenlayers
