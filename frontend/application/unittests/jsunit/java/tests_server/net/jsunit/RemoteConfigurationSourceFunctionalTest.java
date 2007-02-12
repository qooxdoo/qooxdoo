package net.jsunit;

import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ServerType;
import net.jsunit.utility.XmlUtility;

public class RemoteConfigurationSourceFunctionalTest extends FunctionalTestCase {

    public void testSimple() throws Exception {
        String remoteMachineURL = "http://localhost:" + port + "/jsunit";
        RemoteConfigurationSource source = new RemoteConfigurationSource(new RemoteMachineServerHitter(), remoteMachineURL);
        assertTrue(source.isInitialized());
        Configuration remoteConfiguration = new Configuration(source);
        assertEquals(
                XmlUtility.asString(configuration.asXml(ServerType.STANDARD)),
                XmlUtility.asString(remoteConfiguration.asXml(ServerType.STANDARD))
        );
    }

}
