package com.coding.practise;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Scanner;
import java.util.Set;

public class TryClass {
	
	
	public void cube (int a, int b){
		double cube = Math.pow(a, 3);
		System.out.println("Cube of a is "+cube);
	}
	
	public void readFromUser(){
		// This is to read String from input
		Scanner scan = new Scanner (System.in);
		System.out.println("Print the first name:");
		String firstName = scan.next();
		System.out.println("First Name you entered was : "+firstName);
		
		scan.close(); //	
	}
	
	public void randomNumber(int n){
		//How to choose random
		Random rn = new Random();
		int ran = rn.nextInt(99);		
		System.out.println("Random Number is :"+ran);
	}
	
	
	public void intToString(int n){
		System.out.println(Integer.toString(n));
	}
	
	public void bubbleSort(int[] arr){
		
		for (int i=0;i<arr.length;i++){
			for (int j=1;j<arr.length-i;j++){
				if (arr[j-1]>arr[j]){
					arr[j-1]= arr[j-1]+arr[j];
					arr[j]=arr[j-1]-arr[j];
					arr[j-1]=arr[j-1]-arr[j];
				}
			}
		}
		for (int i : arr){
			System.out.println(i);
		}
		
	}
	
	public void useSet(String[] arr){
		
		Set a = new HashSet<>();
//		HashSet h = new HashSet();
		
		for (String string : arr){
			a.add(string);
		}
		System.out.println(a);
		
	}
	
	
	public void convertStringToChar(String str){
		char[] arr = str.toCharArray();
		Arrays.sort(arr);
		System.out.println(arr);
	}
	
	
	private void displayDuplicates(String arr){
		
		char[] a = arr.toCharArray();
		Map<Character, Integer> dup = new HashMap<>();
		
		for (char c : a){
			if(!dup.containsKey(c)){
				dup.put(c, 1);
			}
			else
			{
				dup.put(c, dup.get(c)+1);
			}
		}
		
		//System.out.println(dup);
		
		
		
		Set<Map.Entry<Character, Integer>> entryset= dup.entrySet();
//		System.out.println(entryset);
		

//			Set<Character> s1	=dup.keySet();
//			System.out.println(s1);
			
			for (Map.Entry<Character, Integer> entry : entryset){
				if(entry.getValue()>1){
					System.out.printf("%s :  %d %n",entry.getKey(), entry.getValue());
				}
			}
			
			for (Character s : dup.keySet()){
				
			}
			Set<Character> setChar = dup.keySet();
			Iterator<Character> keySetIterator =  setChar.iterator();
		
	}
	
	
	private void useArrayList(){
		
		List<String> arr = new ArrayList<>();
		
		arr.add("piyu");
		arr.add("Jes");
		arr.add("hello");
		
		System.out.println(arr);
		Collections.swap(arr, 0, 1);
		System.out.println(arr);	
	}
	
	public void playList(){
		List<Integer> list = new ArrayList<Integer>();
		
//		List<Integer> lst = as ArrayList<E
//		list=['pi','yu'];
		list.add(1);
		list.add(2);
		list.add(3);
		System.out.println(list);
		
		list.add(3 ,5);
		System.out.println(list);
		
		/*list.remove(2);
		System.out.println(list);*/
		
		Iterator itr = list.iterator();
		while(itr.hasNext()){
			System.out.println(itr.next());
		}
	}
	
	
	public static void main(String[] args){
		
		TryClass obj = new TryClass();
		//obj.cube(5, 7);
		//obj.intToString(5);
		/*int[] arr ={6,7,5,4,3};
		obj.bubbleSort(arr);
		*/
		
		/*String[] dup = {"Piyush","So","Vi","Piyush","Sas"};
		obj.useSet(dup);*/
		
//		obj.convertStringToChar("piyush");
//		obj.displayDuplicates("piyushpy");
		
//		obj.useArrayList();
		obj.playList();
		
	}

	
}
