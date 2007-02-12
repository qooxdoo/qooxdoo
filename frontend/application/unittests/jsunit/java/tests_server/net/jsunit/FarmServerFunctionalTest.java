package net.jsunit;

import net.jsunit.configuration.Configuration;
import net.jsunit.model.ResultType;
import org.jdom.Document;

import java.net.URLEncoder;

public class FarmServerFunctionalTest extends FunctionalTestCase {

    private JsUnitFarmServer farmServer;
    private int otherPort;

    public void setUp() throws Exception {
        super.setUp();
        otherPort = new TestPortManager().newPort();
        farmServer = new JsUnitFarmServer(new Configuration(new FunctionalTestFarmConfigurationSource(otherPort, port)));
        farmServer.start();
    }

    protected int webTesterPort() {
        return otherPort;
    }

    public void testHitFarmRunner() throws Exception {
        String url =
                "/runner?url=" + URLEncoder.encode("http://localhost:" + port + "/jsunit/tests/jsUnitUtilityTests.html", "UTF-8");
        webTester.beginAt(url);
        Document document = responseXmlDocument();
        assertEquals(ResultType.SUCCESS.name(), document.getRootElement().getAttribute("type").getValue());
    }

    public void tearDown() throws Exception {
        farmServer.dispose();
        super.tearDown();
    }

}
