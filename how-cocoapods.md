_If you don't have a Podfile, do `pod init`_

`pod init` creates a Podfile.

add `GoogleSignIn` pod

_Podfile example_

```ruby
# Uncomment the next line to define a global platform for your project
# platform :ios, '9.0'

target 'test_google_signin' do
  # Uncomment the next line if you're using Swift or would like to use dynamic frameworks
  # use_frameworks!

  # Pods for test_google_signin
  pod 'GoogleSignIn'

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
