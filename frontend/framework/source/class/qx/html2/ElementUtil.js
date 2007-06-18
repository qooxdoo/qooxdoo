qx.Class.define("qx.html2.ElementUtil",
{
  statics :
  {
    __mshtml : qx.core.Client.getInstance().isMshtml(),

    __attributeHints :
    {
      names :
      {
        "class" : "className",
        "for" : "htmlFor",
        "html" : "innerHTML",
        colspan : "colSpan",
        rowspan : "rowSpan",
        valign : "vAlign",
        datetime : "dateTime",
        accesskey : "accessKey",
        tabindex : "tabIndex",
        enctype : "encType",
        maxlength : "maxLength",
        readonly : "readOnly",
        longdesc : "longDesc",
        textContent : qx.core.Client.getInstance().isMshtml() ? "innerText" : "textContent"
      },

      property :
      {
        disabled : true,
        checked : true,
        readOnly : true,
        multiple : true,
        selected : true,
        value : true,
        maxLength : true,
        className : true,
        innerHtml : true,
        innerText : true,
        textContent : true,
        htmlFor : true
      },

      mshtmlOriginal :
      {
        href : true,
        src : true,
        type : true
      }
    },


    getAttribute : function(el, name)
    {
      var hints = this.__attributeHints;

      // normalize name
      name = hints.names[name] || name;

      // respect properties
      if (hints.property[name]) {
        return el[name];
      }

      // respect original values
      // http://msdn2.microsoft.com/en-us/library/ms536429.aspx
      if (this.__mshtml && hints.mshtmlOriginal[name]) {
        return el.getAttribute(name, 2);
      }

      return el.getAttribute(name);
    },


    setAttribute : function(el, name, value)
    {
      var hints = this.__attributeHints;

      // normalize name
      name = hints.names[name] || name;

      // apply attribute
      if (hints.property[name]) {
        el[name] = value;
      } else if (value === true) {
        el.setAttribute(name, name);
      } else if (value === false || value === null) {
        el.removeAttribute(name);
      } else {
        el.setAttribute(name, value);
      }

      return el;
    },


    setCss : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el, value) {
        el.style.cssText = value;
      },

      "default" : function(el, value) {
        return el.setAttribute("style", value);
      }
    }),


    getCss : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return el.style.cssText.toLowerCase();
      },

      "default" : function(el) {
        return el.getAttribute("style");
      }
    }),


    __styleHints :
    {
      names :
      {
        "float" : qx.core.Client.getInstance().isMshtml() ? "styleFloat" : "cssFloat"

        // TODO: CamelCase names?
      }
    },


    setStyle : function(el, name, value)
    {
      var hints = this.__styleHints;

      // normalize name
      name = hints.names[name] || name;

      // apply style
      el.style[name] = value;

      return el;
    },


    getStyle : function(el, name)
    {
      var hints = this.__styleHints;

      // normalize name
      name = hints.names[name] || name;

      // read out style
      var value = el.style[name];

      // otherwise try computed value
      if (!value)
      {
        var computed = document.defaultView.getComputedStyle(el, null);
        if (computed) {
          value = computed[name];
        }
      }

      // auto should be interpreted as null
      return value === "auto" ? null : value;
    }
  }
});
