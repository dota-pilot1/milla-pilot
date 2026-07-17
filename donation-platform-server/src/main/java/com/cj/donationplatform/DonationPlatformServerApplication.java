package com.cj.donationplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DonationPlatformServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DonationPlatformServerApplication.class, args);
	}

}
