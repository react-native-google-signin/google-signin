#if canImport(ExpoModulesCore)
import ExpoModulesCore
import GoogleSignIn

public class GoogleSignInAppDelegate: ExpoAppDelegateSubscriber {
  private func handleSignInURL(_ url: URL) throws -> Bool {
    // marked as `throws` to make compiler warning go away
    return GIDSignIn.sharedInstance.handle(url)
  }

  public func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    do {
      // As documented here:
      // https://github.com/google/GoogleSignIn-iOS/issues/547#issuecomment-3658139632
      // added both to handle the bug and as a precaution.
      return try handleSignInURL(url)
    } catch {
      NSLog("[RNGoogleSignIn] Failed to handle sign-in URL: %@", String(describing: error))
      return false
    }
  }
}
#endif
