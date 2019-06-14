/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2005-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class is the single point to access all settings that may be different
 * in different environments. This contains e.g. the browser name, engine
 * version but also qooxdoo or application specific settings.
 *
 * Its public API can be found in its four main methods. One pair of methods
 * is used to check the synchronous values of the environment. The other pair
 * of methods is used for asynchronous checks.
 *
 * The most often used method should be {@link #get}, which returns the
 * current value for a given environment check.
 *
 * All qooxdoo settings can be changed via the generator's config. See the manual
 * for more details about the environment key in the config. As you can see
 * from the methods API, there is no way to override an existing key. So if you
 * need to change a qooxdoo setting, you have to use the generator to do so.
 *
 * The generator is also responsible for requiring the necessary implementation
 * classes for each check. When using a check of a new category, make sure to
 * rebuild you application and let the generator include the necessary files.
 *
 * The following table shows the available checks. If you are
 * interested in more details, check the reference to the implementation of
 * each check. Please do not use those check implementations directly, as the
 * Environment class comes with a smart caching feature.
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
 *       <td>browser.documentmode</td><td><i>Integer</i></td><td><code>0</code></td>
 *       <td>{@link qx.bom.client.Browser#getDocumentMode}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.name</td><td><i>String</i></td><td><code> chrome </code></td>
 *       <td>{@link qx.bom.client.Browser#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.quirksmode</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Browser#getQuirksMode}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.version</td><td><i>String</i></td><td><code>11.0</code></td>
 *       <td>{@link qx.bom.client.Browser#getVersion}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>runtime</b></td>
 *     </tr>
 *     <tr>
 *       <td>runtime.name</td><td><i> String </i></td><td><code> node.js </code></td>
 *       <td>{@link qx.bom.client.Runtime#getName}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>css</b></td>
 *     </tr>
 *     <tr>
 *       <td>css.borderradius</td><td><i>String</i> or <i>null</i></td><td><code>borderRadius</code></td>
 *       <td>{@link qx.bom.client.Css#getBorderRadius}</td>
 *     </tr>
 *     <tr>
 *       <td>css.borderimage</td><td><i>String</i> or <i>null</i></td><td><code>WebkitBorderImage</code></td>
 *       <td>{@link qx.bom.client.Css#getBorderImage}</td>
 *     </tr>
 *     <tr>
 *       <td>css.borderimage.standardsyntax</td><td><i>Boolean</i> or <i>null</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getBorderImageSyntax}</td>
 *     </tr>
 *     <tr>
 *       <td>css.boxmodel</td><td><i>String</i></td><td><code>content</code></td>
 *       <td>{@link qx.bom.client.Css#getBoxModel}</td>
 *     </tr>
 *     <tr>
 *       <td>css.boxshadow</td><td><i>String</i> or <i>null</i></td><td><code>boxShadow</code></td>
 *       <td>{@link qx.bom.client.Css#getBoxShadow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.gradient.linear</td><td><i>String</i> or <i>null</i></td><td><code>-moz-linear-gradient</code></td>
 *       <td>{@link qx.bom.client.Css#getLinearGradient}</td>
 *     </tr>
 *     <tr>
 *       <td>css.gradient.filter</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getFilterGradient}</td>
 *     </tr>
 *     <tr>
 *       <td>css.gradient.radial</td><td><i>String</i> or <i>null</i></td><td><code>-moz-radial-gradient</code></td>
 *       <td>{@link qx.bom.client.Css#getRadialGradient}</td>
 *     </tr>
 *     <tr>
 *       <td>css.gradient.legacywebkit</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Css#getLegacyWebkitGradient}</td>
 *     </tr>
 *     <tr>
 *       <td>css.placeholder</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getPlaceholder}</td>
 *     </tr>
 *     <tr>
 *       <td>css.textoverflow</td><td><i>String</i> or <i>null</i></td><td><code>textOverflow</code></td>
 *       <td>{@link qx.bom.client.Css#getTextOverflow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.rgba</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getRgba}</td>
 *     </tr>
 *     <tr>
 *       <td>css.usermodify</td><td><i>String</i> or <i>null</i></td><td><code>WebkitUserModify</code></td>
 *       <td>{@link qx.bom.client.Css#getUserModify}</td>
 *     </tr>
 *     <tr>
 *       <td>css.appearance</td><td><i>String</i> or <i>null</i></td><td><code>WebkitAppearance</code></td>
 *       <td>{@link qx.bom.client.Css#getAppearance}</td>
 *     </tr>
 *     <tr>
 *       <td>css.float</td><td><i>String</i> or <i>null</i></td><td><code>cssFloat</code></td>
 *       <td>{@link qx.bom.client.Css#getFloat}</td>
 *     </tr>
 *     <tr>
 *       <td>css.userselect</td><td><i>String</i> or <i>null</i></td><td><code>WebkitUserSelect</code></td>
 *       <td>{@link qx.bom.client.Css#getUserSelect}</td>
 *     </tr>
 *     <tr>
 *       <td>css.userselect.none</td><td><i>String</i> or <i>null</i></td><td><code>-moz-none</code></td>
 *       <td>{@link qx.bom.client.Css#getUserSelectNone}</td>
 *     </tr>
 *     <tr>
 *       <td>css.boxsizing</td><td><i>String</i> or <i>null</i></td><td><code>boxSizing</code></td>
 *       <td>{@link qx.bom.client.Css#getBoxSizing}</td>
 *     </tr>
 *     <tr>
 *       <td>css.animation</td><td><i>Object</i> or <i>null</i></td><td><code>{end-event: "webkitAnimationEnd", keyframes: "@-webkit-keyframes", play-state: null, name: "WebkitAnimation"}</code></td>
 *       <td>{@link qx.bom.client.CssAnimation#getSupport}</td>
 *     </tr>
 *     <tr>
 *       <td>css.animation.requestframe</td><td><i>String</i> or <i>null</i></td><td><code>mozRequestAnimationFrame</code></td>
 *       <td>{@link qx.bom.client.CssAnimation#getRequestAnimationFrame}</td>
 *     </tr>
 *     <tr>
 *       <td>css.transform</td><td><i>Object</i> or <i>null</i></td><td><code>{3d: true, origin: "WebkitTransformOrigin", name: "WebkitTransform", style: "WebkitTransformStyle", perspective: "WebkitPerspective", perspective-origin: "WebkitPerspectiveOrigin", backface-visibility: "WebkitBackfaceVisibility"}</code></td>
 *       <td>{@link qx.bom.client.CssTransform#getSupport}</td>
 *     </tr>
 *     <tr>
 *       <td>css.transform.3d</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.CssTransform#get3D}</td>
 *     </tr>
 *     <tr>
 *       <td>css.transition</td><td><i>Object</i> or <i>null</i></td><td><code>{end-event: "webkitTransitionEnd", name: "WebkitTransition"}</code></td>
 *       <td>{@link qx.bom.client.CssTransition#getSupport}</td>
 *     </tr>
 *     <tr>
 *       <td>css.inlineblock</td><td><i>String</i> or <i>null</i></td><td><code>inline-block</code></td>
 *       <td>{@link qx.bom.client.Css#getInlineBlock}</td>
 *     </tr>
 *     <tr>
 *       <td>css.opacity</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getOpacity}</td>
 *     </tr>
 *     <tr>
 *       <td>css.textShadow</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getTextShadow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.textShadow.filter</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getFilterTextShadow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.alphaimageloaderneeded</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Css#getAlphaImageLoaderNeeded}</td>
 *     </tr>
 *     <tr>
 *       <td>css.pointerevents</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getPointerEvents}</td>
 *     </tr>
 *     <tr>
 *       <td>css.flexboxSyntax</td><td><i>String</i> or <i>null</i></td><td><code>"flex"</code></td>
 *       <td>{@link qx.bom.client.Css#getFlexboxSyntax}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>device</b></td>
 *     </tr>
 *     <tr>
 *       <td>device.name</td><td><i>String</i></td><td><code>pc</code></td>
 *       <td>{@link qx.bom.client.Device#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>device.type</td><td><i>String</i></td><td><code>mobile</code></td>
 *       <td>{@link qx.bom.client.Device#getType}</td>
 *     </tr>
 *     <tr>
 *       <td>device.pixelRatio</td><td><i>Number</i></td><td><code>2</code></td>
 *       <td>{@link qx.bom.client.Device#getDevicePixelRatio}</td>
 *     </tr>
 *     <tr>
 *       <td>device.touch</td><td><i>String</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Device#getTouch}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>ecmascript</b></td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.error.stacktrace</td><td><i>String</i> or <i>null</i></td><td><code>stack</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getStackTrace}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.mutationobserver</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getMutationObserver}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.indexof<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayIndexOf}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.lastindexof<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayLastIndexOf}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.foreach<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayForEach}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.filter<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayFilter}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.map<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayMap}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.some<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArraySome}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.find<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayFind}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.findIndex<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayFindIndex}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.every<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayEvery}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.reduce<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayReduce}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.reduceright<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayReduceRight}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.function.bind<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getFunctionBind}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.object.keys<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getObjectKeys}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.date.now<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getDateNow}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.date.parse<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getDateParse}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.error.toString</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getErrorToString}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.string.trim</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getStringTrim}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.string.startsWith</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getStringStartsWith}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.string.endsWith</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getStringEndsWith}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>engine</b></td>
 *     </tr>
 *     <tr>
 *       <td>engine.name</td><td><i>String</i></td><td><code>webkit</code></td>
 *       <td>{@link qx.bom.client.Engine#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>engine.version</td><td><i>String</i></td><td><code>534.24</code></td>
 *       <td>{@link qx.bom.client.Engine#getVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>event</b></td>
 *     </tr>
 *      <tr>
 *       <td>event.mspointer</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getMsPointer}</td>
 *     </tr>
 *     <tr>
 *       <td>event.touch</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Event#getTouch}</td>
 *     </tr>
 *     <tr>
 *       <td>event.help</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Event#getHelp}</td>
 *     </tr>
 *     <tr>
 *       <td>event.hashchange</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getHashChange}</td>
 *     </tr>
 *     <tr>
 *       <td>event.dispatchevent</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getDispatchEvent}</td>
 *     </tr>
 *     <tr>
 *       <td>event.customevent</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getCustomEvent}</td>
 *     </tr>
 *     <tr>
 *       <td>event.mouseevent</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getMouseEvent}</td>
 *     </tr>
 *     <tr>
 *       <td>event.mousecreateevent</td><td><i>String</i></td><td><code>UIEvents</code></td>
 *       <td>{@link qx.bom.client.Event#getMouseCreateEvent}</td>
 *     </tr>
 *     <tr>
 *       <td>event.mousewheel</td><td><i>Map</i></td><td><code>{type: "wheel", target: window}</code></td>
 *       <td>{@link qx.bom.client.Event#getMouseWheel}</td>
 *     </tr>
 *     <tr>
 *       <td>event.auxclick</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getAuxclickEvent}</td>
 *     </tr>
 *     <tr>
 *       <td>event.passive</td><td><i>Map</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getPassive}</td>
 *     </tr>
 *
 *     <tr>
 *       <td colspan="4"><b>html</b></td>
 *     </tr>
 *     <tr>
 *       <td>html.audio</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getAudio}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.mp3</td><td><i>String</i></td><td><code>""</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioMp3}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.ogg</td><td><i>String</i></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioOgg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.wav</td><td><i>String</i></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioWav}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.au</td><td><i>String</i></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioAu}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.aif</td><td><i>String</i></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioAif}</td>
 *     </tr>
 *     <tr>
 *       <td>html.canvas</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getCanvas}</td>
 *     </tr>
 *     <tr>
 *       <td>html.classlist</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getClassList}</td>
 *     </tr>
 *     <tr>
 *       <td>html.fullscreen</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getFullScreen}</td>
 *     </tr>
 *     <tr>
 *       <td>html.geolocation</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getGeoLocation}</td>
 *     </tr>
 *     <tr>
 *       <td>html.storage.local</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getLocalStorage}</td>
 *     </tr>
 *     <tr>
 *       <td>html.storage.session</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getSessionStorage}</td>
 *     </tr>
 *     <tr>
 *       <td>html.storage.userdata</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getUserDataStorage}</td>
 *     </tr>
 *     <tr>
 *       <td>html.svg</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getSvg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getVideo}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.h264</td><td><i>String</i></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoH264}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.ogg</td><td><i>String</i></td><td><code>""</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoOgg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.webm</td><td><i>String</i></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoWebm}</td>
 *     </tr>
 *     <tr>
 *       <td>html.vml</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Html#getVml}</td>
 *     </tr>
 *     <tr>
 *       <td>html.webworker</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getWebWorker}</td>
 *     <tr>
 *       <td>html.filereader</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getFileReader}</td>
 *     </tr>
 *     <tr>
 *       <td>html.xpath</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getXPath}</td>
 *     </tr>
 *     <tr>
 *       <td>html.xul</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getXul}</td>
 *     </tr>
 *     <tr>
 *       <td>html.console</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getConsole}</td>
 *     </tr>
 *     <tr>
 *       <td>html.element.contains</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getContains}</td>
 *     </tr>
 *     <tr>
 *       <td>html.element.compareDocumentPosition</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getCompareDocumentPosition}</td>
 *     </tr>
 *     <tr>
 *       <td>html.element.textContent</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getTextContent}</td>
 *     </tr>
 *     <tr>
 *       <td>html.image.naturaldimensions</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getNaturalDimensions}</td>
 *     </tr>
 *     <tr>
 *       <td>html.history.state</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getHistoryState}</td>
 *     </tr>
 *     <tr>
 *       <td>html.selection</td><td><i>String</i></td><td><code>getSelection</code></td>
 *       <td>{@link qx.bom.client.Html#getSelection}</td>
 *     </tr>
 *     <tr>
 *       <td>html.node.isequalnode</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getIsEqualNode}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>XML</b></td>
 *     </tr>
 *     <tr>
 *       <td>xml.implementation</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Xml#getImplementation}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.domparser</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Xml#getDomParser}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.selectsinglenode</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Xml#getSelectSingleNode}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.selectnodes</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Xml#getSelectNodes}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.getelementsbytagnamens</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Xml#getElementsByTagNameNS}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.domproperties</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Xml#getDomProperties}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.attributens</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Xml#getAttributeNS}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.createelementns</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Xml#getCreateElementNS}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.createnode</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Xml#getCreateNode}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.getqualifieditem</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Xml#getQualifiedItem}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>Stylesheets</b></td>
 *     </tr>
 *     <tr>
 *       <td>html.stylesheet.createstylesheet</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Stylesheet#getCreateStyleSheet}</td>
 *     </tr>
 *     <tr>
 *       <td>html.stylesheet.insertrule</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Stylesheet#getInsertRule}</td>
 *     </tr>
 *     <tr>
 *       <td>html.stylesheet.deleterule</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Stylesheet#getDeleteRule}</td>
 *     </tr>
 *     <tr>
 *       <td>html.stylesheet.addimport</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Stylesheet#getAddImport}</td>
 *     </tr>
 *     <tr>
 *       <td>html.stylesheet.removeimport</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Stylesheet#getRemoveImport}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>io</b></td>
 *     </tr>
 *     <tr>
 *       <td>io.maxrequests</td><td><i>Integer</i></td><td><code>4</code></td>
 *       <td>{@link qx.bom.client.Transport#getMaxConcurrentRequestCount}</td>
 *     </tr>
 *     <tr>
 *       <td>io.ssl</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Transport#getSsl}</td>
 *     </tr>
 *     <tr>
 *       <td>io.xhr</td><td><i>String</i></td><td><code>xhr</code></td>
 *       <td>{@link qx.bom.client.Transport#getXmlHttpRequest}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>locale</b></td>
 *     </tr>
 *     <tr>
 *       <td>locale</td><td><i>String</i></td><td><code>de</code></td>
 *       <td>{@link qx.bom.client.Locale#getLocale}</td>
 *     </tr>
 *     <tr>
 *       <td>locale.variant</td><td><i>String</i></td><td><code>de</code></td>
 *       <td>{@link qx.bom.client.Locale#getVariant}</td>
 *     </tr>
 *     <tr>
 *       <td>locale.default</td><td><i>String</i></td><td><code>C</code></td>
 *       <td>default locale C as in good tradition of unix {@link qx.bom.client.Locale}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>os</b></td>
 *     </tr>
 *     <tr>
 *       <td>os.name</td><td><i>String</i></td><td><code>osx</code></td>
 *       <td>{@link qx.bom.client.OperatingSystem#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>os.version</td><td><i>String</i></td><td><code>10.6</code></td>
 *       <td>{@link qx.bom.client.OperatingSystem#getVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>os.scrollBarOverlayed</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Scroll#scrollBarOverlayed}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>phonegap</b></td>
 *     </tr>
 *     <tr>
 *       <td>phonegap</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.PhoneGap#getPhoneGap}</td>
 *     </tr>
 *     <tr>
 *       <td>phonegap.notification</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.PhoneGap#getNotification}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>plugin</b></td>
 *     </tr>
 *     <tr>
 *       <td>plugin.divx</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getDivX}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.divx.version</td><td><i>String</i></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getDivXVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#isAvailable}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.express</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#getExpressInstall}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.strictsecurity</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#getStrictSecurityModel}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.version</td><td><i>String</i></td><td><code>10.2.154</code></td>
 *       <td>{@link qx.bom.client.Flash#getVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.gears</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getGears}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.activex</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getActiveX}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.skype</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getSkype}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.pdf</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getPdf}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.pdf.version</td><td><i>String</i></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getPdfVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.quicktime</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Plugin#getQuicktime}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.quicktime.version</td><td><i>String</i></td><td><code>7.6</code></td>
 *       <td>{@link qx.bom.client.Plugin#getQuicktimeVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.silverlight</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getSilverlight}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.silverlight.version</td><td><i>String</i></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getSilverlightVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.windowsmedia</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getWindowsMedia}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.windowsmedia.version</td><td><i>String</i></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getWindowsMediaVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>qx</b></td>
 *     </tr>
 *     <tr>
 *       <td>qx.allowUrlSettings</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.allowUrlVariants</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.application</td><td><i>String</i></td><td><code>name.space</code></td>
 *       <td><i>default:</i> <code>&lt;&lt;application name&gt;&gt;</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.aspects</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.databinding</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.dispose</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.dispose.level</td><td><i>Integer</i></td><td><code>0</code></td>
 *       <td><i>default:</i> <code>0</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.io</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *     <tr>
 *       <td>qx.debug.io.remote</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *     <tr>
 *       <td>qx.debug.io.remote.data</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.property.level</td><td><i>Integer</i></td><td><code>0</code></td>
 *       <td><i>default:</i> <code>0</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.ui.queue</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.dynlocale</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.dyntheme</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.globalErrorHandling</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code> {@link qx.event.GlobalError}</td>
 *     </tr>
 *     <tr>
 *       <td>qx.mobile.nativescroll</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Scroll#getNativeScroll}</td>
 *     </tr>
 *     <tr>
 *       <td>qx.promise.warnings</td><td><i>Boolean</i></td><td>same as <code>qx.debug</code></td>
 *       <td>true to enable runtime warnings in promises {@link qx.Promise}</td>
 *     </tr>
 *     <tr>
 *       <td>qx.promise.longStackTraces</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>true to enable long stack traces in promises; this has a performance penalty but makes debugging asynchronous functions easier {@link qx.Promise}</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.basecalls</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresponding <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.comments</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresponding <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.privates</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresponding <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.strings</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresponding <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.variables</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresponding <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.variants</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresponding <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.revision</td><td><i>String</i></td><td><code>27348</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.theme</td><td><i>String</i></td><td><code>qx.theme.Modern</code></td>
 *       <td><i>default:</i> <code>&lt;&lt;initial theme name&gt;&gt;</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.version</td><td><i>String</i></td><td><code>${qxversion}</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.blankpage</td><td><i>String</i></td><td><code>URI to blank.html page</code></td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>module</b></td>
 *     </tr>
 *     <tr>
 *       <td>module.databinding</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>module.logger</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>module.property</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>module.events</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>module.objectid</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><h3>Asynchronous checks</h3>
 *       </td>
 *     </tr>
 *     <tr>
 *       <td>html.dataurl</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getDataUrl}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.pdfjs</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Pdfjs#getPdfjs}</td>
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
     * Internal map for environment keys to check methods.
     * Gets populated dynamically at runtime.
     */
    _checksMap: {},

    _defaults: {
      // an always-true key (e.g. for use in qx.core.Environment.filter() calls)
      "true": true,
      // old settings retTrue
      "qx.allowUrlSettings": false,
      "qx.allowUrlVariants": false,
      "qx.debug.property.level": 0,
      // old variants
      // make sure to reflect all changes to qx.debug here in the bootstrap class!
      "qx.debug": true,
      "qx.debug.ui.queue": true,
      "qx.debug.touchpad.detection": false,
      "qx.aspects": false,
      "qx.dynlocale": true,
      "qx.dyntheme": true,
      "qx.blankpage": "qx/static/blank.html",
      "qx.debug.databinding": false,
      "qx.debug.dispose": false,
      // generator optimization vectors
      "qx.optimization.basecalls": false,
      "qx.optimization.comments": false,
      "qx.optimization.privates": false,
      "qx.optimization.strings": false,
      "qx.optimization.variables": false,
      "qx.optimization.variants": false,
      // qooxdoo modules
      "module.databinding": true,
      "module.logger": true,
      "module.property": true,
      "module.events": true,
      "module.objectid": true,
      "qx.nativeScrollBars": false,
      "qx.automaticMemoryManagement": true,
      "qx.promise": true,
      "qx.promise.warnings": true,
      "qx.promise.longStackTraces": true
    },

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
     * @return {var} The stored value depending on the given key.
     *   (Details in the class doc)
     */
    get : function(key) {
      // check the cache
      if (this.__cache[key] != undefined) {
        return this.__cache[key];
      }

      // search for a matching check
      var check = this._checks[key];
      if (check) {
        // execute the check and write the result in the cache
        var value = check();
        this.__cache[key] = value;
        return value;
      }

      // try class lookup
      var classAndMethod = this._getClassNameFromEnvKey(key);
      if (classAndMethod[0] != undefined) {
        var clazz = classAndMethod[0];
        var method= classAndMethod[1];
        var value = clazz[method]();  // call the check method
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
     * Maps an environment key to a check class and method name.
     *
     * @param key {String} The name of the check you want to query.
     * @return {Array} [className, methodName] of
     *  the corresponding implementation.
     */
    _getClassNameFromEnvKey : function (key) {

      var envmappings = this._checksMap;
      if (envmappings[key] != undefined) {
        var implementation = envmappings[key];
        // separate class from method
        var lastdot = implementation.lastIndexOf(".");
        if (lastdot > -1) {
          var classname = implementation.slice(0,lastdot);
          var methodname= implementation.slice(lastdot+1);
          var clazz = qx.Bootstrap.getByName(classname);
          if (clazz != undefined) {
            return [clazz, methodname];
          }
        }
      }
      return [undefined, undefined];
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

      // try class lookup
      var classAndMethod = this._getClassNameFromEnvKey(key);
      if (classAndMethod[0] != undefined) {
        var clazz = classAndMethod[0];
        var method= classAndMethod[1];
        clazz[method](function(result) {  // call the check method
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
        value.call(self, result);
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

      if (values["default"] !== undefined) {
        return values["default"];
      }

      if (qx.Bootstrap.DEBUG)
      {
        throw new Error('No match for variant "' + key +
          '" (' + (typeof key) + ' type)' +
          ' in variants [' + qx.Bootstrap.keys(values) +
          '] found, and no default ("default") given');
      }
    },


    /**
     * Takes a given map containing the check names as keys and converts
     * the map to an array only containing the values for check evaluating
     * to <code>true</code>. This is especially handy for conditional
     * includes of mixins.
     * @param map {Map} A map containing check names as keys and values.
     * @return {Array} An array containing the values.
     */
    filter : function(map) {
      var returnArray = [];

      for (var check in map) {
        if (this.get(check)) {
          returnArray.push(map[check]);
        }
      }

      return returnArray;
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
          if (!this._checksMap[key] && check.displayName) {
            this._checksMap[key] = check.displayName.substr(0, check.displayName.length - 2);
          }
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
     * Returns all currently defined synchronous checks.
     *
     * @internal
     * @return {Map} The map of synchronous checks
     */
    getChecks : function()
    {
      return this._checks;
    },


    /**
     * Returns all currently defined asynchronous checks.
     *
     * @internal
     * @return {Map} The map of asynchronous checks
     */
    getAsyncChecks : function()
    {
      return this._asyncChecks;
    },


    /**
     * Initializer for the default values of the framework settings.
     */
    _initDefaultQxValues : function() {
      var createFuncReturning = function(val) {
        return function() { return val; };
      };

      for (var prop in this._defaults) {
        this.add(prop, createFuncReturning(this._defaults[prop]));
      }
    },


    /**
     * Import checks from global qx.$$environment into the Environment class.
     */
    __importFromGenerator : function()
    {
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
     * Internal helper which creates a function returning the given value.
     *
     * @param value {var} The value which should be returned.
     * @return {Function} A function which could be used by a test.
     */
    __createCheck : function(value) {
      return qx.Bootstrap.bind(function(value) {
        return value;
      }, null, value);
    }
  },


  defer : function(statics) {
    // create default values for the environment class
    statics._initDefaultQxValues();
    // load the checks from the generator
    statics.__importFromGenerator();
    // load the checks from the url
    if (statics.get("qx.allowUrlSettings") === true) {
      statics.__importFromUrl();
    }
  }
});
