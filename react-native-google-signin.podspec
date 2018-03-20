require "json"
package = JSON.parse(File.read('package.json'))

Pod::Spec.new do |s|
  s.name          = package['name']
  s.version       = package['version']
  s.summary       = package['description']
  s.author        = "devfd"
  s.license       = package['license']
  s.requires_arc  = true
  s.homepage      = "https://github.com/devfd/react-native-google-signin"
  s.source        = { :git => 'https://github.com/devfd/react-native-google-signin.git' }
  s.platform      = :ios, '8.0'
  s.source_files  = "ios/**/*.{h,m}"
  s.public_header_files = ['ios/RNGoogleSignin/RNGoogleSignin.h']
  s.static_framework = true

  s.dependency "React"
  s.dependency "GoogleSignIn"

end
