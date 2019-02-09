package com.pack.demo;

public class DemoClass {
	
	public void functionFirst(){
		System.out.println("Helllo this is call to functionFirst");
	}

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		System.out.println("We are in main class");
		DemoClass demo = new DemoClass();
		demo.functionFirst();

	}

}
