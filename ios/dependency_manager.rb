# Shared by RNGoogleSignin.podspec and ExpoAdapterGoogleSignIn.podspec.
#
# Picks how the GoogleSignIn SDK is resolved on iOS. CocoaPods is the default. To use
# Swift Package Manager instead, set this in the Podfile, before the target blocks:
#
#   $RNGoogleSigninDependencyManager = 'spm'
#
# SPM is for apps that already resolve Google's SDKs through SPM, e.g. React Native
# Firebase 27+ (Firebase 13 is SPM-only). Mixing the two would link GTMSessionFetcher,
# GoogleUtilities and the other shared libraries twice.

GOOGLE_SIGN_IN_SPM_URL = 'https://github.com/google/GoogleSignIn-iOS.git'

def rngooglesignin_use_spm?
  manager = ($RNGoogleSigninDependencyManager || 'cocoapods').to_s
  case manager
  when 'cocoapods'
    false
  when 'spm'
    unless defined?(spm_dependency)
      raise Pod::Informative, "[RNGoogleSignin] $RNGoogleSigninDependencyManager = 'spm' needs React Native 0.75 or newer (spm_dependency)."
    end
    true
  else
    raise Pod::Informative, "[RNGoogleSignin] Unknown $RNGoogleSigninDependencyManager '#{manager}'. Use 'cocoapods' or 'spm'."
  end
end
