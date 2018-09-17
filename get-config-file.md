## Get configuration file

If you don't already have a project in Firebase you need to create one in order to generate credentials for an iOS and Android application

[Firebase console](https://console.firebase.google.com/u/0/)

1. Add your iOS and Android App inside Project settings.

![Project settings](img/project-settings.png)

_Access project settings on top left pane next to Project Overview_

2. During the Add App process download the config file.

_Note: For Android, having the SHA1 hash is an obligation_

To get the SHA1 hash you need to generate your keystore, to generate your keystore follow [this guide](https://facebook.github.io/react-native/docs/signed-apk-android.html)

You can use your debug keystore's SHA1 hash, get it by running this command inside `$ROOT/android`

`keytool -exportcert -keystore ~/.android/debug.keystore -list -v`

This should print out a SHA1 key.

**IMPORTANT** if you have multiple keystores (and you likely do - eg. debug and release) you'll need to get the SHA1 hashes for all of them and save the hashes to Firebase!

## WebClientId

`webClientId` will be automatically generated once you create the app in the firebase console.
You can access the `webClientId` [here](https://console.developers.google.com/apis/credentials). Make sure you select the correct project. `webClientId` should be under OAuth section.
