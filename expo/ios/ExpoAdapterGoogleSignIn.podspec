require 'json'
require_relative '../../ios/dependency_manager'

package = JSON.parse(File.read(File.join(__dir__, '..', '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoAdapterGoogleSignIn'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platform       = :ios, '13.4'
  s.swift_version  = '5.4'
  s.source         = { :git => 'https://github.com/react-native-google-signin/google-signin.git', :tag => "v#{package['version']}" }
  s.static_framework = true
  use_spm = rngooglesignin_use_spm?

  s.dependency 'ExpoModulesCore'
  s.dependency 'React-Core'

  if use_spm
    # GoogleSignIn comes from SPM and is linked into RNGoogleSignin only. This pod is a static
    # framework, so linking GoogleSignIn here too would put a second copy of the SDK into the app.
    # GoogleSignInAppDelegate calls RNGoogleSigninHandleURL (RNGoogleSignin) instead.
    s.dependency 'RNGoogleSignin'
  else
    s.dependency "GoogleSignIn", package["GoogleSignInPodVersion"]

    # Expo gives direct dependencies of Expo modules modular headers. AppCheckCore,
    # pulled in by GoogleSignIn, imports these Objective-C pods from Swift.
    s.dependency 'GoogleUtilities/Environment'
    s.dependency 'GoogleUtilities/UserDefaults'
    s.dependency 'RecaptchaInterop'
  end

  # Swift/Objective-C compatibility
  xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }
  # Selects RNGoogleSigninHandleURL in GoogleSignInAppDelegate.swift
  xcconfig['SWIFT_ACTIVE_COMPILATION_CONDITIONS'] = '$(inherited) RNGOOGLESIGNIN_SPM' if use_spm
  s.pod_target_xcconfig = xcconfig

  if !$ExpoUseSources&.include?(package['name']) && ENV['EXPO_USE_SOURCE'].to_i == 0 && File.exist?("#{s.name}.xcframework") && Gem::Version.new(Pod::VERSION) >= Gem::Version.new('1.10.0')
    s.source_files = "#{s.name}/**/*.h"
    s.vendored_frameworks = "#{s.name}.xcframework"
  else
    s.source_files = "#{s.name}/**/*.{h,m,swift}"
  end
end
