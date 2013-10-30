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

/*
 * If you have added resources to your app remove the leading '*' in the
 * following line to make use of them.


************************************************************************ */

/**
 * Mobile page responsible for switching between provided themes.
 *
 * @asset(qx/mobile/css/*)
 */
qx.Class.define("mobileshowcase.page.Theming",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments, false);
    this.setTitle("Theming");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");

    this.__themes = [{
      "name": "Indigo",
      "css": "qx/mobile/css/indigo.css"
    }, {
      "name": "Flat",
      "css": "qx/mobile/css/flat.css"
    }];

    this.__preloadThemes();
  },


  members :
  {
    __themes : null,
    __slider : null,
    __demoImageLabel : null,


    /**
     * Preloads all css files for preventing flickering on theme switches.
     */
    __preloadThemes : function() {
      for(var i = 0; i < this.__themes.length; i++) {
        var cssResource = this.__themes[i].css;
        var cssURI = qx.util.ResourceManager.getInstance().toUri(cssResource);

        var req = new qx.bom.request.Xhr();

        req.open("GET", cssURI);
        req.send();
      }
    },


    // overridden
    _initialize : function()
    {
      this.base(arguments);
/*
      this.getContent().add(new qx.ui.mobile.form.Title("Select a theme"));

      var themeGroup = new qx.ui.mobile.form.Group([],false);
      var themeForm = new qx.ui.mobile.form.Form();

      var themeRadioGroup = new qx.ui.mobile.form.RadioGroup();
      for (var i = 0; i < this.__themes.length; i++) {
        var radioButton = new qx.ui.mobile.form.RadioButton();
        themeRadioGroup.add(radioButton);
        themeForm.add(radioButton, this.__themes[i].name);

        radioButton.addListener("tap", this.__switchTheme, {
          "self": this,
          "index": i
        });
      }

      themeGroup.add(new qx.ui.mobile.form.renderer.Single(themeForm));
      this.getContent().add(themeGroup);
*/
      this.__createThemeScaleControl();

      this._createImageResolutionHandlingDemo();
    },


    /** Creates and adds the image resolution demonstration. */
    _createImageResolutionHandlingDemo : function() {
      this.getContent().add(new qx.ui.mobile.form.Title("Resolution-specific Images"));
      var demoImage = new qx.ui.mobile.basic.Image("mobileshowcase/icon/image.png");
      demoImage.addCssClass("resolution-demo-image");

      this.__demoImageLabel = new qx.ui.mobile.basic.Label();
      this.__demoImageLabel.addCssClass("resolution-demo-label");
      this._updateDemoImageLabel();

      var demoImageGroup = new qx.ui.mobile.form.Group();
      demoImageGroup.add(demoImage);
      demoImageGroup.add(this.__demoImageLabel);
      this.getContent().add(demoImageGroup);
    },


   /**
    * Refreshes the label which displays the pixel ratio, scale factor etc.
    */
    _updateDemoImageLabel : function() {
      var pixelRatio = qx.core.Environment.get("device.pixelRatio");
      var scaleFactor = qx.core.Init.getApplication().getRoot().getScaleFactor();

      var demoLabelTemplate = "<div>Best available image for final scale<span>%1</span></div> <div><br/></div> <div>Device pixel ratio:<span>%2</span></div>  <div>Computed application scale:<span>%3</span></div> ";
      var labelContent = qx.lang.String.format(demoLabelTemplate, [this.__format(pixelRatio*scaleFactor), this.__format(pixelRatio), this.__format(scaleFactor)]);

      this.__demoImageLabel.setValue(labelContent);
    },


   /**
    * Formats a number to at least one decimal.
    * @param x {Number}
    * @return {String} the formatted number
    */
    __format : function (x)
    {
      if (x == parseInt(x, 10)) {
        x = x.toFixed(1);
      }

      return x;
    },


    /**
     * Creates the a control widget for the theme's scale factor.
     * @return {qx.ui.mobile.form.Form} the control widget for the adjusting the theme scaling.
     */
    __createThemeScaleControl : function()
    {
      this.getContent().add(new qx.ui.mobile.form.Title("Adjust the scale"));

      var form = new qx.ui.mobile.form.Form();
      var slider = this.__slider = new qx.ui.mobile.form.Slider();
      slider.set({
        "displayValue":"value",
        "minimum":50,
        "maximum":200,
        "value":100,
        "step":10
      });
      form.add(slider,"Custom Application Scale in %");

      var useScaleButton = new qx.ui.mobile.form.Button("Apply");
      useScaleButton.addListener("tap", this._onApplyScaleButtonTap, this);
      form.addButton(useScaleButton);

      var scaleGroup = new qx.ui.mobile.form.Group([new qx.ui.mobile.form.renderer.Single(form)],false);
      this.getContent().add(scaleGroup);
    },


    /**
    * Handler for "tap" event on applyScaleButton. Applies the app's root font size in relation to slider value.
    */
    _onApplyScaleButtonTap : function() {
      qx.core.Init.getApplication().getRoot().setScaleFactor(this.__slider.getValue()/100);

      this._updateDemoImageLabel();

      var lastValue = this.__slider.getValue();
      this.__slider.setValue(0);
      this.__slider.setValue(lastValue);

      qx.core.Init.getApplication().getRouting().executeGet("/theming", {reverse:false});
    },


    /**
     * Changes the used CSS of the application.
     * @param cssFile {String} The css file url.
     * @param cssLinkIndex {String} index of the css link entry in head, which will be replaced.
     */
    __changeCSS : function(cssFile, cssLinkIndex) {
      var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);

      var newlink = document.createElement("link")
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", cssFile);

      document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
     },


    /**
     * Switches the theme of the application to the target theme.
     * @param src {qx.ui.mobile.core.Widget} Source widget of this event.
     */
    __switchTheme : function() {
      var cssResource = this.self.__themes[this.index].css;
      var cssURI = qx.util.ResourceManager.getInstance().toUri(cssResource);
      this.self.__changeCSS(cssURI, 1);
    },


    /**
     * Adds a new theme data object to the theme switcher.
     * @param cssFile {String} The css file url.
     */
    appendTheme : function(themeData) {
      this.__themes.push(themeData);
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    },


    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct : function()
    {
      this._disposeObjects("__themes");
    }
  }
});
