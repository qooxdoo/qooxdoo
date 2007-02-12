package net.jsunit;

import net.jsunit.utility.StreamUtility;
import net.jsunit.utility.XmlUtility;
import org.jdom.Document;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;

public class RemoteMachineServerHitter implements RemoteServerHitter {

    public Document hitURL(URL url) throws IOException {
        String xmlResultString = submitRequestTo(url);
        return XmlUtility.asXmlDocument(xmlResultString);
    }

    private String submitRequestTo(URL url) throws IOException {
        URLConnection connection = url.openConnection();
        return StreamUtility.readAllFromStream(connection.getInputStream());
    }

}
