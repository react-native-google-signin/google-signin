require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', '..', 'package.json')))

# Read ExpoModulesCore's iOS deployment target from its installed podspec so this
# adapter always matches it (the value is raised per Expo SDK, e.g. 16.4 on SDK 56).
ios_deployment_target = '15.1' # fallback if the podspec cannot be read
begin
  expo_modules_core_dir = File.dirname(
    `node --print "require.resolve('expo-modules-core/package.json', { paths: ['#{__dir__}'] })"`.strip
  )
  podspec_text = File.read(File.join(expo_modules_core_dir, 'ExpoModulesCore.podspec'))
  ios_target = podspec_text[/:ios\s*(?:=>|,)\s*['"]([\d.]+)['"]/, 1]
  raise 'no iOS platform found in ExpoModulesCore.podspec' unless ios_target
  ios_deployment_target = ios_target
rescue => e
  message = "ExpoAdapterGoogleSignIn: could not read iOS deployment target from ExpoModulesCore (#{e}); using #{ios_deployment_target}"
  defined?(Pod::UI) ? Pod::UI.warn(message) : warn(message)
end

Pod::Spec.new do |s|
  s.name           = 'ExpoAdapterGoogleSignIn'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platform       = :ios, ios_deployment_target
  s.swift_version  = '5.4'
  s.source         = { :git => 'https://github.com/react-native-google-signin/google-signin.git', :tag => "v#{package['version']}" }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'React-Core'
  s.dependency "GoogleSignIn", package["GoogleSignInPodVersion"]

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  if !$ExpoUseSources&.include?(package['name']) && ENV['EXPO_USE_SOURCE'].to_i == 0 && File.exist?("#{s.name}.xcframework") && Gem::Version.new(Pod::VERSION) >= Gem::Version.new('1.10.0')
    s.source_files = "#{s.name}/**/*.h"
    s.vendored_frameworks = "#{s.name}.xcframework"
  else
    s.source_files = "#{s.name}/**/*.{h,m,swift}"
  end
end
