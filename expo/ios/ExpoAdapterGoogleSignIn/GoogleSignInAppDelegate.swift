#if canImport(ExpoModulesCore)
import ExpoModulesCore
import GoogleSignIn

public class GoogleSignInAppDelegate: ExpoAppDelegateSubscriber {
  public func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    do {
      // As documented here:
      // https://github.com/google/GoogleSignIn-iOS/issues/547#issuecomment-3658139632
      var result = false
      try ObjCExceptionHandler.tryCatch {
        result = GIDSignIn.sharedInstance.handle(url)
      }
      return result
    } catch {
      NSLog("[RNGoogleSignIn] Failed to handle sign-in URL: %@", String(describing: error))
      return false
    }
  }
}
#endif
