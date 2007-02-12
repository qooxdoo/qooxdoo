package net.jsunit.interceptor;

import com.opensymphony.xwork.Action;
import net.jsunit.ServerRegistry;
import net.jsunit.action.JsUnitServerAware;

public class FarmServerInterceptor extends JsUnitInterceptor {

    protected void execute(Action targetAction) {
        JsUnitServerAware action = (JsUnitServerAware) targetAction;
        action.setFarmServer(ServerRegistry.getFarmServer());
    }

}
