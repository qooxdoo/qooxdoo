package net.sf.qooxdoo.rpc;

public class HelloWorld implements RemoteService {
	
	public String sayHello(String input) throws RemoteServiceException {
		try {
			//if (input.equals("Hi there!"))
			Thread.sleep(5000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "Client said: " + input;
	}
}
