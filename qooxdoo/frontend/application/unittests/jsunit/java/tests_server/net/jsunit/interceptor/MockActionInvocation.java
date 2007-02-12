package net.jsunit.interceptor;

import com.opensymphony.xwork.*;
import com.opensymphony.xwork.interceptor.PreResultListener;
import com.opensymphony.xwork.util.OgnlValueStack;

public class MockActionInvocation implements ActionInvocation {

    private Action action;
    public boolean wasInvokeCalled;

    public MockActionInvocation(Action action) {
        this.action = action;
    }

    public Action getAction() {
        return action;
    }

    public boolean isExecuted() {
        return false;
    }

    public ActionContext getInvocationContext() {
        return null;
    }

    public ActionProxy getProxy() {
        return null;
    }

    public Result getResult() throws Exception {
        return null;
    }

    public String getResultCode() {
        return null;
    }

    public void setResultCode(String string) {
    }

    public OgnlValueStack getStack() {
        return null;
    }

    public void addPreResultListener(PreResultListener arg0) {
    }

    public String invoke() throws Exception {
        wasInvokeCalled = true;
        return null;
    }

    public String invokeActionOnly() throws Exception {
        return null;
    }

}
