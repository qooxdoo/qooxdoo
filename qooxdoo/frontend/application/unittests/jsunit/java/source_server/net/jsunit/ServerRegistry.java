package net.jsunit;

public class ServerRegistry {
    private static JsUnitStandardServer standardServer;
    private static JsUnitFarmServer farmServer;

    public static void registerServer(JsUnitStandardServer server) {
        standardServer = server;
    }

    public static void registerFarmServer(JsUnitFarmServer server) {
        farmServer = server;
    }

    public static JsUnitStandardServer getStandardServer() {
        return standardServer;
    }

    public static JsUnitFarmServer getFarmServer() {
        return farmServer;
    }

    public static JsUnitServer getServer() {
        return standardServer != null ? standardServer : farmServer;
    }
}
