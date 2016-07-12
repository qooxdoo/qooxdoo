/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page showing an OpenStreetMap map.
 *
 * @ignore(ol.*)
 * @asset(qx/mobile/css/*)
 */
qx.Class.define("mobileshowcase.page.Maps",
{
  extend : mobileshowcase.page.Abstract,
  construct : function()
  {
    this.base(arguments, false);
    this.setTitle("Maps");
    qx.bom.Stylesheet.includeFile('https://cdnjs.cloudflare.com/ajax/libs/ol3/3.16.0/ol.css');
    this._geolocationEnabled = qx.core.Environment.get("html.geolocation");
  },
  members :
  {
    _mapUri : "https://cdnjs.cloudflare.com/ajax/libs/ol3/3.16.0/ol-debug.js",
    _map : null,
    _marker : null,
    _geolocationEnabled : false,
    _showMyPositionButton : null,

    // overridden
    _initialize : function()
    {
      this.base(arguments);
      if (this._geolocationEnabled) {
        this._initGeoLocation();
      }
      this._loadMapLibrary();

      // Listens on window orientation change and resize, and triggers redraw of map.

      // Needed for triggering OpenLayers to use a bigger area, and draw more tiles.
      qx.event.Registration.addListener(window, "orientationchange", this._redrawMap, this);
      qx.event.Registration.addListener(window, "resize", this._redrawMap, this);
    },

    /**
     * Calls a redraw on Mapnik Layer. Needed after orientationChange event
     * and drawing markers.
     */
    _redrawMap : function() {
      if (this._map !== null) {
        this._map.updateSize();
      }
    },
    
    // overridden
    _start : function()
    {
        this._redrawMap();
    },

    // overridden
    _createScrollContainer : function()
    {
      // MapContainer
      // Do not use any layout manager  - otherwise the map will not be
      // displayed with safari browsers.
      var mapContainer = new qx.ui.mobile.container.Composite();
      mapContainer.setId("map");
      mapContainer.addCssClass("map");
      return mapContainer;
    },

    // overridden
    _createContent : function()
    {
      // Disable menu for Windows Phone 8.
      if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
        return null;
      }
      var menuContainer = new qx.ui.mobile.container.Composite();
      menuContainer.setId("mapMenu");

      // LABEL
      var descriptionLabel = new qx.ui.mobile.basic.Label("Page Title");
      descriptionLabel.addCssClass("osmMapLabel");

      // TOGGLE BUTTON
      var toggleNavigationButton = new qx.ui.mobile.form.ToggleButton(true, "ON", "OFF");

      // SHOW MY POSITION BUTTON
      this._showMyPositionButton = new qx.ui.mobile.form.Button("Find me!");
      this._showMyPositionButton.addListener("tap", this._getGeoPosition, this);

      // Button is disabled when Geolocation is not available.
      this._showMyPositionButton.setEnabled(this._geolocationEnabled);
      toggleNavigationButton.addListener("changeValue", function()
      {
        var newNavBarState = !this.isNavigationBarHidden();
        this.setNavigationBarHidden(newNavBarState);
        this.show();
      }, this);
      var groupPosition = new qx.ui.mobile.form.Group([this._showMyPositionButton], false);
      var groupFullScreen = new qx.ui.mobile.form.Group([descriptionLabel, toggleNavigationButton], true);
      this._showMyPositionButton.addCssClass("map-shadow");
      groupFullScreen.addCssClass("map-shadow");
      menuContainer.add(groupFullScreen);
      menuContainer.add(groupPosition);
      return menuContainer;
    },

    /**
     * Loads JavaScript library which is needed for the map.
     */
    _loadMapLibrary : function()
    {
      var req = new qx.bom.request.Script();
      req.onload = function()
      {
        var osmlayer = new ol.layer.Tile( {
          source : new ol.source.OSM()
        });
        var view = new ol.View(
        {
          zoom : 10,
          minZoom : 2,
          maxZoom : 19
        })

        this._map = new ol.Map(
        {
          target : 'map',
          layers : [osmlayer],
          view : view
        });
        this._zoomToDefaultPosition();
      }.bind(this);
      req.open("GET", this._mapUri);
      req.send();
    },

    /**
     * Zooms the map to a default position.
     * In this case: Berlin, Germany.
     */
    _zoomToDefaultPosition : function() {
      if (this.isVisible()) {
        this._zoomToPosition(13.41, 52.52, 15);
      }
    },

    /**
     * Zooms the map to a  position.
     * @param longitude {Number} the longitude of the position.
     * @param latitude {Number} the latitude of the position.
     * @param zoom {Integer} zoom level.
     * @param showMarker {Boolean} if a marker should be drawn at the defined position.
     */
    _zoomToPosition : function(longitude, latitude, zoom, showMarker)
    {
      if (!this._map) {
        return;
      }
      var fromProjection = ol.proj.get("EPSG:4326");
      var toProjection = ol.proj.get("EPSG:900913");
      var mapPosition = ol.proj.getTransform(fromProjection, toProjection)([longitude, latitude]);
      this._map.getView().setCenter(mapPosition);
      this._map.getView().setZoom(zoom);
      this._setMarkerOnMap(this._map, mapPosition, showMarker);
    },

    /**
     * Draws a marker on the OSM map.
     * @param map {Object} the map object.
     * @param mapPosition {Map} the map position.
     * @param showMarker {Boolean} if a marker should be drawn at the defined position.
     */
    _setMarkerOnMap : function(map, mapPosition, showMarker)
    {
      if (this._marker)
      {
        map.removeLayer(this._marker);
        this._marker = null;
      }
      if (showMarker === true)
      {
        var point = new ol.Feature( {
          geometry : new ol.geom.Point(mapPosition)
        });
        point.setStyle(new ol.style.Style( {
          image : new ol.style.Icon( {
            src : 'http://www.openlayers.org/api/img/marker.png'
          })
        }));
        this._marker = new ol.layer.Vector( {
          source : new ol.source.Vector( {
            features : [point]
          })
        });
        map.addLayer(this._marker);
      }
    },

    /**
     * Prepares qooxdoo GeoLocation and installs needed listeners.
     */
    _initGeoLocation : function()
    {
      var geo = qx.bom.GeoLocation.getInstance();
      geo.addListener("position", this._onGeolocationSuccess, this);
      geo.addListener("error", this._onGeolocationError, this);
    },

    /**
     * Callback function when Geolocation did work.
     */
    _onGeolocationSuccess : function(position)
    {
      this._zoomToPosition(position.getLongitude(), position.getLatitude(), 15, true);
      this._redrawMap();
    },

    /**
     * Callback function when Geolocation returned an error.
     */
    _onGeolocationError : function()
    {
      this._showMyPositionButton.setEnabled(false);
      var buttons = [];
      buttons.push(qx.locale.Manager.tr("OK"));
      var title = "Problem with Geolocation";
      var text = "Please activate location services on your browser and device.";
      qx.ui.mobile.dialog.Manager.getInstance().confirm(title, text, function() {
      }, this, buttons);
    },

    /**
     * Retreives GeoPosition out of qx.bom.Geolocation and zooms to this point on map.
     */
    _getGeoPosition : function()
    {
      var geo = qx.bom.GeoLocation.getInstance();
      geo.getCurrentPosition(false, 1000, 1000);
    },
    destruct : function() {
      this._disposeObjects("_mapUri", "_map", "_marker", "_showMyPositionButton");
    }
  }
});
