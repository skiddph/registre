# Registre
Registre is a QRCode base logbook system that tracks the time-in and time-out of an employee

## System Requirements
### Operating System (OS)


Your OS must be one of following:
 - Capable of running nodejs 17+
 
### Dependecies 
 - build-tools
 - nodejs

## Setup
### Step 1: Install Required Application

 - Install necessary applications [nodejs v12+](https://nodejs.org/en/download/)

### Step 2: Prepare workspace

 - Extract the `registre-*.zip` file from the latest [release](https://github.com/skiddph/registre/releases)
 - Open Terminal/Shell/CMD and cd to the extracted folder
 ```cd path/to/extracted/folder/registre```
 - Install npm dependencies
 ```npm install```
 - Run the setup command to set up the database
 ```npm run setup```

## CLI Usage

### Start the application

 - Open Terminal/Shell/CMD and cd to the extracted folder
 ```cd path/to/extracted/folder/registre```
 - Run start command
 ```npm run setup```
 - Open the generated links in the browser
 - **Note:** The `local` link can only be accessed in the server or local machine

### Reset database manually

 - Open Terminal/Shell/CMD and cd to the extracted folder
 ```cd path/to/extracted/folder/registre```
 - Run reset command
 ```npm run reset```
