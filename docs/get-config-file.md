# Get configuration file

## With Firebase

Please NOTE that you **do not** need firebase to get the necessary files and SHA1 hashes - see the guide below if you don't want to use firebase.

If you don't already have a project in Firebase you need to create one in order to generate credentials for an iOS and Android application.

[Firebase console](https://console.firebase.google.com/u/0/)

1. Add your iOS and Android App inside Project settings (see image).

![Project settings](../img/project-settings.png)

2. Enter required information and download the config file.

_Note: For Android, adding the SHA1 hash is an obligation_

You can use your debug keystore's SHA1 hash, read this [StackOverflow thread](https://stackoverflow.com/questions/15727912/sha-1-fingerprint-of-keystore-certificate) to obtain it. When running the `keytool` command, **MAKE SURE** you provide path to the correct keystore, you may have multiple keystores on your system! (eg in home directory, and also directly in the `android/app` folder). To see what keystore is being used to sign your app, go to `android/app/build.gradle` and look for `storeFile` entries.

If you don't have a keystore, you need to generate one. To generate your keystore follow [this guide](https://facebook.github.io/react-native/docs/signed-apk-android.html).

**IMPORTANT** if you have multiple keystores (and you likely do - eg. debug and release) you'll need to get the SHA1 hashes for all of them and save the hashes to Firebase!

## Without Firebase

### iOS

Follow these instructions from the official docs:

1. [Get an OAuth client ID](https://developers.google.com/identity/sign-in/ios/start-integrating#get_an_oauth_client_id).
1. [Add a URL scheme to your project](https://developers.google.com/identity/sign-in/ios/start-integrating#add_a_url_scheme_to_your_project)

### Android

Follow the instructions to [Configure a Google API Project](https://developers.google.com/identity/sign-in/android/start#configure-a-google-api-project) from the official docs.

## WebClientId

`webClientId` will be automatically generated once you create the app in the firebase console or configure the API. You can access the it [here](https://console.developers.google.com/apis/credentials).
Make sure you select the correct project. `webClientId` should be under OAuth section.
