/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page showing an OpenStreetMap map.
 *
 * @ignore(OpenLayers.*)
 * @asset(qx/mobile/css/*)
 */
qx.Class.define("mobileshowcase.page.Maps",
{
  extend : mobileshowcase.page.Abstract,

  construct : function() {
    this.base(arguments,false);
    this.setTitle("Maps");

    this._geolocationEnabled = qx.core.Environment.get("html.geolocation");
  },


  members :
  {
    _mapUri : "http://www.openlayers.org/api/OpenLayers.js",
    _map : null,
    _markers : null,
    _myPositionMarker : null,
    _mapnikLayer : null,
    _geolocationEnabled : false,
    _showMyPositionButton : null,


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      if(this._geolocationEnabled) {
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
    _redrawMap : function () {
      if(this._mapnikLayer !== null) {
        this._map.updateSize();
        this._mapnikLayer.redraw();
      }
    },


    // overridden
    _createScrollContainer : function()
    {
      // MapContainer
      var layout = new qx.ui.mobile.layout.VBox().set({
        alignX : "center",
        alignY : "middle"
      });

      var mapContainer = new qx.ui.mobile.container.Composite(layout);
      mapContainer.setId("osmMap");

      return mapContainer;
    },


    // overridden
    _createContent : function() {
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
      var toggleNavigationButton = new qx.ui.mobile.form.ToggleButton(true,"ON","OFF",12);

      // SHOW MY POSITION BUTTON
      this._showMyPositionButton = new qx.ui.mobile.form.Button("Find me!");
      this._showMyPositionButton.addListener("tap", this._getGeoPosition, this);

      // Button is disabled when Geolocation is not available.
      this._showMyPositionButton.setEnabled(this._geolocationEnabled);

      toggleNavigationButton.addListener("changeValue", function() {
        var newNavBarState = !this.isNavigationBarHidden();
        this.setNavigationBarHidden(newNavBarState);
        this.show();
      },this);

      var groupPosition = new qx.ui.mobile.form.Group([this._showMyPositionButton],false);
      var groupFullScreen = new qx.ui.mobile.form.Group([descriptionLabel,toggleNavigationButton],true);

      this._showMyPositionButton.addCssClass("map-shadow");
      groupFullScreen.addCssClass("map-shadow");

      menuContainer.add(groupFullScreen);
      menuContainer.add(groupPosition);

      return menuContainer;
    },


    /**
     * Loads JavaScript library which is needed for the map.
     */
    _loadMapLibrary : function() {
      var req = new qx.bom.request.Script();

      req.onload = function() {
        this._map = new OpenLayers.Map("osmMap");
        this._mapnikLayer = new OpenLayers.Layer.OSM("mapnik", null, {});

        this._map.addLayer(this._mapnikLayer);

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
    _zoomToPosition : function(longitude, latitude, zoom, showMarker) {
      var fromProjection = new OpenLayers.Projection("EPSG:4326");
      var toProjection = new OpenLayers.Projection("EPSG:900913");
      var mapPosition = new OpenLayers.LonLat(longitude,latitude).transform(fromProjection, toProjection);

      this._map.setCenter(mapPosition, zoom);

      if(showMarker === true) {
        this._setMarkerOnMap(this._map, mapPosition);
      }
    },


    /**
     * Draws a marker on the OSM map.
     * @param map {Object} the map object.
     * @param mapPosition {Map} the map position.
     */
    _setMarkerOnMap : function(map, mapPosition) {
      if (this._markers === null) {
        this._markers = new OpenLayers.Layer.Markers("Markers");
        map.addLayer(this._markers);
      }

      if (this._myPositionMarker !== null) {
        this._markers.removeMarker(this._myPositionMarker);
      }

      this._myPositionMarker = new OpenLayers.Marker(mapPosition, icon);

      var size = new OpenLayers.Size(21, 25);
      var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
      var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);

      this._markers.addMarker(this._myPositionMarker);
    },


    /**
     * Prepares qooxdoo GeoLocation and installs needed listeners.
     */
    _initGeoLocation : function() {
      var geo = qx.bom.GeoLocation.getInstance();
      geo.addListener("position", this._onGeolocationSuccess,this);
      geo.addListener("error", this._onGeolocationError,this);
    },


    /**
     * Callback function when Geolocation did work.
     */
    _onGeolocationSuccess : function(position) {
      this._zoomToPosition(position.getLongitude(), position.getLatitude(), 15, true);

      this._redrawMap();
    },


    /**
     * Callback function when Geolocation returned an error.
     */
    _onGeolocationError : function() {
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
    _getGeoPosition : function() {
      var geo = qx.bom.GeoLocation.getInstance();
      geo.getCurrentPosition(false, 1000, 1000);
    },


    destruct : function()
    {
      this._disposeObjects("_mapUri","_map","_myPositionMarker","_markers","_showMyPositionButton","_mapnikLayer");
    }
  }
});
