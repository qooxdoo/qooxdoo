package net.jsunit.interceptor;

import com.opensymphony.webwork.ServletActionContext;
import com.opensymphony.xwork.Action;
import net.jsunit.action.RequestSourceAware;

public class RequestSourceInterceptor extends JsUnitInterceptor {

    protected void execute(Action targetAction) {
        RequestSourceAware aware = ((RequestSourceAware) targetAction);
        aware.setRequestIPAddress(ServletActionContext.getRequest().getRemoteAddr());
        aware.setRequestHost(ServletActionContext.getRequest().getRemoteHost());
    }

}
