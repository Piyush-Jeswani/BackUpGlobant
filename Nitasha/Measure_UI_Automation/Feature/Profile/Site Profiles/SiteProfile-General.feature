Feature: Measure Profile page 
As a user I should be able to verify the site profile page.	

@db
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