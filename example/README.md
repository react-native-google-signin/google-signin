# Example App

### Setup

- Run `yarn` on project root to install required Javascript dependencies
- Go to `example/ios/` and run `pod install` to install required native iOS dependencies
- To get the example running you need to have (see [how to get config files](https://react-native-google-signin.github.io/docs/setting-up/get-config-file)):
  - `google-services.json` in your `android/app/` (for the example app, that will be in `node_modules/react-native-test-app/`)
  - `GoogleService-Info.plist` in `node_modules/react-native-test-app/ios/ReactTestApp` and linked in XCode by dragging it to the file tree.
- create `src/confgi/config.js` with the following content:

```ts
export default {
  webClientId: 'your-web-client-id.apps.googleusercontent.com',
};
```

### Running

- Start Metro bundler with `yarn start`
- iOS: open the project in Xcode (run `xed ios` in the `example/` directory) and run the app
- Android: open the `build.gradle` file in `example/android/` directory and run the app

### Unlinking example app from a Google Account

- log out in the app
- unlink at https://myaccount.google.com/connections
- delete the storage of the Google play services app
- wait a bit

### Enabling access to the People API

Go to https://console.cloud.google.com/apis/api/people.googleapis.com/metrics?project=abcd-1234
