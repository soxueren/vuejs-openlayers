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

  /* Get Map
  **
  ** Param
  ** - element (String)
  */
  getMap: function (element) {
    if (this.Maps[element] === undefined) {
      console.log('Map undefined')
      return
    }

    return this.Maps[element]
  },

  /* Add New View
  **
  ** Param
  ** - setting
  **   type = Object
  **   data =
  **   - center (Array)
  **   - Zoom (Number)
  */
  addView: function (setting) {
    if (this.Views[setting.element] !== undefined) {
      console.log('View already exist')
      return
    }

    this.Views[setting.element] = new OlView({
      center: setting.center,
      zoom: setting.zoom
    })

    return this.Views[setting.element]
  },

  getView: function (element) {
    if (this.Views[element] === undefined) {
      console.log('View undefined')
      return
    }

    return this.Views[element]
  },

  getLayers: function (element) {
    if (this.Maps[element] === undefined) {
      console.log('Map undefined')
      return
    }

    return this.Maps[element]['layers']
  },

  getLayer: function (element, name) {
    if (this.Maps[element] === undefined) {
      console.log('Map undefined')
      return
    }

    if (this.Maps[element]['layers'][name] === undefined) {
      console.log('Layer undefined')
      return
    }

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
  **   - type (String {OSM, XYZ, Vector})
  **   - url (String) -- If XYZ
  */
  addLayer: function (setting) {
    if (this.Maps[setting.element] === undefined) {
      console.log('Map undefined')
      return
    }

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
    this.updateSize(setting.element)

    return this.Maps[setting.element]['layers'][setting.name]
  },

  /* Change Layer
  **
  ** Param
  ** -- Same as addLayer --
  */
  changeLayer: function (setting) {
    if (this.Maps[setting.element] === undefined) {
      console.log('Map undefined')
      return
    }

    for(var index in this.Maps[setting.element]['layers']) {
      this.setVisibleLayer(setting.element, index, 0)
    }

    if (this.Maps[setting.element]['layers'][setting.name] === undefined) {
      this.addLayer(setting)
    } else {
      this.setVisibleLayer(setting.element, setting.name, 1)
    }
  }

  getVisibleLayer: function (element, name) {
    if (this.Maps[element] === undefined) {
      console.log('Map undefined')
      return
    }

    if (this.Maps[element]['layers'][name] === undefined) {
      console.log('Layer undefined')
      return
    }

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

  getExtent: function (element) {
    if (this.Maps[element] === undefined) {
      console.log('Map undefined')
      return
    }

    if (this.Views[element] === undefined) {
      console.log('View undefined')
      return
    }

    return this.Views[element].calculateExtent(this.Maps[element].getSize())
  },

  getZoom: function (element) {
    if (this.Views[element] === undefined) {
      console.log('View undefined')
      return
    }

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
    if (this.Views[element] === undefined) {
      console.log('View undefined')
      return
    }

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

    if (this.Maps[setting.element]['layers'][setting.layer] === undefined) {
      console.log('Layer undefined')
      return
    }

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
    if (this.Maps[element] !== undefined) {
      console.log('Map already exist')
      return
    }

    this.addView(setting)

    this.Maps[setting.element] = new OlMap({
      layers: [],
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
