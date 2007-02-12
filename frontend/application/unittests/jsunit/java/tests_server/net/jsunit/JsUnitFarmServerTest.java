package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ServerType;

public class JsUnitFarmServerTest extends TestCase {

    private JsUnitFarmServer server;

    public void setUp() throws Exception {
        super.setUp();
        server = new JsUnitFarmServer(new Configuration(new DummyFarmConfigurationSource()));
    }

    public void testStartTestRun() throws Exception {
        assertEquals(ServerType.FARM, server.serverType());
    }

}