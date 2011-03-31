/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2005-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class is the single point to access all settings that may be different
 * in different environments. This contains e.g. the browser name, engine
 * version but also qooxdoo or application specific settings.
 *
 * It's public API can be found in its four main methods. One pair of methods
 * are used to check the synchronous values of the environment. The other pais
 * is used for asynchronous checks.
 *
 * The most used method should be {@link #get} which is used to return the
 * current value for a given environment check.
 *
 * All qx settings can be changed via the generator's config. See the manual
 * for more details about the environment key in the config. As you can see
 * from the methods API, there is no way to override an existing key. So if you
 * need to change a qx setting, you have to use the generator to do so.
 *
 * The following table shows all checks which could be used. If you are
 * interessted in more details, check the reference to the implementation of
 * each check. Plese do not use these check implementation directly due to the
 * missing caching feature the Environment class offers.
 *
 * <table border="0" cellspacing="10">
 *   <tbody>
 *     <tr>
 *       <td colspan="4"><h2>Synchronous checks</h2>
 *       </td>
 *     </tr>
 *     <tr>
 *       <th><h3>Key</h3></th>
 *       <th><h3>Type</h3></th>
 *       <th><h3>Example</h3></th>
 *       <th><h3>Details</h3></th>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>browser</b></td>
 *     </tr>
 *     <tr>
 *       <td>browser.documentmode</td><td><i>Integer</em></td><td><code>0</code></td>
 *       <td>{@link qx.bom.client.Browser#getDocumentMode}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.name</td><td><i>String</em></td><td><code> chrome </code></td>
 *       <td>{@link qx.bom.client.Browser#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.quirksmode</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Browser#getQuirksMode}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.version</td><td><i>String</em></td><td><code>11.0</code></td>
 *       <td>{@link qx.bom.client.Browser#getVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>css</b></td>
 *     </tr>
 *     <tr>
 *       <td>css.borderradius</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getBorderRadius}</td>
 *     </tr>
 *     <tr>
 *       <td>css.boxmodel</td><td><i>String</em></td><td><code>content</code></td>
 *       <td>{@link qx.bom.client.Css#getBoxModel}</td>
 *     </tr>
 *     <tr>
 *       <td>css.boxshadow</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getBoxShadow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.gradients</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getGradients}</td>
 *     </tr>
 *     <tr>
 *       <td>css.placeholder</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getPlaceholder}</td>
 *     </tr>
 *     <tr>
 *       <td>css.textoverflow</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getTextOverflow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.translate3d</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getTranslate3d}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>device</b></td>
 *     </tr>
 *     <tr>
 *       <td>device.name</td><td><i>String</em></td><td><code>pc</code></td>
 *       <td>{@link qx.bom.client.Device#getName}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>ecmascript</b></td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.objectcount</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getObjectCount}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>engine</b></td>
 *     </tr>
 *     <tr>
 *       <td>engine.name</td><td><i>String</em></td><td><code>webkit</code></td>
 *       <td>{@link qx.bom.client.Engine#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>engine.version</td><td><i>String</em></td><td><code>534.24</code></td>
 *       <td>{@link qx.bom.client.Engine#getVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>event</b></td>
 *     </tr>
 *     <tr>
 *       <td>event.pointer</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getPointer}</td>
 *     </tr>
 *     <tr>
 *       <td>event.touch</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Event#getTouch}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>html</b></td>
 *     </tr>
 *     <tr>
 *       <td>html.audio</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getAudio}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.mp3</td><td><i>String</em></td><td><code>""</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioMp3}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.ogg</td><td><i>String</em></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioOgg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.wav</td><td><i>String</em></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioWav}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.ai</td><td><i>String</em></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioAi}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.aif</td><td><i>String</em></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioAif}</td>
 *     </tr>
 *     <tr>
 *       <td>html.canvas</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getCanvas}</td>
 *     </tr>
 *     <tr>
 *       <td>html.classlist</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getClassList}</td>
 *     </tr>
 *     <tr>
 *       <td>html.geolocation</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getGeoLocation}</td>
 *     </tr>
 *     <tr>
 *       <td>html.storage.local</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getLocalStorage}</td>
 *     </tr>
 *     <tr>
 *       <td>html.storage.session</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getSessionStorage}</td>
 *     </tr>
 *     <tr>
 *       <td>html.svg</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getSvg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getVideo}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.h264</td><td><i>String</em></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoH264}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.ogg</td><td><i>String</em></td><td><code>""</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoOgg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.webm</td><td><i>String</em></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoWebm}</td>
 *     </tr>
 *     <tr>
 *       <td>html.vml</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Html#getVml}</td>
 *     </tr>
 *     <tr>
 *       <td>html.webworker</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getWebWorker}</td>
 *     </tr>
 *     <tr>
 *       <td>html.xpath</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getXPath}</td>
 *     </tr>
 *     <tr>
 *       <td>html.xul</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getXul}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>io</b></td>
 *     </tr>
 *     <tr>
 *       <td>io.maxrequests</td><td><i>Integer</em></td><td><code>4</code></td>
 *       <td>{@link qx.bom.client.Transport#getMaxConcurrentRequestCount}</td>
 *     </tr>
 *     <tr>
 *       <td>io.ssl</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Transport#getSsl}</td>
 *     </tr>
 *     <tr>
 *       <td>io.xhr</td><td><i>String</em></td><td><code>xhr</code></td>
 *       <td>{@link qx.bom.client.Transport#getXmlHttpRequest}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>locale</b></td>
 *     </tr>
 *     <tr>
 *       <td>locale</td><td><i>String</em></td><td><code>de</code></td>
 *       <td>{@link qx.bom.client.Locale#getLocale}</td>
 *     </tr>
 *     <tr>
 *       <td>locale.variant</td><td><i>String</em></td><td><code>de</code></td>
 *       <td>{@link qx.bom.client.Locale#getVariant}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>os</b></td>
 *     </tr>
 *     <tr>
 *       <td>os.name</td><td><i>String</em></td><td><code>osx</code></td>
 *       <td>{@link qx.bom.client.OperatingSystem#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>os.version</td><td><i>String</em></td><td><code>10.6</code></td>
 *       <td>{@link qx.bom.client.OperatingSystem#getVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>phonegap</b></td>
 *     </tr>
 *     <tr>
 *       <td>phonegap</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.PhoneGap#getPhoneGap}</td>
 *     </tr>
 *     <tr>
 *       <td>phonegap.notification</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.PhoneGap#getNotification}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>plugin</b></td>
 *     </tr>
 *     <tr>
 *       <td>plugin.divx</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getDivX}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.divx.version</td><td><i>String</em></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getDivXVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#isAvailable}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.express</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#getExpressInstall}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.strictsecurity</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#getStrictSecurityModel}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.version</td><td><i>String</em></td><td><code>10.2.154</code></td>
 *       <td>{@link qx.bom.client.Flash#getVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.gears</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getGears}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.quicktime</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Plugin#getQuicktime}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.quicktime.version</td><td><i>String</em></td><td><code>7.6</code></td>
 *       <td>{@link qx.bom.client.Plugin#getQuicktimeVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.silverlight</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getSilverlight}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.silverlight.version</td><td><i>String</em></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getSilverlightVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.windowsmedia</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getWindowsMedia}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.windowsmedia.version</td><td><i>String</em></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getWindowsMediaVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>qx</b></td>
 *     </tr>
 *     <tr>
 *       <td>qx.allowUrlSettings</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.allowUrlVariants</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.application</td><td><i>String</em></td><td><code>name.space</code></td>
 *       <td><i>default:</i> <code>&lt;&lt;application name&gt;&gt;</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.aspects</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.databinding</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.disposerDebugLevel</td><td><i>Integer</em></td><td><code>0</code></td>
 *       <td><i>default:</i> <code>0</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.dynamicmousewheel</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.dynlocale</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.globalErrorHandling</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.mobile.emulatetouch</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.mobile.nativescroll</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.propertyDebugLevel</td><td><i>Integer</em></td><td><code>0</code></td>
 *       <td><i>default:</i> <code>0</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.theme</td><td><i>String</em></td><td><code>qx.theme.Modern</code></td>
 *       <td><i>default:</i> <code>&lt;&lt;theme name&gt;&gt;</code></td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><h3>Asynchronous checks</h3>
 *       </td>
 *     </tr>
 *     <tr>
 *       <td>html.dataurl</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getDataUrl}</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 */
qx.Bootstrap.define("qx.core.Environment",
{
  statics : {

    /** Map containing the synchronous check functions. */
    _checks : {},
    /** Map containing the asynchronous check functions. */
    _asyncChecks : {},

    /** Internal cache for all checks. */
    __cache : {},


    /**
     * The default accessor for the checks. It returns the value the current
     * environment has for the given key. The key could be something like
     * "qx.debug", "css.textoverflow" or "io.ssl". A complete list of
     * checks can be found in the class comment of this class.
     *
     * Please keep in mind that the result is cached. If you want to run the
     * check function again in case something could have been changed, take a
     * look at the {@link #invalidateCacheKey} function.
     *
     * @param key {String} The name of the check you want to query.
     */
    get : function(key) {
      // check the cache
      if (this.__cache[key] != undefined) {
        return this.__cache[key];
      }

      // search for a fitting check
      var check = this._checks[key];
      if (check) {
        // execute the check and write the result in the cache
        var value = check();
        this.__cache[key] = value;
        return value;
      }

      // debug flag
      if (qx.Bootstrap.DEBUG) {
        qx.Bootstrap.warn(
          key + " is not a valid key. Please see the API-doc of " +
          "qx.core.Environment for a list of predefined keys."
        );
        qx.Bootstrap.trace(this);
      }
    },


    /**
     * Invokes the callback as soon as the check has been done. If no check
     * could be found, a warning will be printed.
     *
     * @param key {String} The key of the asynchronous check.
     * @param callback {Function} The function to call as soon as the check is
     *   done. The function should have one argument which is the result of the
     *   check.
     * @param self {var} The context to use when invoking the callback.
     */
    getAsync : function(key, callback, self) {
      // check the cache
      var env = this;
      if (this.__cache[key] != undefined) {
        // force async behavior
        window.setTimeout(function() {
          callback.call(self, env.__cache[key]);
        }, 0);
        return;
      }

      var check = this._asyncChecks[key];
      if (check) {
        check(function(result) {
          env.__cache[key] = result;
          callback.call(self, result);
        });
        return;
      }

      // debug flag
      if (qx.Bootstrap.DEBUG) {
        qx.Bootstrap.warn(
          key + " is not a valid key. Please see the API-doc of " +
          "qx.core.Environment for a list of predefined keys."
        );
        qx.Bootstrap.trace(this);
      }
    },


    /**
     * Returns the proper value dependent on the check for the given key.
     *
     * @param key {String} The name of the check the select depends on.
     * @param values {Map} A map containing the values which should be returned
     *   in any case. The "default" key could be used as a catch all statement.
     * @return {var} The value which is stored in the map for the given
     *   check of the key.
     */
    select : function(key, values) {
      return this.__pickFromValues(this.get(key), values);
    },


    /**
     * Selects the proper function dependent on the asynchronous check.
     *
     * @param key {String} The key for the async check.
     * @param values {Map} A map containing functions. The map keys should
     *   contain all possibilities which could be returned by the given check
     *   key. The "default" key could be used as a catch all statement.
     *   The called function will get one parameter, the result of the query.
     * @param self {var} The context which should be used when calling the
     *   method in the values map.
     */
    selectAsync : function(key, values, self) {
      this.getAsync(key, function(result) {
        var value = this.__pickFromValues(key, values);
        value.call(self, result)
      }, this);
    },


    /**
     * Internal helper which tries to pick the given key from the given values
     * map. If that key is not found, it tries to use a key named "default".
     * If there is also no default key, it prints out a warning and returns
     * undefined.
     *
     * @param key {String} The key to search for in the values.
     * @param values {Map} A map containing some keys.
     * @return {var} The value stored as values[key] usually.
     */
    __pickFromValues : function(key, values) {
      var value = values[key];
      if (values.hasOwnProperty(key)) {
        return value;
      }

      // check for piped values
      for (var id in values) {
        if (id.indexOf("|") != -1) {
          var ids = id.split("|");
          for (var i = 0; i < ids.length; i++) {
            if (ids[i] == key) {
              return values[id];
            }
          };
        }
      }

      // @deprecated since 1.4: This is only for deprecation of
      // qx.core.Variant.select

      // check for true --> on
      if (value === true && values["on"] != undefined) {
        if (qx.Bootstrap.DEBUG)
        {
          qx.Bootstrap.warn(
            "The check '" + key + "' is a boolean value. "+
            "Please change your select map from 'on' to 'true'."
          );
          qx.Bootstrap.trace(this);
        }
        return values["on"];
      }

      // check for false --> off
      if (value === false && values["off"] != undefined) {
        if (qx.Bootstrap.DEBUG)
        {
          qx.Bootstrap.warn(
            "The check '" + key + "' is a boolean value. "+
            "Please change your select map from 'off' to 'false'."
          );
          qx.Bootstrap.trace(this);
        }
        return values["off"];
      }


      if (values["default"] !== undefined) {
        return values["default"];
      }

      if (qx.Bootstrap.DEBUG)
      {
        throw new Error('No match for variant "' + key +
          '" (' + (typeof key) + ' type)' +
          ' in variants [' + qx.Bootstrap.getKeysAsString(values) +
          '] found, and no default ("default") given');
      }
    },


    /**
     * Invalidates the cache for the given key.
     *
     * @param key {String} The key of the check.
     */
    invalidateCacheKey : function(key) {
      delete this.__cache[key];
    },


    /**
     * Add a check to the environment class. If there is already a check
     * added for the given key, the add will be ignored.
     *
     * @param key {String} The key for the check e.g. html.featurexyz.
     * @param check {var} It could be either a function or a simple value.
     *   The function should be responsible for the check and should return the
     *   result of the check.
     */
    add : function(key, check) {
      // ignore already added checks.
      if (this._checks[key] == undefined) {
        // add functions directly
        if (check instanceof Function) {
          this._checks[key] = check;
        // otherwise, create a check function and use that
        } else {
          this._checks[key] = this.__createCheck(check);
        }
      }
    },


    /**
     * Adds an asynchronous check to the environment. If there is already a check
     * added for the given key, the add will be ignored.
     *
     * @param key {String} The key of the check e.g. html.featureabc
     * @param check {Function} A function which should check for a specific
     *   environment setting in an asynchronous way. The method should take two
     *   arguments. First one is the callback and the second one is the context.
     */
    addAsync : function(key, check) {
      if (this._checks[key] == undefined) {
        this._asyncChecks[key] = check;
      }
    },



    /**
     * Initializer for the default values of the framework settings.
     */
    _initDefaultQxValues : function() {
      // old settings
      this.add("qx.allowUrlSettings", function() {return false;});
      this.add("qx.allowUrlVariants", function() {return false;});
      this.add("qx.propertyDebugLevel", function() {return 0;});

      // old variants
      // make sure to reflect all changes to qx.debug here to thebootstrap class!
      this.add("qx.debug", function() {return true;});
      this.add("qx.aspects", function() {return false;});
      this.add("qx.dynlocale", function() {return true;});
      this.add("qx.mobile.emulatetouch", function() {return false;});
      this.add("qx.mobile.nativescroll", function() {return false;});

      this.add("qx.dynamicmousewheel", function() {return true;});
      this.add("qx.debug.databinding", function() {return false;});
    },


    /**
     * Import checks from global qx.$$environment into the Environment class.
     */
    __importFromGenerator : function()
    {
      // @deprecated since 1.4: import from settings map in case someone
      // added it manually
      if (window.qxsettings)
      {
        for (var key in window.qxsettings) {
          var value = window.qxsettings[key];
          if (
            key == "qx.bom.htmlarea.HtmlArea.debug" ||
            key == "qx.globalErrorHandling"
          ) {
            // normalization for "on" and "off" @deprecated since 1.4
            if (value == "on") {
              value = true;
            } else if (value == "off") {
              value = false;
            }
          }

          this._checks[key] = this.__createCheck(value);
        }
      }

      // @deprecated since 1.4: import from variants map in case someone
      // added it manually
      if (window.qxvariants)
      {
        for (var key in window.qxvariants) {
          var value = window.qxvariants[key];
          if (
            key == "qx.aspects" ||
            key == "qx.debug" ||
            key == "qx.dynlocale" ||
            key == "qx.mobile.emulatetouch" ||
            key == "qx.mobile.nativescroll"
          ) {
            // normalization for "on" and "off" @deprecated since 1.4
            if (value == "on") {
              value = true;
            } else if (value == "off") {
              value = false;
            }
          }

          this._checks[key] = this.__createCheck(value);
        }
      }

      // import the environment map
      if (qx && qx.$$environment)
      {
        for (var key in qx.$$environment) {
          var value = qx.$$environment[key];

          this._checks[key] = this.__createCheck(value);
        }
      }
    },


    /**
     * Checks the URL for environment settings and imports these into the
     * Environment class.
     */
    __importFromUrl : function() {
      if (window.document && window.document.location) {
        var urlChecks = window.document.location.search.slice(1).split("&");

        for (var i = 0; i < urlChecks.length; i++)
        {
          var check = urlChecks[i].split(":");
          if (check.length != 3 || check[0] != "qxenv") {
            continue;
          }

          var key = check[1];
          var value = decodeURIComponent(check[2]);

          // implicit type conversion
          if (value == "true") {
            value = true;
          } else if (value == "false") {
            value = false;
          } else if (/^(\d|\.)+$/.test(value)) {
            value = parseFloat(value);
          }

          this._checks[key] = this.__createCheck(value);
        }
      }
    },


    /**
     * Internal helper which creates a function retuning the given value.
     *
     * @param value {var} The value which should be returned.
     * @return {Function} A function which could be used by a test.
     */
    __createCheck : function(value) {
      return qx.Bootstrap.bind(function(value) {
        return value;
      }, null, value);
    },


    /**
     * Internal helper for the generator to flag that this block contains the
     * dependency for the given check key.
     *
     * @internal
     * @param key {String} the check key.
     * @return {Boolean} Always true
     */
    useCheck : function(key) {
      return true;
    },


    /**
     * Initializer for the checks which are available on runtime.
     */
    _initChecksMap : function() {
      // CAUTION! If you edit this function, be sure to use the following
      // pattern to asure the removal of the generator on demand.
      // if (this.useCheck("check.name")) {
      //   this._checks["check.name"] = checkFunction;
      // }
      // Also keep in mind to change the class comment to reflect the current
      // available checks.

      // /////////////////////////////////////////
      // Engine
      // /////////////////////////////////////////
      if (this.useCheck("engine.version")) {
        this._checks["engine.version"] = qx.bom.client.Engine.getVersion;
      }
      if (this.useCheck("engine.name")) {
        this._checks["engine.name"] = qx.bom.client.Engine.getName;
      }

      // /////////////////////////////////////////
      // Browser
      // /////////////////////////////////////////
      if (this.useCheck("browser.name")) {
        this._checks["browser.name"] = qx.bom.client.Browser.getName;
      }
      if (this.useCheck("browser.version")) {
        this._checks["browser.version"] = qx.bom.client.Browser.getVersion;
      }
      if (this.useCheck("browser.documentmode")) {
        this._checks["browser.documentmode"] = qx.bom.client.Browser.getDocumentMode;
      }
      if (this.useCheck("browser.quirksmode")) {
        this._checks["browser.quirksmode"] = qx.bom.client.Browser.getQuirksMode;
      }

      // /////////////////////////////////////////
      // DEVICE
      // /////////////////////////////////////////
      if (this.useCheck("device.name")) {
        this._checks["device.name"] = qx.bom.client.Device.getName;
      }

      // /////////////////////////////////////////
      // LOCALE
      // /////////////////////////////////////////
      if (this.useCheck("locale")) {
        this._checks["locale"] = qx.bom.client.Locale.getLocale;
      }

      if (this.useCheck("locale.variant")) {
        this._checks["locale.variant"] = qx.bom.client.Locale.getVariant;
      }

      // /////////////////////////////////////////
      // OPERATING SYSTEM
      // /////////////////////////////////////////
      if (this.useCheck("os.name")) {
        this._checks["os.name"] = qx.bom.client.OperatingSystem.getName;
      }
      if (this.useCheck("os.version")) {
        this._checks["os.version"] = qx.bom.client.OperatingSystem.getVersion;
      }

      // /////////////////////////////////////////
      // plugin
      // /////////////////////////////////////////
      if (this.useCheck("plugin.gears")) {
        this._checks["plugin.gears"] = qx.bom.client.Plugin.getGears;
      }

      if (this.useCheck("plugin.quicktime")) {
        this._checks["plugin.quicktime"] = qx.bom.client.Plugin.getQuicktime;
      }
      if (this.useCheck("plugin.quicktime.version")) {
        this._checks["plugin.quicktime.version"] = qx.bom.client.Plugin.getQuicktimeVersion;
      }

      if (this.useCheck("plugin.windowsmedia")) {
        this._checks["plugin.windowsmedia"] = qx.bom.client.Plugin.getWindowsMedia;
      }
      if (this.useCheck("plugin.windowsmedia.version")) {
        this._checks["plugin.windowsmedia.version"] = qx.bom.client.Plugin.getWindowsMediaVersion;
      }

      if (this.useCheck("plugin.divx")) {
        this._checks["plugin.divx"] = qx.bom.client.Plugin.getDivX;
      }
      if (this.useCheck("plugin.divx.version")) {
        this._checks["plugin.divx.version"] = qx.bom.client.Plugin.getDivXVersion;
      }

      if (this.useCheck("plugin.silverlight")) {
        this._checks["plugin.silverlight"] = qx.bom.client.Plugin.getSilverlight;
      }
      if (this.useCheck("plugin.silverlight.version")) {
        this._checks["plugin.silverlight.version"] = qx.bom.client.Plugin.getSilverlightVersion;
      }

      if (this.useCheck("plugin.flash")) {
        this._checks["plugin.flash"] = qx.bom.client.Flash.isAvailable;
      }
      if (this.useCheck("plugin.flash.version")) {
        this._checks["plugin.flash.version"] = qx.bom.client.Flash.getVersion;
      }
      if (this.useCheck("plugin.flash.express")) {
        this._checks["plugin.flash.express"] = qx.bom.client.Flash.getExpressInstall;
      }
      if (this.useCheck("plugin.flash.strictsecurity")) {
        this._checks["plugin.flash.strictsecurity"] = qx.bom.client.Flash.getStrictSecurityModel;
      }

      // /////////////////////////////////////////
      // IO
      // /////////////////////////////////////////
      if (this.useCheck("io.maxrequests")) {
        this._checks["io.maxrequests"] = qx.bom.client.Transport.getMaxConcurrentRequestCount;
      }
      if (this.useCheck("io.ssl")) {
        this._checks["io.ssl"] = qx.bom.client.Transport.getSsl;
      }
      if (this.useCheck("io.xhr")) {
        this._checks["io.xhr"] = qx.bom.client.Transport.getXmlHttpRequest;
      }

      // /////////////////////////////////////////
      // EVENTS
      // /////////////////////////////////////////
      if (this.useCheck("event.touch")) {
        this._checks["event.touch"] = qx.bom.client.Event.getTouch;
      }

      if (this.useCheck("event.pointer")) {
        this._checks["event.pointer"] = qx.bom.client.Event.getPointer;
      }

      // /////////////////////////////////////////
      // ECMA SCRIPT
      // /////////////////////////////////////////
      if (this.useCheck("ecmascript.objectcount")) {
        this._checks["ecmascript.objectcount"] =
          qx.bom.client.EcmaScript.getObjectCount;
      }

      // /////////////////////////////////////////
      // HTML
      // /////////////////////////////////////////
      if (this.useCheck("html.webworker")) {
        this._checks["html.webworker"] = qx.bom.client.Html.getWebWorker;
      }
      if (this.useCheck("html.geolocation")) {
        this._checks["html.geolocation"] = qx.bom.client.Html.getGeoLocation;
      }
      if (this.useCheck("html.audio")) {
        this._checks["html.audio"] = qx.bom.client.Html.getAudio;
      }
      if (this.useCheck("html.audio.ogg")) {
        this._checks["html.audio.ogg"] = qx.bom.client.Html.getAudioOgg;
      }
      if (this.useCheck("html.audio.mp3")) {
        this._checks["html.audio.mp3"] = qx.bom.client.Html.getAudioMp3;
      }
      if (this.useCheck("html.audio.wav")) {
        this._checks["html.audio.wav"] = qx.bom.client.Html.getAudioWav;
      }
      if (this.useCheck("html.audio.au")) {
        this._checks["html.audio.au"] = qx.bom.client.Html.getAudioAu;
      }
      if (this.useCheck("html.audio.aif")) {
        this._checks["html.audio.aif"] = qx.bom.client.Html.getAudioAif;
      }
      if (this.useCheck("html.video")) {
        this._checks["html.video"] = qx.bom.client.Html.getVideo;
      }
      if (this.useCheck("html.video.ogg")) {
        this._checks["html.video.ogg"] = qx.bom.client.Html.getVideoOgg;
      }
      if (this.useCheck("html.video.h264")) {
        this._checks["html.video.h264"] = qx.bom.client.Html.getVideoH264;
      }
      if (this.useCheck("html.video.webm")) {
        this._checks["html.video.webm"] = qx.bom.client.Html.getVideoWebm;
      }
      if (this.useCheck("html.storage.local")) {
        this._checks["html.storage.local"] = qx.bom.client.Html.getLocalStorage;
      }
      if (this.useCheck("html.storage.session")) {
        this._checks["html.storage.session"] = qx.bom.client.Html.getSessionStorage;
      }
      if (this.useCheck("html.classlist")) {
        this._checks["html.classlist"] = qx.bom.client.Html.getClassList;
      }

      if (this.useCheck("html.xpath")) {
        this._checks["html.xpath"] = qx.bom.client.Html.getXPath;
      }
      if (this.useCheck("html.xul")) {
        this._checks["html.xul"] = qx.bom.client.Html.getXul;
      }

      if (this.useCheck("html.canvas")) {
        this._checks["html.canvas"] = qx.bom.client.Html.getCanvas;
      }
      if (this.useCheck("html.svg")) {
        this._checks["html.svg"] = qx.bom.client.Html.getSvg;
      }
      if (this.useCheck("html.vml")) {
        this._checks["html.vml"] = qx.bom.client.Html.getVml;
      }
      if (this.useCheck("html.dataurl")) {
        this._asyncChecks["html.dataurl"] = qx.bom.client.Html.getDataUrl;
      }

      // /////////////////////////////////////////
      // CSS
      // /////////////////////////////////////////
      if (this.useCheck("css.textoverflow")) {
        this._checks["css.textoverflow"] = qx.bom.client.Css.getTextOverflow;
      }

      if (this.useCheck("css.placeholder")) {
        this._checks["css.placeholder"] = qx.bom.client.Css.getPlaceholder;
      }

      if (this.useCheck("css.borderradius")) {
        this._checks["css.borderradius"] = qx.bom.client.Css.getBorderRadius;
      }

      if (this.useCheck("css.boxshadow")) {
        this._checks["css.boxshadow"] = qx.bom.client.Css.getBoxShadow;
      }

      if (this.useCheck("css.gradients")) {
        this._checks["css.gradients"] = qx.bom.client.Css.getGradients;
      }

      if (this.useCheck("css.boxmodel")) {
        this._checks["css.boxmodel"] = qx.bom.client.Css.getBoxModel;
      }

      if (this.useCheck("css.translate3d")) {
        this._checks["css.translate3d"] = qx.bom.client.Css.getTranslate3d;
      }

      // /////////////////////////////////////////
      // PHONEGAP
      // /////////////////////////////////////////
      if (this.useCheck("phonegap")) {
        this._checks["phonegap"] = qx.bom.client.PhoneGap.getPhoneGap;
      }

      if (this.useCheck("phonegap.notification")) {
        this._checks["phonegap.notification"] = qx.bom.client.PhoneGap.getNotification;
      }
    }
  },


  defer : function(statics) {
    // create default values for the environment class
    statics._initDefaultQxValues();
    // first initialize the defined checks
    statics._initChecksMap();
    // load the checks from the generator
    statics.__importFromGenerator();
    // load the checks from the url
    if (statics.get("qx.allowUrlSettings") != true) {
      statics.__importFromUrl();
    }
  }
});
