require "json"
require_relative "ios/dependency_manager"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
use_spm = rngooglesignin_use_spm?

Pod::Spec.new do |s|
  s.name         = "RNGoogleSignin"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => use_spm ? GOOGLE_SIGN_IN_SPM_MIN_IOS : "10.0" }
  # source should not really matter in RN but it's required
  s.source       = { :git => "https://github.com/react-native-google-signin/google-signin-next.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm}"

  if use_spm
    spm_dependency(s,
      url: GOOGLE_SIGN_IN_SPM_URL,
      requirement: { kind: "upToNextMajorVersion", minimumVersion: package["GoogleSignInPodVersion"] },
      products: ["GoogleSignIn"]
    )
  else
    s.dependency "GoogleSignIn", package["GoogleSignInPodVersion"]
  end

  if ENV['RCT_NEW_ARCH_ENABLED'] == '1'
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
  end
end
