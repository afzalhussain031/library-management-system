## Issues to Fix

1. Auth redirect problem (very important)
=> When your app starts, it doesn’t yet know if user is logged in, but your routes already decide based on isAuthenticated.
What happens: User refreshes page, App still checking login…, Route says: “Not logged in → go to login page”, BUT user was actually logged in .

2. Password inputs are normal text fields, make he typing password visible. Use type="password".