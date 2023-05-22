# Example App

### Setup

- Run `yarn` on project root to install required Javascript dependencies
- Go to `example/ios/` and run `pod install` to install required native iOS dependencies
- apply at the patch in the `patches` folder which should add deps for the Android example project (it's best to open it in Android Studio / Xcode).
- To get the example running you need to have (see [how to get config files](../docs/get-config-file.md)):
  - `google-services.json` in your `android/app/` (for the example app, that will be in `node_modules/react-native-test-app/`)
  - `GoogleService-Info.plist` in `node_modules/react-native-test-app/ios/ReactTestApp` and linked in XCode by dragging it to the file tree.
- create `config.js` with the following content:

```ts
export default {
  webClientId: 'your-web-client-id.apps.googleusercontent.com',
};
```

### Running

- Start Metro bundler with `yarn start`
- Run `yarn ios` or `yarn android` to run the example app

### Troubleshooting

Please see the troubleshooting section in the [Android guide](/docs/android-guide.md) and [iOS guide](/docs/ios-guide.md).
