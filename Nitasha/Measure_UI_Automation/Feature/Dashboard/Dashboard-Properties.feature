Feature: Dashboard Profile 

@smoke 
Scenario: View Netwotk profile Page 
	Given I am logged into Quantcast Measure with a valid user and password 
		| Santiago.Antonelli@globant.com | Automation765890 |
	And I land on my Dashboard 
	When I click the "VIEW DATA" button from the Network container 
	Then I navigate to the Network Profile page 
	
	# Automate the test scenario here: https://quantcast.testrail.net/index.php?/tests/view/158
@smoke 
Scenario: Please refer to TestRail for further details 
	Given I am logged into Quantcast Measure with a valid user and password 
		| nitasha.rawat@globant.com | Test1234 |
	And I land on my Dashboard 
	When I click the "Edit Settings" wheel icon from the Network container 
	Then I navigate to the Publisher Network Settings page 
	
	
	# https://quantcast.testrail.net/index.php?/tests/view/166
@smoke 
Scenario: (Please refer to TestRail for further details): 
#Precondition steps:
	Given I am logged into Quantcast Measure with a valid user and password 
		| Santonelli@quantcast.com | Quantesting |
		
	When  I navigate to the site profile page through url 
		| androidcentral.com |
	And I click on the view wheel icon dropdownk 
	And I click the Impersonate option 
	When I navigate to the Dashboard 
	Then I will land in the Dashboard as though I were the <profile>'s publisher 
	
	#Scenario's steps, the four steps mentioned below are already covered in precendition steps
	#Given I am logged into Quantcast Measure with a valid <user> and <password>
	#And  I am at my Dashboard
	#And   I have added a Site property
	#And   my property is active
	And   I hover over my property's container 
	And   I click the VIEW DATA button 
	And   I will navigate to my site's Profile page 
		| Androidcentral.com Audience Insights - Quantcast |
		
		
		# https://quantcast.testrail.net/index.php?/tests/view/167
@smokedev 
Scenario: (Please refer to TestRail for further details): 
#Precondition steps:
	Given I am logged into Quantcast Measure with a valid user and password 
		| Santonelli@quantcast.com | Quantesting |
		
	When  I navigate to the site profile page through url 
		| androidcentral.com |
	And I click on the view wheel icon dropdownk 
	And I click the Impersonate option 
	When I navigate to the Dashboard 
	Then I will land in the Dashboard as though I were the <profile>'s publisher 
	
	
	#Scenario's steps, the four steps mentioned below are already covered in precendition steps
	#Given I am logged into Quantcast Measure with a valid <user> and <password>
	#And  I am at my Dashboard
	#And   I have added a Site property
	#And   my property is active
	And I hover over my property's container 
	When I click the Edit Setting wheel icon 
	When I will navigate to my site's Settings edition page 
		|Quantcast - Settings|
		
