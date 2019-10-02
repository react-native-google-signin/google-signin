_If you don't have a Podfile, follow the instructions:_

1 . `pod init` creates a Podfile.

2 . add `GoogleSignIn` pod (see example below)

3 . run `pod install`

4 . from now on, use Xcode to open the `<your project>.xcodeworkspace` file (do not open the `.xcodeproj` any more)

_Podfile example_

```ruby
# Uncomment the next line to define a global platform for your project
# platform :ios, '9.0'

target 'test_google_signin' do
  # Uncomment the next line if you're using Swift or would like to use dynamic frameworks
  # use_frameworks!

  # Pods for test_google_signin
  pod 'GoogleSignIn', '~> 5.0.0' // RNGoogleSignin requires GoogleSignIn >= 5.0.0

  target 'test_google_signin-tvOSTests' do
    inherit! :search_paths
    # Pods for testing
  end

  target 'test_google_signinTests' do
    inherit! :search_paths
    # Pods for testing
  end

end
```
