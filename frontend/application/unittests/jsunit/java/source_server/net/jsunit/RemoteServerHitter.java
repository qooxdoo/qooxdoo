package net.jsunit;

import org.jdom.Document;

import java.io.IOException;
import java.net.URL;

public interface RemoteServerHitter {

    public Document hitURL(URL url) throws IOException;

}
