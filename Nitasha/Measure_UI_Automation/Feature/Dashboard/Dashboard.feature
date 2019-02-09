Feature: Measure Profile page 
As a user I should be able to verify the site profile page.	

@smoke
Scenario: I login with valid credential on a profile page
Given  I am at the Top Websites page
| Santiago.Antonelli@globant.com | Automation7654 |
When  I navigate to the site profile page
| today.com |
Then  I will see the Global header
And  I will see the Profile header with the site_logo
| today.com |
And the site name
| today.com |
And  the Quantcast logo
And  its site description

@smoke
Scenario: I login with valid credential and land on dashboard
Given I log into Quantcast Meaure with a valid user and password
| Santiago.Antonelli@globant.com | Automation7654 |
When I land on my Dashboard
Then I will see the Global Header and Footer
And I will see the dashboard header with the "Properties" title, the "Classic" button and the "3-dot" button
And I will see the "Instructions container"
And I will see the "My Properties" title
And I will see the Network container
And I will see my site properties containers
And I will see my mobile app properties containers
And I will se the right side component with the search bar and its links
And I will see the chat icon at the bottom right hand corner



	
