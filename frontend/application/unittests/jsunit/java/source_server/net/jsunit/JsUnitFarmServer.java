package net.jsunit;

import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ServerType;

import java.util.Arrays;
import java.util.List;

public class JsUnitFarmServer extends AbstractJsUnitServer {

    public JsUnitFarmServer(Configuration configuration) {
        super(configuration, ServerType.FARM);
        ServerRegistry.registerFarmServer(this);
    }

    protected List<String> servletNames() {
        return Arrays.asList(new String[]{
                "index",
                "config",
                "latestversion",
                "runner"
        });
    }

    public static void main(String args[]) {
        try {
            JsUnitFarmServer server = new JsUnitFarmServer(Configuration.resolve(args));
            server.start();
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    public String toString() {
        return "JsUnit Farm Server";
    }

    protected String xworkXmlName() {
        return "farm_xwork.xml";
    }

    public ServerType serverType() {
        return ServerType.FARM;
    }

}
