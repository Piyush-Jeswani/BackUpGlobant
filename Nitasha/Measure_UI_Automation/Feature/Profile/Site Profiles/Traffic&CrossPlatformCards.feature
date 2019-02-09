Feature: Measure Profile page 
As a user I should be able to verify the site profile page.	


Scenario: History graphs test
Given  I am at the Top Websites page
| Santiago.Antonelli@globant.com | Automation7654 |
When  I navigate to the site profile page
| today.com|
Then  I will see the Global header
When I drag and drop the Start date selector
Then the blue highlighted section of the graph will expand up to the point I dropped the Start date selector
Then the main graph above the History graph will be updated with the new start dates selected from the History graph
And the start From date field in the Custom section on the right will update with the date selected in the graph
When I drag and drop the End date selector
Then the blue highlighted section of the graph will expand up to the point I dropped the End date selector
Then the main graph above the History graph will be updated with the new end dates selected from the History graph
And the end To date field in the Custom section on the right will update with the date selected in the graph
