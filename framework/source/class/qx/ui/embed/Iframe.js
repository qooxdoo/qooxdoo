/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Til Schneider (til132)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Container widget for internal frames (iframes).
 * An iframe can display any HTML page inside the widget.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 * var document = this.getRoot();
 * var iframe = new qx.ui.embed.Iframe("http://www.qooxdoo.org");
 * document.add(iframe);
 * </pre>
 *
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/iframe.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.embed.Iframe",
{
  extend : qx.ui.embed.AbstractIframe,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @ignore(MutationObserver)
   * @param source {String} URL which should initially set.
   */
  construct : function(source)
  {
    if (source != null) {
      this.__source = source;
    }

    this.base(arguments, source);

    qx.event.Registration.addListener(document.body, "pointerdown", this.block, this, true);
    qx.event.Registration.addListener(document.body, "pointerup", this.release, this, true);
    qx.event.Registration.addListener(document.body, "losecapture", this.release, this, true);

    this.__blockerElement = this._createBlockerElement();

    if ( qx.core.Environment.get("ecmascript.mutationobserver") )
    {
      this.addListenerOnce("appear", function ()
      {
        var element = this.getContentElement().getDomElement();

        // Mutation record check callback
        var isDOMNodeInserted = function (mutationRecord)
        {
          var i;
          // 'our' iframe was either added...
          if (mutationRecord.addedNodes)
          {
            for (i = mutationRecord.addedNodes.length; i>=0; --i) {
              if (mutationRecord.addedNodes[i] == element) {
                return true;
              }
            }
          }
          // ...or removed
          if (mutationRecord.removedNodes)
          {
            for (i = mutationRecord.removedNodes.length; i>=0; --i) {
              if (mutationRecord.removedNodes[i] == element) {
                return true;
              }
            }
          }
          return false;
        };

        var observer = new MutationObserver(function (mutationRecords)
        {
          if (mutationRecords.some(isDOMNodeInserted)) {
            this._syncSourceAfterDOMMove();
          }
        }.bind(this));

        // Observe parent element
        var parent = this.getLayoutParent().getContentElement().getDomElement();
        observer.observe(parent, { childList: true });

      }, this);
    }
    else // !qx.core.Environment.get("ecmascript.mutationobserver")
    {
      this.addListenerOnce("appear", function ()
      {
        var element = this.getContentElement().getDomElement();
        qx.bom.Event.addNativeListener(element, "DOMNodeInserted", this._onDOMNodeInserted);
      }, this);
      this._onDOMNodeInserted = qx.lang.Function.listener(this._syncSourceAfterDOMMove, this);
    }
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "iframe"
    },


    /**
     * Whether to show the frame's native context menu.
     *
     * Note: This only works if the iframe source is served from the same domain
     * as the main application.
     */
    nativeContextMenu :
    {
      refine: true,
      init : false
    },


    /**
     * If the user presses F1 in IE by default the onhelp event is fired and
     * IE’s help window is opened. Setting this property to <code>false</code>
     * prevents this behavior.
     *
     * Note: This only works if the iframe source is served from the same domain
     * as the main application.
     */
    nativeHelp :
    {
      check : "Boolean",
      init : false,
      apply : "_applyNativeHelp"
    },

    /**
     * Whether the widget should have scrollbars.
     */
    scrollbar :
    {
      check : ["auto", "no", "yes"],
      nullable : true,
      themeable : true,
      apply : "_applyScrollbar"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __source : null,
    __blockerElement : null,


    // overridden
    renderLayout : function(left, top, width, height)
    {
      this.base(arguments, left, top, width, height);

      var pixel = "px";
      var insets = this.getInsets();

      this.__blockerElement.setStyles({
        "left": (left + insets.left) + pixel,
        "top": (top + insets.top) + pixel,
        "width": (width - insets.left - insets.right) + pixel,
        "height": (height - insets.top - insets.bottom) + pixel
      });
    },


    // overridden
    _createContentElement : function()
    {
      var iframe = new qx.html.Iframe(this.__source);
      iframe.addListener("load", this._onIframeLoad, this);
      return iframe;
    },


    // overridden
    _getIframeElement : function() {
      return this.getContentElement();
    },


    /**
     * Creates <div> element which is aligned over iframe node to avoid losing pointer events.
     *
     * @return {Object} Blocker element node
     */
    _createBlockerElement : function()
    {
      var el = new qx.html.Blocker();
      el.setStyles({
        "zIndex": 20,
        "display": "none"
      });

      return el;
    },


    /**
     * Reacts on native load event and redirects it to the widget.
     *
     * @param e {qx.event.type.Event} Native load event
     */
    _onIframeLoad : function(e)
    {
      this._applyNativeContextMenu(this.getNativeContextMenu(), null);
      this._applyNativeHelp(this.getNativeHelp(), null);

      this.fireNonBubblingEvent("load");
    },




    /*
    ---------------------------------------------------------------------------
      METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Cover the iframe with a transparent blocker div element. This prevents
     * pointer or key events to be handled by the iframe. To release the blocker
     * use {@link #release}.
     *
     */
    block : function() {
      this.__blockerElement.setStyle("display", "block");
    },


    /**
     * Release the blocker set by {@link #block}.
     *
     */
    release : function() {
      this.__blockerElement.setStyle("display", "none");
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyNativeContextMenu : function(value, old)
    {
      if (value !== false && old !== false) {
        return;
      }

      var doc = this.getDocument();
      if (!doc) {
        return;
      }

      try {
        var documentElement = doc.documentElement;
      } catch(e) {
        // this may fail due to security restrictions
        return;
      }

      if (old === false)
      {
        qx.event.Registration.removeListener(
          documentElement, "contextmenu",
          this._onNativeContextMenu, this, true
        );
      }

      if (value === false)
      {
        qx.event.Registration.addListener(
          documentElement, "contextmenu",
          this._onNativeContextMenu, this, true
        );
      }
    },


    /**
     * Stops the <code>contextmenu</code> event from showing the native context menu
     *
     * @param e {qx.event.type.Mouse} The event object
     */
    _onNativeContextMenu : function(e) {
      e.preventDefault();
    },


    // property apply
    _applyNativeHelp : function(value, old)
    {
      if (qx.core.Environment.get("event.help")) {
        var document = this.getDocument();
        if (!document) {
          return;
        }

        try
        {
          if (old === false) {
            qx.bom.Event.removeNativeListener(document, "help", (function() {return false;}));
          }

          if (value === false) {
            qx.bom.Event.addNativeListener(document, "help", (function() {return false;}));
          }
        } catch (e) {
          if (qx.core.Environment.get("qx.debug")) {
            this.warn(
              "Unable to set 'nativeHelp' property, possibly due to security restrictions"
            );
          }
        }
      }
    },


    /**
     * Checks if the iframe element is out of sync. This can happen in Firefox
     * if the iframe is moved around and the source is changed right after.
     * The root cause is that Firefox is reloading the iframe when its position
     * in DOM has changed.
     */
    _syncSourceAfterDOMMove : function()
    {
      var iframeDomElement = this.getContentElement().getDomElement();
      var iframeSource = iframeDomElement.src;

      // remove trailing "/"
      if (iframeSource.charAt(iframeSource.length-1) == "/") {
        iframeSource = iframeSource.substring(0, iframeSource.length-1);
      }

      if (iframeSource != this.getSource())
      {
        if ( qx.core.Environment.get("browser.name") != "edge" &&
             qx.core.Environment.get("browser.name") != "ie" )
        {
          qx.bom.Iframe.getWindow(iframeDomElement).stop();
        }
        iframeDomElement.src = this.getSource();
      }
    },


    // property apply
    _applyScrollbar : function(value) {
      this.getContentElement().setAttribute("scrolling", value);
    },


    // overridden
    setLayoutParent : function(parent)
    {
      this.base(arguments, parent);
      if (parent) {
        this.getLayoutParent().getContentElement().add(this.__blockerElement);
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.getLayoutParent() && this.__blockerElement.getParent()) {
      this.getLayoutParent().getContentElement().remove(this.__blockerElement);
    }
    this._disposeObjects("__blockerElement");

    qx.event.Registration.removeListener(document.body, "pointerdown", this.block, this, true);
    qx.event.Registration.removeListener(document.body, "pointerup", this.release, this, true);
    qx.event.Registration.removeListener(document.body, "losecapture", this.release, this, true);
  }
});
