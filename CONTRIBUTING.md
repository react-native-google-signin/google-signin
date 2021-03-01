## Contributor Guide

Want to add a feature or fix a bug? Great! This short guide will help.

Development is best done using the example project. After you clone the repo, see the example project's [readme](../example/README.md) for instructions on how to get it running.

When done, the example project should build successfully on both platforms and you should be able to sign in using the example app.

### Making Changes to Native Code

If you want to make changes to native code, just go ahead and import the example project into Android Studio, or open the `GoogleSigninSampleApp.xcworkspace` file in Xcode.

In Android Studio you'll see the reference to the `react-native-google-signin` project.
in Xcode, under Pods project, there'll be `RNGoogleSignIn` project.

You may edit the source codes of those projects - that will edit the files in the `android` and `ios` folders in the repo root (not in `node_modules`) so you can easily commit those changes.

### Making Changes to JS Code

Just edit them straight away.

### Finalize

- From the root of the repo run `yarn prettier:write` to prettify the JS files.
- Open a PR with your changes! :tada:
