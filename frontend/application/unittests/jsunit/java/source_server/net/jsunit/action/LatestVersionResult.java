package net.jsunit.action;

import com.opensymphony.webwork.ServletActionContext;
import com.opensymphony.xwork.ActionInvocation;
import com.opensymphony.xwork.Result;

import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;

public class LatestVersionResult implements Result {

    public void execute(ActionInvocation invocation) throws Exception {
        LatestVersionSource source = (LatestVersionSource) invocation.getAction();
        double latestVersion = source.getLatestVersion();
        HttpServletResponse response = ServletActionContext.getResponse();
        response.setContentType("text/xml");
        OutputStream out = response.getOutputStream();
        out.write(String.valueOf(latestVersion).getBytes());
        out.close();
    }

}
