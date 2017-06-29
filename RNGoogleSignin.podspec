# coding: utf-8
Pod::Spec.new do |s|
  s.name         = "RNGoogleSignin"
  s.version      = "0.10.0"
  s.summary      = "Google Signin for your react native applications"
  s.description  = <<-DESC
Features

* Support all 3 types of authentication methods (standard, with server-side validation or with offline access (aka server side access))
* Native signin button
* Consistent API between Android and iOS
* Promise-based JS API
                   DESC
  s.homepage     = "https://github.com/devfd/react-native-google-signin"

  s.license      = { :type => "MIT", :file => "LICENSE" }

  s.author             = "FD"
  s.social_media_url   = "https://github.com/devfd"

  s.platform     = :ios
  s.ios.deployment_target = "7.0"

  s.source       = { :git => "https://github.com/devfd/react-native-google-signin.git", :tag => "v#{s.version}" }
  s.source_files  = "ios/RNGoogleSignin/*.{h,m}"
  s.dependency 'Google/SignIn'
end
