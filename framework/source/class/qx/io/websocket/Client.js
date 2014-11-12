/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Stefan Andersson (sand)

************************************************************************ */

/**
 * A class to create a WebSocket client.
 */
qx.Class.define("qx.io.websocket.Client",
{
  extend: qx.core.Object,

  statics :
  {
    /**
     * this.__socket.readyState - Ready state constants
     * These constants are used by the readyState attribute to describe the state of the WebSocket connection.
     */
    // The connection is not yet open.
    CONNECTING : 0,
    // The connection is open and ready to communicate.
    OPEN : 1,
    // The connection is in the process of closing.
    CLOSING : 2,
    // The connection is closed or couldn't be opened.
    CLOSED : 3
  },


  construct: function(url, protocol)
  {
    this.base(arguments);
  },


  events :
  {
    /**
     * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
     * this indicates that the connection is ready to send and receive data. The event is a simple
     * one with the name "open".
     */
    "onopen" : "qx.event.type.Event",

    /**
     * An event listener to be called when the WebSocket connection's readyState changes to CLOSED.
     * The listener receives a CloseEvent named "close".
     *
     * code 	unsigned long 	The WebSocket connection close code provided by the server. See Close codes for possible values.
     * reason 	DOMString 	A string indicating the reason the server closed the connection.
     *                          This is specific to the particular server and sub-protocol.
     * wasClean boolean 	Indicates whether or not the connection was cleanly closed.
     *
     * Status code 	Name 	Description
     * 0-999 	  	Reserved and not used.
     * 1000 	CLOSE_NORMAL 	Normal closure; the connection successfully completed whatever purpose for which it was created.
     * 1001 	CLOSE_GOING_AWAY 	The endpoint is going away, either because of a server failure or because the browser is navigating away from the page that opened the connection.
     * 1002 	CLOSE_PROTOCOL_ERROR 	The endpoint is terminating the connection due to a protocol error.
     * 1003 	CLOSE_UNSUPPORTED 	The connection is being terminated because the endpoint received data of a type it cannot accept (for example, a text-only endpoint received binary data).
     * 1004 	  	Reserved. A meaning might be defined in the future.
     * 1005 	CLOSE_NO_STATUS 	Reserved.  Indicates that no status code was provided even though one was expected.
     * 1006 	CLOSE_ABNORMAL 	Reserved. Used to indicate that a connection was closed abnormally (that is, with no close frame being sent) when a status code is expected.
     * 1007 	  	The endpoint is terminating the connection because a message was received that contained inconsistent data (e.g., non-UTF-8 data within a text message).
     * 1008 	  	The endpoint is terminating the connection because it received a message that violates its policy. This is a generic status code, used when codes 1003 and 1009 are not suitable.
     * 1009 	CLOSE_TOO_LARGE 	The endpoint is terminating the connection because a data frame was received that is too large.
     * 1010 	  	The client is terminating the connection because it expected the server to negotiate one or more extension, but the server didn't.
     * 1011 	  	The server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.
     * 1012-1014 	  	Reserved for future use by the WebSocket standard.
     * 1015 	  	Reserved. Indicates that the connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).
     * 1016-1999 	  	Reserved for future use by the WebSocket standard.
     * 2000-2999 	  	Reserved for use by WebSocket extensions.
     * 3000-3999 	  	Available for use by libraries and frameworks. May not be used by applications.
     * 4000-4999 	  	Available for use by applications.
     */
    "onclose" : "qx.event.type.Event",

    /**
     * An event listener to be called when a message is received from the server. The listener
     * receives a MessageEvent named "message".
     *
     * Text received over a WebSocket connection is in UTF-8 format.
     *
     * Prior to Gecko 9.0 (Firefox 9.0 / Thunderbird 9.0 / SeaMonkey 2.6), certain non-characters
     * in otherwise valid UTF-8 text would cause the connection to be terminated. Now Gecko permits
     * these values.
     */
    "onmessage" : "qx.event.type.Event",

    /**
     * An event listener to be called when an error occurs. This is a simple event named "error".
     */
    "onerror" : "qx.event.type.Event"
  },

  members :
  {
    __url : null,
    __protocols : null,

    __socket : undefined,

    /**
     *
     * Starting in Gecko 6.0, the constructor is prefixed; you will need to use MozWebSocket().
     *
     * @param url {String} The URL to which to connect; this should be the URL to which the WebSocket server will respond.
     *                     Schema [ws | wss]:
     *                     Host   localhost
     *                     Port   number
     *                     Server ...
     * @param protocols Optional {String|Array?} Either a single protocol string or an array of protocol strings. These
     *                                           strings are used to indicate sub-protocols, so that a single server can
     *                                           implement multiple WebSocket sub-protocols (for example, you might want
     *                                           one server to be able to handle different types of interactions depending
     *                                           on the specified protocol). If you don't specify a protocol string, an empty
     *                                           string is assumed. It is specified in the protocols parameter when creating
     *                                           the WebSocket object.
     *                                           f.i ["json","soap"]
     */
    connect : function(url, protocol)
    {
      if(qx.core.Environment.get("io.websocket"))
      {
        var readyState = this.getReadyState();
/*
    if (conn.readyState !== 1) {
      conn.close();
      setTimeout(function () {
        openConnection();
      }, 250);
    }
*/
        if (readyState === undefined || readyState > 1)
        {
          try
          {
            // The URL is always absolute and read only.
            this.__socket = new WebSocket(url, protocol);
          }
          catch(err)
          {
            // throw SECURITY_ERR
            this.err("The port to which the connection is being attempted is being blocked.");
          }
        }
      }
    },

    /**
     * The close method would be used to terminate any existing connection.
     *
     * It may be helpful to examine the socket's bufferedAmount attribute before attempting to
     * close the connection to determine if any data has yet to be transmitted on the network.
     *
     * When closing an established connection (e.g., when sending a Close
     * frame, after the opening handshake has completed), an endpoint MAY
     * indicate a reason for closure.  The interpretation of this reason by
     * an endpoint, and the action an endpoint should take given this
     * reason, are left undefined by this specification.  This specification
     * defines a set of pre-defined status codes and specifies which ranges
     * may be used by extensions, frameworks, and end applications.  The
     * status code and any associated textual message are optional
     * components of a Close frame.
     *
     * Endpoints MAY use the following pre-defined status codes when sending
     * a Close frame.
     *
     * 1000 indicates a normal closure, meaning that the purpose for
     *      which the connection was established has been fulfilled.
     *
     * 1001 indicates that an endpoint is "going away", such as a server
     *      going down or a browser having navigated away from a page.
     *
     * 1002 indicates that an endpoint is terminating the connection due
     *      to a protocol error.
     *
     * 1003 indicates that an endpoint is terminating the connection
     *      because it has received a type of data it cannot accept (e.g., an
     *      endpoint that understands only text data MAY send this if it
     *      receives a binary message).
     *
     * @param code {Number?} A numeric value indicating the status code explaining why the connection
     *                       is being closed. If this parameter is not specified, a default value of
     *                       1000 (indicating a normal "transaction complete" closure) is assumed.
     * @param reason {String?} A human-readable string explaining why the connection is closing. This
     *                         string must be no longer than 123 bytes of UTF-8 text (not characters).
     */
    close : function(code, reason)
    {
      this.err(code + reason);

      if(this.getBufferedAmount() == 0)
      {
        try
        {
          // In Gecko, this method didn't support any parameters prior to Gecko 8.0
          // (Firefox 8.0 / Thunderbird 8.0 / SeaMonkey 2.5).
          this.__socket.close(code, reason);
        }
        catch(err)
        {
          // An invalid code was specified.
          if(err == INVALID_ACCESS_ERR)
          {
          }
          // The reason string is too long or contains unpaired surrogates.
          else if(err == SYNTAX_ERR)
          {
          }
        }
      }
      else
      {
        this.err("Can not close socket as there is untransmitted data in buffer.");
      }
    },

    /**
     * The readonly attribute bufferedAmount represents the number of bytes of UTF-8 text that have been queued usin
     * send() method.
     *
     * @return {Number} The number of bytes of data that have been queued using calls to send() but not yet transmitted
     *                  to the network. This value does not reset to zero when the connection is closed; if you keep
     *                  calling send(), this will continue to climb. Read only.
     */
    getBufferedAmount : function()
    {
      return this.__socket.bufferedAmount;
    },

    /**
     * The current state of the connection; this is one of the Ready state constants. Read only.
     *
     * @return {Integer}
     */
    getReadyState : function()
    {
      return this.__socket.readyState;
    },

    /**
     * The extensions selected by the server. This is currently only the empty string or a list of extensions
     * as negotiated by the connection.
     *
     * The extensions attribute was not supported in Gecko until Gecko 8.0.
     *
     * @return {String} 
     */
    getExtensions : function()
    {
      return this.__socket.extensions;
    },

    /**
     * It returns a string indicating the type of binary data being transmitted by the connection.
     *
     * @return {String} It returns "blob" if DOM Blob objects are being used or "arraybuffer" if
     *                  ArrayBuffer objects are being used.
     */
    getBinaryType : function()
    {
      return this.__socket.binaryType;
    },

    /**
     * The send(data) method transmits data using the connection.
     *
     * Note: Prior to Gecko 11.0, outbound messages sent using the send() method were limited to 16 MB.
     * They can now be up to 2 GB in size.
     *
     * @param data {String|Blob|ArrayBuffer} The data to be sent.
     * @param format {String?} The "text" or "json". 
     */
    send : function(data, format)
    {
// fractionated send
//      if (w.bufferedAmount < bufferThreshold) {}
      if (this.getReadyState() === 1)
      {
        try
        {
          /**
           * Note: Gecko's implementation of the send() method differs somewhat from the specification in Gecko 6.0;
           * Gecko returns a boolean indicating whether or not the connection is still open (and, by extension, that
           * the data was successfully queued or transmitted); this is corrected in Gecko 8.0.
           *
           * As of Gecko 11.0, support for ArrayBuffer is implemented but not Blob data types.
           */
          this.__socket.send(format === "json" ? qx.lang.Json.stringify(data) : data);
        }
        catch()
        {
          // The connection is not currently OPEN.
          if(err == "INVALID_STATE_ERR")
          {
          }
          // The data is a string that has unpaired surrogates.
          else if(err == "SYNTAX_ERR")
          {
          }
        }
      }
    }
  }
});

