Version: 25

Official CLDR page:
http://cldr.unicode.org/

CLDR (http://cldr.unicode.org) provides locale content for I18n software.
The data is provided in two formats: LDML (XML format) and JSON.
We are using the JSON data via the node package 'cldr.js'.

Official JSON spec:
http://cldr.unicode.org/index/cldr-spec/json

Official JSON data:
http://unicode.org/Public/cldr/25/
 * json.zip         19-Mar-2014 15:59  3.1M
 * json_full.zip    19-Mar-2014 16:17   48M

Note: We currently use 'json.zip' instead of 'json_full.zip' which
just provides more languages (but would also add more bloat to the SDK).

If you need locale content for a language not shipped with the SDK
just download the 'json_full.zip' and unzip it in the cldr dir next to
this file. Now you should be able to use the locale content of
all other languages provided by the CLDR.
