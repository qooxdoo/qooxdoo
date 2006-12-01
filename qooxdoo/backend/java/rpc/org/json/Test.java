package org.json;

/*
Copyright (c) 2002 JSON.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * Test class.
 */
public class Test {

	/**
	 * Entry point.
	 * @param args
	 */
    public static void main(String args[]) {
        System.out.println("working");
        try {
            JSONObject j = new JSONObject("{slashes: '///', closetag: '</script>', backslash:'\\\\', ei: {quotes: '\"\\''},eo: {a: '\"quoted\"', b:\"don't\"}, quotes: [\"'\", '\"']}");
            System.out.println(j.toString(2));
            System.out.println(XML.toString(j));
            System.out.println("");

            j = new JSONObject(
                "/*comment*/{foo: [true, false,9876543210,    0.0, 1.00000001,  1.000000000001, 1.00000000000000001," +
                " .00000000000000001, 2.00, 0.1, 2e100, -32,[],{}, \"string\"], " +
                "  to   : null, op : 'Good'," +
                "ten:10} postfix comment");
            j.put("String", "98.6");
            j.put("JSONObject", new JSONObject());
            j.put("JSONArray", new JSONArray());
            j.put("int", 57);
            j.put("double", 57.57E20);
            j.put("true", true);
            j.put("false", false);
            j.put("bool", "true");
            j.put("zero", -0.0);
            JSONArray a = j.getJSONArray("foo");
            a.put(666);
            a.put(2001.99);
            a.put("so \"fine\".");
            a.put("so <fine>.");
            a.put(true);
            a.put(false);
            a.put(new JSONArray());
            a.put(new JSONObject());
            System.out.println(j.toString(4));
            System.out.println(XML.toString(j));

            System.out.println("String: " + j.getDouble("String"));
            System.out.println("  bool: " + j.getBoolean("bool"));
            System.out.println("    to: " + j.getString("to"));
            System.out.println("  true: " + j.getString("true"));
            System.out.println("   foo: " + j.getJSONArray("foo"));
            System.out.println("    op: " + j.getString("op"));
            System.out.println("   ten: " + j.getInt("ten"));
            System.out.println("  oops: " + j.optBoolean("oops"));

            j = XML.toJSONObject("<xml one = 1 two=' 2 '><five></five>First \u0009&lt;content&gt;<five></five> This is \"content\". <three>  3  </three>  <three>  III  </three>  <three>  T H R E E</three><for/></xml>");
            System.out.println(j.toString(2));
            System.out.println(XML.toString(j));
            System.out.println("");

            j = XML.toJSONObject("<mapping>   <class name = \"Customer\">      <field name = \"ID\" type = \"string\">         <bind-xml name=\"ID\" node=\"attribute\"/>      </field>      <field name = \"FirstName\" type = \"FirstName\"/>      <field name = \"MI\" type = \"MI\"/>      <field name = \"LastName\" type = \"LastName\"/>   </class>   <class name = \"FirstName\">      <field name = \"text\">         <bind-xml name = \"text\" node = \"text\"/>      </field>   </class>   <class name = \"MI\">      <field name = \"text\">         <bind-xml name = \"text\" node = \"text\"/>      </field>   </class>   <class name = \"LastName\">      <field name = \"text\">         <bind-xml name = \"text\" node = \"text\"/>      </field>   </class></mapping>");

            System.out.println(j.toString(2));
            System.out.println(XML.toString(j));
            System.out.println("");

            j = XML.toJSONObject("<?xml version=\"1.0\" ?><Book Author=\"Anonymous\"><Title>Sample Book</Title><Chapter id=\"1\">This is chapter 1. It is not very long or interesting.</Chapter><Chapter id=\"2\">This is chapter 2. Although it is longer than chapter 1, it is not any more interesting.</Chapter></Book>");
            System.out.println(j.toString(2));
            System.out.println(XML.toString(j));
            System.out.println("");

            j = XML.toJSONObject("<!DOCTYPE bCard 'http://www.cs.caltech.edu/~adam/schemas/bCard'><bCard><?xml default bCard        firstname = ''        lastname  = '' company   = '' email = '' homepage  = ''?><bCard        firstname = 'Rohit'        lastname  = 'Khare'        company   = 'MCI'        email     = 'khare@mci.net'        homepage  = 'http://pest.w3.org/'/><bCard        firstname = 'Adam'        lastname  = 'Rifkin'        company   = 'Caltech Infospheres Project'        email     = 'adam@cs.caltech.edu'        homepage  = 'http://www.cs.caltech.edu/~adam/'/></bCard>");
            System.out.println(j.toString(2));
            System.out.println(XML.toString(j));
            System.out.println("");

            j = XML.toJSONObject("<?xml version=\"1.0\"?><customer>    <firstName>        <text>Fred</text>    </firstName>    <ID>fbs0001</ID>    <lastName> <text>Scerbo</text>    </lastName>    <MI>        <text>B</text>    </MI></customer>");
            System.out.println(j.toString(2));
            System.out.println(XML.toString(j));
            System.out.println("");

            j = XML.toJSONObject("<!ENTITY tp-address PUBLIC '-//ABC University::Special Collections Library//TEXT (titlepage: name and address)//EN' 'tpspcoll.sgm'><list type='simple'><head>Repository Address </head><item>Special Collections Library</item><item>ABC University</item><item>Main Library, 40 Circle Drive</item><item>Ourtown, Pennsylvania</item><item>17654 USA</item></list>");
            System.out.println(j.toString());
            System.out.println(XML.toString(j));
            System.out.println("");

            j = XML.toJSONObject("<test intertag status=ok><empty/>deluxe<blip sweet=true>&amp;toot&toot;</blip><x>eks</x><w>bonus</w><w>bonus2</w></test>");
            System.out.println(j.toString(2));
            System.out.println(XML.toString(j));
            System.out.println("");

            j = HTTP.toJSONObject("GET / HTTP/1.0\nAccept: image/gif, image/x-xbitmap, image/jpeg, image/pjpeg, application/vnd.ms-powerpoint, application/vnd.ms-excel, application/msword, */*\nAccept-Language: en-us\nUser-Agent: Mozilla/4.0 (compatible; MSIE 5.5; Windows 98; Win 9x 4.90; T312461; Q312461)\nHost: www.nokko.com\nConnection: keep-alive\nAccept-encoding: gzip, deflate\n");
            System.out.println(j.toString(2));
            System.out.println(HTTP.toString(j));
            System.out.println("");

            j = HTTP.toJSONObject("HTTP/1.1 200 Oki Doki\nDate: Sun, 26 May 2002 17:38:52 GMT\nServer: Apache/1.3.23 (Unix) mod_perl/1.26\nKeep-Alive: timeout=15, max=100\nConnection: Keep-Alive\nTransfer-Encoding: chunked\nContent-Type: text/html\n");
            System.out.println(j.toString(2));
            System.out.println(HTTP.toString(j));
            System.out.println("");

            j = new JSONObject("{nix: null, nux: false, null: 'null', 'Request-URI': '/', Method: 'GET', 'HTTP-Version': 'HTTP/1.0'}");
            System.out.println(j.toString(2));
            System.out.println("isNull: " + j.isNull("nix"));
            System.out.println("   has: " + j.has("nix"));
            System.out.println(XML.toString(j));
            System.out.println(HTTP.toString(j));
            System.out.println("");

            j = XML.toJSONObject("<?xml version='1.0' encoding='UTF-8'?>"+"\n\n"+"<SOAP-ENV:Envelope"+
              " xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\""+
              " xmlns:xsi=\"http://www.w3.org/1999/XMLSchema-instance\""+
              " xmlns:xsd=\"http://www.w3.org/1999/XMLSchema\">"+
              "<SOAP-ENV:Body><ns1:doGoogleSearch"+
              " xmlns:ns1=\"urn:GoogleSearch\""+
              " SOAP-ENV:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">"+
              "<key xsi:type=\"xsd:string\">GOOGLEKEY</key> <q"+
              " xsi:type=\"xsd:string\">'+search+'</q> <start"+
              " xsi:type=\"xsd:int\">0</start> <maxResults"+
              " xsi:type=\"xsd:int\">10</maxResults> <filter"+
              " xsi:type=\"xsd:boolean\">true</filter> <restrict"+
              " xsi:type=\"xsd:string\"></restrict> <safeSearch"+
              " xsi:type=\"xsd:boolean\">false</safeSearch> <lr"+
              " xsi:type=\"xsd:string\"></lr> <ie"+
              " xsi:type=\"xsd:string\">latin1</ie> <oe"+
              " xsi:type=\"xsd:string\">latin1</oe>"+
              "</ns1:doGoogleSearch>"+
              "</SOAP-ENV:Body></SOAP-ENV:Envelope>");
            System.out.println(j.toString(2));
            System.out.println(XML.toString(j));
            System.out.println("");

            j = new JSONObject("{Envelope: {Body: {\"ns1:doGoogleSearch\": {oe: \"latin1\", filter: true, q: \"'+search+'\", key: \"GOOGLEKEY\", maxResults: 10, \"SOAP-ENV:encodingStyle\": \"http://schemas.xmlsoap.org/soap/encoding/\", start: 0, ie: \"latin1\", safeSearch:false, \"xmlns:ns1\": \"urn:GoogleSearch\"}}}}");
            System.out.println(j.toString(2));
            System.out.println(XML.toString(j));
            System.out.println("");

            j = CookieList.toJSONObject("  f%oo = b+l=ah  ; o;n%40e = t.wo ");
            System.out.println(j.toString(2));
            System.out.println(CookieList.toString(j));
            System.out.println("");

            j = Cookie.toJSONObject("f%oo=blah; secure ;expires = April 24, 2002");
            System.out.println(j.toString(2));
            System.out.println(Cookie.toString(j));
            System.out.println("");

            j = new JSONObject("{script: 'It is not allowed to send a close script tag in a string<script>because it confuses browsers</script>so we insert a backslash before the /'}");
            System.out.println(j.toString());
            System.out.println("");

            JSONTokener jt = new JSONTokener("{op:'test', to:'session', pre:1}{op:'test', to:'session', pre:2}");
            j = new JSONObject(jt);
            System.out.println(j.toString());
            System.out.println("pre: " + j.optInt("pre"));
            int i = jt.skipTo('{');
            System.out.println(i);
            j = new JSONObject(jt);
            System.out.println(j.toString());
            System.out.println("");

            a = CDL.toJSONArray("No quotes, 'Single Quotes', \"Double Quotes\"\n1,'2',\"3\"\n,'It is \"good,\"', \"It works.\"\n\n");

            System.out.println(CDL.toString(a));
            System.out.println("");
            System.out.println(a.toString(4));
            System.out.println("");

            a = new JSONArray(" [\"<escape>\", next is an implied null , , ok] ");
            System.out.println(a.toString());
            System.out.println("");
            System.out.println(XML.toString(a));
            System.out.println("");

            j = new JSONObject("{fun=>with non-standard forms;one=[[1.00]];uno=[[{1=>1}]];'+':+6e66 ;pluses=+++;empty = '' , 'double':0.666,true: TRUE, false: FALSE, null=NULL;[true] = [[!,@;*]]; string=>  o. k. ; # comment\r oct=0666; hex=0x666; dec=666; o=0999; noh=0x0x}");
            System.out.println(j.toString(4));
            System.out.println("");
            if (j.getBoolean("true") && !j.getBoolean("false")) {
                System.out.println("It's all good");
            }
			
            System.out.println("");
			j = new JSONObject(j, new String[]{"dec", "oct", "hex", "missing"});
            System.out.println(j.toString(4));
        } catch (Exception e) {
            System.out.println(e.toString());
        }
    }
}
