## Synopsis

Basic build environment for a Javascript client app that generates a standalone app and a chrome packaged 

envirnoment uses the following :
npm
bower
requirejs
jquery
backbone
modernizr

## Install 

install dependecies:

npm install 

run build script:
gulp build:chrome 

uses bower to install front end scripts
bower install

reloading of the chrome app is done through watches and running the shell script :reloadchroms.sh
chomd the reloadchrome.sh to give permissions to run
edit the reloadchrome.sh to give the path if the installed script


## Motivation

ease the use of setup and give examples of adding a build environment for developing a chrome packaged apps 


