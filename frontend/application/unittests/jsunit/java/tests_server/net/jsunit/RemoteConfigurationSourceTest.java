package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ServerType;
import net.jsunit.utility.XmlUtility;
import org.jdom.Document;

public class RemoteConfigurationSourceTest extends TestCase {
    private String baseURL;

    protected void setUp() throws Exception {
        super.setUp();
        baseURL = "http://www.example.com:1234/jsunit";
    }

    public void testSimple() throws Exception {
        Configuration configuration = new Configuration(new DummyConfigurationSource());
        MockRemoteServerHitter mockHitter = new MockRemoteServerHitter();
        mockHitter.urlToDocument.put(baseURL + "/config", new Document(configuration.asXml(ServerType.STANDARD)));

        RemoteConfigurationSource remoteSource = new RemoteConfigurationSource(mockHitter, baseURL);
        assertTrue(remoteSource.isInitialized());

        Configuration remoteConfiguration = new Configuration(remoteSource);
        assertEquals(XmlUtility.asString(configuration.asXml(ServerType.STANDARD)),
                XmlUtility.asString(remoteConfiguration.asXml(ServerType.STANDARD))
        );
    }

    public void testBlowingUpURL() throws Exception {
        RemoteConfigurationSource remoteSource = new RemoteConfigurationSource(new BlowingUpRemoteServerHitter(), baseURL);
        assertFalse(remoteSource.isInitialized());
    }

}
