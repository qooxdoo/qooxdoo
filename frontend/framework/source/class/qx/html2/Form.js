qx.Class.define("qx.html2.Form",
{
  statics :
  {
    /**
     * Adopted from Mochikit
     *
     * @type static
     * @return {void} 
     */
    clear : function(element) {
      element.value = '';
    },


    /**
     * Adopted from Mochikit
     *
     * @type static
     * @param element {var} TODOC
     * @return {void} 
     */
    focus : function(element) {
      element.focus();
    },


    /**
     * Adopted from Mochikit
     *
     * @type static
     * @param element {var} TODOC
     * @return {void} 
     */
    select : function(element) {
      element.select();
    },


    /**
     * Adopted from Mochikit
     *
     * @type static
     * @param element {var} TODOC
     * @return {void} 
     */
    activate : function(element)
    {
      element.focus();

      if (element.select) {
        element.select();
      }
    },


    /**
     * Adopted from Mochikit
     *
     * @type static
     * @param form {var} TODOC
     * @return {var} TODOC
     */
    serialize : function(form)
    {
      var elements = MochiKit.Form.getElements(form);
      var queryComponents = [];

      for (var i=0; i<elements.length; i++)
      {
        var queryComponent = MochiKit.Form.serializeElement(elements[i]);

        if (queryComponent) {
          queryComponents.push(queryComponent);
        }
      }

      return queryComponents.join('&');
    },


    /**
     * Adopted from Mochikit
     *
     * @type static
     * @param form {var} TODOC
     * @return {var} TODOC
     */
    getElements : function(form)
    {
      var elements = [];

      for (var tagName in MochiKit.Form.Serializers)
      {
        var tagElements = form.getElementsByTagName(tagName);

        for (var j=0; j<tagElements.length; j++) {
          elements.push(tagElements[j]);
        }
      }

      return elements;
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @return {void | var} TODOC
     */
    serializeElement : function(element)
    {
      element = MochiKit.DOM.getElement(element);
      var method = element.tagName.toLowerCase();
      var parameter = MochiKit.Form.Serializers[method](element);

      if (parameter)
      {
        var key = encodeURIComponent(parameter[0]);

        if (key.length === 0) {
          return;
        }

        if (!(parameter[1] instanceof Array)) {
          parameter[1] = [ parameter[1] ];
        }

        return parameter[1].map(function(value) {
          return key + '=' + encodeURIComponent(value);
        }).join('&');
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @return {var | boolean} TODOC
     */
    input : function(element)
    {
      switch(element.type.toLowerCase())
      {
        case 'submit':
        case 'hidden':
        case 'password':
        case 'text':
          return MochiKit.Form.Serializers.textarea(element);

        case 'checkbox':
        case 'radio':
          return MochiKit.Form.Serializers.inputSelector(element);
      }

      return false;
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @return {Array} TODOC
     */
    inputSelector : function(element)
    {
      if (element.checked) {
        return [ element.name, element.value ];
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @return {Array} TODOC
     */
    textarea : function(element) {
      return [ element.name, element.value ];
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @return {var} TODOC
     */
    select : function(element) {
      return MochiKit.Form.Serializers[element.type == 'select-one' ? 'selectOne' : 'selectMany'](element);
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @return {Array} TODOC
     */
    selectOne : function(element)
    {
      var value = '', opt, index = element.selectedIndex;

      if (index >= 0)
      {
        opt = element.options[index];
        value = opt.value;

        if (!value && !('value' in opt)) {
          value = opt.text;
        }
      }

      return [ element.name, value ];
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @return {Array} TODOC
     */
    selectMany : function(element)
    {
      var value = [];

      for (var i=0; i<element.length; i++)
      {
        var opt = element.options[i];

        if (opt.selected)
        {
          var optValue = opt.value;

          if (!optValue && !('value' in opt)) {
            optValue = opt.text;
          }

          value.push(optValue);
        }
      }

      return [ element.name, value ];
    },

    // Adopted from Mochikit
    /**
     * TODOC
     *
     * @type static
     * @param elem {Element} TODOC
     * @return {Array} TODOC
     */
    formContents : function(elem)  /* = document.body */
    {
      var names = [];
      var values = [];
      var m = MochiKit.Base;
      var self = MochiKit.DOM;

      if (typeof (elem) == "undefined" || elem === null) {
        elem = self._document.body;
      } else {
        elem = self.getElement(elem);
      }

      m.nodeWalk(elem, function(elem)
      {
        var name = elem.name;

        if (m.isNotEmpty(name))
        {
          var tagName = elem.tagName.toUpperCase();

          if (tagName === "INPUT" && (elem.type == "radio" || elem.type == "checkbox") && !elem.checked) {
            return null;
          }

          if (tagName === "SELECT")
          {
            if (elem.type == "select-one")
            {
              if (elem.selectedIndex >= 0)
              {
                var opt = elem.options[elem.selectedIndex];
                var v = opt.value;

                if (!v)
                {
                  var h = opt.outerHTML;

                  // internet explorer sure does suck.
                  if (h && !h.match(/^[^>]+\svalue\s*=/i)) {
                    v = opt.text;
                  }
                }

                names.push(name);
                values.push(v);
                return null;
              }

              // no form elements?
              names.push(name);
              values.push("");
              return null;
            }
            else
            {
              var opts = elem.options;

              if (!opts.length)
              {
                names.push(name);
                values.push("");
                return null;
              }

              for (var i=0; i<opts.length; i++)
              {
                var opt = opts[i];

                if (!opt.selected) {
                  continue;
                }

                var v = opt.value;

                if (!v)
                {
                  var h = opt.outerHTML;

                  // internet explorer sure does suck.
                  if (h && !h.match(/^[^>]+\svalue\s*=/i)) {
                    v = opt.text;
                  }
                }

                names.push(name);
                values.push(v);
              }

              return null;
            }
          }

          if (tagName === "FORM" || tagName === "P" || tagName === "SPAN" || tagName === "DIV") {
            return elem.childNodes;
          }

          names.push(name);
          values.push(elem.value || '');
          return null;
        }

        return elem.childNodes;
      });

      return [ names, values ];
    },

    // By BASE2
    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @return {boolean | var} TODOC
     */
    isSuccessful : function(element)
    {
      if (!element.name || element.disabled) return false;

      switch(element.type)
      {
        case "button":
        case "reset":
          return false;

        case "radio":
        case "checkbox":
          return element.checked;

        case "image":
        case "submit":
          return element == document.activeElement;

        default:
          return true;
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @return {var} TODOC
     */
    serialize : function(element) {
      return element.name + "=" + encodeURIComponent(element.value);
    }
  }
});
