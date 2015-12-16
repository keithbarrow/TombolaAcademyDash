#Dashboard
This is a dashboard to see whose pull requests are needed. 
It is not well written - it has been hacked together as quickly as possible. Currently the tests might not even pass.
I hope to fix both those things when I get time.

##Deploying
Because this runs under Apache and isn't on github yet you need to copy the .build folder to the server:
scp -r .build keith.barrow@eutaveg-01.tombola.emea:/home/keith.barrow/www
Assuming the target www folder exists and is empty....
There will then be a .build folder inside the target www folder - this is hidden. Copy the contents to /var/www/html and empty the scp target out for next time
https://research.csc.fi/csc-guide-copying-files-from-linux-and-mac-osx-machines-with-scp

##Building:
To setups dev (which assumes local API) and prod (which targets real API). There is a build-only option and a build and start express, giving us 4 main builds:


`gulp nostart` : Production build, no express
`gulp` or `gulp default`: Production build, with express

`gulp devnostart`: Development build (local API needs to be running), no express
`gulp devstart`: Development build (local API needs to be running), express started

