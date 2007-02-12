package net.jsunit.model;

import org.jdom.Element;

public class TestCaseResultBuilder {

    public TestCaseResult build(Element element) {
        TestCaseResult result = new TestCaseResult();
        updateWithHeaders(result, element);
        updateWithMessage(result, element);
        return result;
    }

    private void updateWithHeaders(TestCaseResult result, Element element) {
        String fullyQualifiedName = element.getAttributeValue(TestCaseResultWriter.NAME);
        result.setFullyQualifiedName(fullyQualifiedName);
        result.setTimeTaken(Double.parseDouble(element.getAttributeValue(TestCaseResultWriter.TIME)));
    }

    private void updateWithMessage(TestCaseResult result, Element element) {
        for (Object object : element.getChildren()) {
            Element next = (Element) object;
            String type = next.getName();
            String message = next.getText();
            if (TestCaseResultWriter.FAILURE.equals(type))
                result.setFailure(message);
            else if (TestCaseResultWriter.ERROR.equals(type))
                result.setError(message);
        }
    }

}
