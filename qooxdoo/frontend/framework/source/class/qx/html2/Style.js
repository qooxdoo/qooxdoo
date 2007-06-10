qx.Class.define("qx.html2.Style",
{
  statics :
  {
    /**
     * Adapted from Mochikit
     *
     * @type static
     * @param elem {Element} TODOC
     * @param cssProperty {var} TODOC
     * @return {var | float} TODOC
     */
    getStyle : function(elem, cssProperty)
    {
      var dom = MochiKit.DOM;
      var d = dom._document;

      elem = dom.getElement(elem);
      cssProperty = MochiKit.Base.camelize(cssProperty);

      if (!elem || elem == d) {
        return undefined;
      }

      if (cssProperty == 'opacity' && elem.filters)
      {
        var opacity = (MochiKit.Style.getStyle(elem, 'filter') || '').match(/alpha\(opacity=(.*)\)/);

        if (opacity && opacity[1]) {
          return parseFloat(opacity[1]) / 100;
        }

        return 1.0;
      }

      var value = elem.style ? elem.style[cssProperty] : null;

      if (!value)
      {
        if (d.defaultView && d.defaultView.getComputedStyle)
        {
          var css = d.defaultView.getComputedStyle(elem, null);
          cssProperty = cssProperty.replace(/([A-Z])/g, '-$1').toLowerCase();  // from dojo.style.toSelectorCase
          value = css ? css.getPropertyValue(cssProperty) : null;
        }
        else if (elem.currentStyle)
        {
          value = elem.currentStyle[cssProperty];
        }
      }

      if (cssProperty == 'opacity') {
        value = parseFloat(value);
      }

      if (/Opera/.test(navigator.userAgent) && (MochiKit.Base.find([ 'left', 'top', 'right', 'bottom' ], cssProperty) != -1))
      {
        if (MochiKit.Style.getStyle(elem, 'position') == 'static') {
          value = 'auto';
        }
      }

      return value == 'auto' ? null : value;
    },


    /**
     * Adapted from Mochikit
     *
     * @type static
     * @param elem {Element} TODOC
     * @param style {var} TODOC
     * @return {void} 
     */
    setStyle : function(elem, style)
    {
      for (var name in style)
      {
        if (name == 'opacity') {
          MochiKit.Style.setOpacity(elem, style[name]);
        } else {
          elem.style[MochiKit.Base.camelize(name)] = style[name];
        }
      }
    },


    /**
     * Adapted from Mochikit
     * - Opacity filter needs hasLayout=true, can force this with style.zoom=1 as seen in Yahoo.DOM
     *
     * @type static
     * @param elem {Element} TODOC
     * @param o {Object} TODOC
     * @return {void} 
     */
    setOpacity : function(elem, o)
    {
      var self = MochiKit.Style;

      if (o == 1)
      {
        var toSet = /Gecko/.test(navigator.userAgent) && !(/Konqueror|AppleWebKit|KHTML/.test(navigator.userAgent));
        elem.style["opacity"] = toSet ? 0.999999 : 1.0;

        if (/MSIE/.test(navigator.userAgent)) {
          elem.style['filter'] = self.getStyle(elem, 'filter').replace(/alpha\([^\)]*\)/gi, '');
        }
      }
      else
      {
        if (o < 0.00001) {
          o = 0;
        }

        elem.style["opacity"] = o;

        if (/MSIE/.test(navigator.userAgent)) {
          elem.style['filter'] = self.getStyle(elem, 'filter').replace(/alpha\([^\)]*\)/gi, '') + 'alpha(opacity=' + o * 100 + ')';
        }
      }
    },


    /**
     * Adapted from PrototypeJS
     *
     * @type static
     * @param element {var} TODOC
     * @param style {var} TODOC
     * @return {var} TODOC
     */
    getStyle : function(element, style)
    {
      style = style == 'float' ? 'cssFloat' : style.camelize();
      var value = element.style[style];

      if (!value)
      {
        var css = document.defaultView.getComputedStyle(element, null);
        value = css ? css[style] : null;
      }

      if (style == 'opacity') return value ? parseFloat(value) : 1.0;
      return value == 'auto' ? null : value;
    },


    /**
     * Adapted from PrototypeJS
     *
     * @type static
     * @param element {var} TODOC
     * @param styles {var} TODOC
     * @param camelized {var} TODOC
     * @return {var} TODOC
     */
    setStyle : function(element, styles, camelized)
    {
      var elementStyle = element.style;

      for (var property in styles) if (property == 'opacity') element.setOpacity(styles[property]);
      else elementStyle[(property == 'float' || property == 'cssFloat') ? (elementStyle.styleFloat === undefined ? 'cssFloat' : 'styleFloat') : (camelized ? property : property.camelize())] = styles[property];

      return element;
    }
  }
});
