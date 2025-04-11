package com.umut.passwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PasswiseApplication {

	public static void main(String[] args) {

		SpringApplication.run(PasswiseApplication.class, args);

		System.out.println("----------------------------------------------------------------");
		for(int i = 1; i<3; i++){
			System.out.println(i);
		}
		System.out.println("----------------------------------------------------------------");

	}

}
