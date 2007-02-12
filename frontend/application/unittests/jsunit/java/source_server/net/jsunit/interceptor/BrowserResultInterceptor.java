package net.jsunit.interceptor;

import com.opensymphony.webwork.ServletActionContext;
import com.opensymphony.xwork.Action;
import net.jsunit.action.BrowserResultAware;
import net.jsunit.model.BrowserResult;
import net.jsunit.model.BrowserResultWriter;
import net.jsunit.utility.StringUtility;

import javax.servlet.http.HttpServletRequest;

public class BrowserResultInterceptor extends JsUnitInterceptor {

    protected void execute(Action targetAction) {
        HttpServletRequest request = ServletActionContext.getRequest();
        BrowserResult result = build(request);
        BrowserResultAware aware = (BrowserResultAware) targetAction;
        aware.setBrowserResult(result);
    }

    public BrowserResult build(HttpServletRequest request) {
        BrowserResult result = new BrowserResult();
        String testId = request.getParameter(BrowserResultWriter.ID);
        if (!StringUtility.isEmpty(testId))
            result.setId(testId);
        result.setRemoteAddress(request.getRemoteAddr());
        result.setUserAgent(request.getParameter(BrowserResultWriter.USER_AGENT));
        result.setBaseURL(request.getParameter(BrowserResultWriter.URL));
        String time = request.getParameter(BrowserResultWriter.TIME);
        if (!StringUtility.isEmpty(time))
            result.setTime(Double.parseDouble(time));
        result.setJsUnitVersion(request.getParameter(BrowserResultWriter.JSUNIT_VERSION));
        result.setTestCaseStrings(request.getParameterValues(BrowserResultWriter.TEST_CASES));
        return result;
    }

}
