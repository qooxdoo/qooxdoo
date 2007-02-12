package net.jsunit.action;

import com.opensymphony.webwork.ServletActionContext;
import com.opensymphony.xwork.ActionInvocation;
import com.opensymphony.xwork.Result;
import net.jsunit.XmlRenderable;
import net.jsunit.utility.XmlUtility;
import org.jdom.Document;
import org.jdom.Element;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.logging.Logger;

public class XmlResult implements Result {

	private Logger logger = Logger.getLogger(XmlResult.class.getName());
	
    public void execute(ActionInvocation invocation) throws Exception {
        XmlProducer producer = (XmlProducer) invocation.getAction();
        XmlRenderable xmlRenderable = producer.getXmlRenderable();
        Element element = xmlRenderable.asXml();
        Document document = new Document(element);
        String xmlString = XmlUtility.asString(document);
        HttpServletResponse response = ServletActionContext.getResponse();
        response.setContentType("text/xml");
        try {
	        OutputStream out = response.getOutputStream();
	        BufferedOutputStream bufferedOut = new BufferedOutputStream(out);
	        bufferedOut.write(xmlString.getBytes());
	        bufferedOut.close();
        } catch (IOException e) {
        	logger.warning("Failed to write result XML response to browser: " + e.toString());
        }
    }

}
