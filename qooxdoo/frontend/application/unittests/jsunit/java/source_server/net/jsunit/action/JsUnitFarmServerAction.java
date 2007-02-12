package net.jsunit.action;

import com.opensymphony.xwork.Action;
import net.jsunit.JsUnitFarmServer;
import net.jsunit.RemoteServerHitter;

public abstract class JsUnitFarmServerAction
        implements Action,
        XmlProducer,
        RemoteRunnerHitterAware,
        JsUnitServerAware {

    protected JsUnitFarmServer server;
    protected RemoteServerHitter hitter;

    public void setFarmServer(JsUnitFarmServer server) {
        this.server = server;
    }

    public void setRemoteRunnerHitter(RemoteServerHitter hitter) {
        this.hitter = hitter;
    }

}
