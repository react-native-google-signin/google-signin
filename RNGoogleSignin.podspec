require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name                = "RNGoogleSignin"
  s.version             = package['version']
  s.summary             = package['description']
  s.description         = <<-DESC
                            Pod file to enable linking code from React Native Google Signing and Google/Signing Pod.
                         DESC
  s.homepage            = "http://facebook.github.io/react-native/"
  s.license             = package['license']
  s.author              = "Radical Candor"
  s.source              = { :git => "https://github.com/devfd/react-native-google-signin", :tag => "v#{s.version}" }
  s.default_subspec     = 'Core'
  s.requires_arc        = true
  s.platform            = :ios, "8.0"
  s.pod_target_xcconfig = { "CLANG_CXX_LANGUAGE_STANDARD" => "c++14" }
  s.header_dir          = 'RNGoogleSignin'
  s.preserve_paths      = "package.json", "LICENSE", "LICENSE-CustomComponents", "PATENTS"

  s.subspec 'Core' do |ss|
    # ss.dependency      'Google/Signin'
    ss.source_files  = "ios/**/*.{c,h,m,mm,S}"
    ss.libraries     = "stdc++"
  end
end
