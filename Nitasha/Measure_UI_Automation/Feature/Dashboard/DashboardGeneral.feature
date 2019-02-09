Feature: Dashboard Layout 

#https://quantcast.testrail.net/index.php?/tests/view/276
#T276 DASHBOARD - Dashboard Layout
#Preconditions
# Having an account with at least a Network, site and mobile app properties already added


Scenario: I login with valid credential and land on dashboard
Given I log into Quantcast Meaure with a valid user and password
| Santiago.Antonelli@globant.com | Automation765890 |
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



	
