## Contributor Guide

Want to add a feature or fix a bug? Great! This short guide will help.

Development is best done using the example project. After you clone the repo, you need to

- get the config files from firebase: see [here](get-config-file.md)
- cd to the example folder
- run `yarn` to install deps
- create `config.js` with the following content:

```js
export default {
  webClientId: 'your-id.apps.googleusercontent.com',
};
```

- cd to the `ios` folder and run `pod install`

Now the example project should build successfully on both platforms and you should be able to sign in using the example app.

### Making Change to Native Code

If you want to make changes to native code, just go ahead and import the example project into Android Studio, or open the `GoogleSigninSampleApp.xcworkspace` file in Xcode.

In Android Studio you'll see the reference to the `react-native-google-signin` project.
in Xcode, under Libraries, there'll be `RNGoogleSignIn` project.

You may edit the source codes of those projects - that will edit the files in the `android` and `ios` folders in the repo root (not in `node_modules`) so you can easily commit those changes.

### Making Change to JS Code

There is a little more work to make changes to JS code. The process is not ideal but works as follows:

- in the example folder, run `yarn watch`: this will watch any changes made to the files in the `<repo_root>/src` folder and copy them to `<example_folder>/node_modules/react-native-google-signin/src` so the react-native bundler can read them.
- note that this only watches the `src` folder so if you're working with other files you need to modify the watch script

Now you can make changes to JS code and test them out.

### Finalize

- from the root of the repo run `yarn prettier:write` to prettify the JS files
- open a PR with your changes! :tada:
