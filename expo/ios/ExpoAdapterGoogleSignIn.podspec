require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', '..', 'package.json')))

# ExpoAdapterGoogleSignIn imports ExpoModulesCore, so its iOS deployment target
# must be >= ExpoModulesCore's. That floor changes per Expo SDK (SDK 56 = 16.4),
# so derive it from the installed ExpoModulesCore.podspec instead of hardcoding.
ios_deployment_target = '15.1'
begin
  expo_modules_core_dir = File.dirname(
    `node --print "require.resolve('expo-modules-core/package.json', { paths: ['#{__dir__}'] })"`.strip
  )
  ios_platform = Pod::Specification
    .from_file(File.join(expo_modules_core_dir, 'ExpoModulesCore.podspec'))
    .available_platforms
    .find { |platform| platform.name == :ios }
  ios_deployment_target = ios_platform.deployment_target.to_s if ios_platform
rescue => e
  message = "ExpoAdapterGoogleSignIn: could not derive iOS deployment target from ExpoModulesCore (#{e}); using #{ios_deployment_target}"
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
