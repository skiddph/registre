# Registre
Registre is a QRCode base logbook system that tracks the time-in and time-out of an employee

# Project development setup

### Requirements
 - [Node.js](https://nodejs.org/en/download/) version >= 14.x

### Setup
 - Install latest nodejs app from [here](https://nodejs.org/en/download/)
 - Extract the zip file to a folder
 - go to the extracted folder
 - open the command prompt inside the folder
 - run the following command:
```bash
npm install
npm run setup
```
 - that's it! you can now run the app from the command line

### Usage
 - Make sure you are in the extracted folder, and open the command prompt
 - run the following command:
```bash
npm start
# or 
npm run start
```

now you can access the app from the browser, if you are using a local server, use the link `https://127.0.0.1:3000`, or if you are trying to access the server from a different computer but still on the same network, use the link `https://<your-ip-address>:3000`.

to get the ip address of your computer, you can use the following command, and look for `ipv4 address`, that's your ip address
```bash
ipconfig
``` 

Note: you might get a warning message from your browser that the connection is insecure, but you can ignore it (by pressing `proceed unsafe`), this is because the app is running on a local server with an ssl which is supposed to be done in production server.