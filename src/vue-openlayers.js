(function () {
  var VueOpenlayers = {
    install: function (Vue) {
      Vue.prototype.$openlayers = this;
      Vue.openlayers = this;
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