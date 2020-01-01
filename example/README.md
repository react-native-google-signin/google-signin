# Example App

### Setup

- To get this running you should have (see [how to get config files](../docs/get-config-file.md)):
  - `google-services.json` in your `android/app/`
  - `GoogleService-Info.plist` in `ios/` and linked in XCode by dragging it to the file tree.
- Run `yarn` on project root to install required Javascript dependencies
- Go to `ios/` and run `pod install` to install required native iOS dependencies
- create `config.js` with the following content:

```js
export default {
  webClientId: 'your-id.apps.googleusercontent.com',
};
```

### Running

- Start Metro bundler with `yarn start`
- Run `yarn ios` or `yarn android` to run the example app

### Troubleshooting

Please see the troubleshooting section in the [Android guide](/docs/android-guide.md) and [iOS guide](/docs/ios-guide.md).
