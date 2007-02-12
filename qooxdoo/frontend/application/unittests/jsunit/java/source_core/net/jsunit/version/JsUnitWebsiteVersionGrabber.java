package net.jsunit.version;

import net.jsunit.utility.StreamUtility;

import java.net.URL;

public class JsUnitWebsiteVersionGrabber implements VersionGrabber {

    public double grabVersion() throws Exception {
        URL url = new URL("http://www.jsunit.net/version.txt");
        String string = StreamUtility.readAllFromStream(url.openStream());
        return Double.parseDouble(string);
    }
}
