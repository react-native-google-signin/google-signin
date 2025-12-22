#if canImport(ExpoModulesCore) 
import ExpoModulesCore
import GoogleSignIn
import Foundation

public class GoogleSignInAppDelegate: ExpoAppDelegateSubscriber {
  public func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // If Firebase is configured and swizzling is enabled, GULAppDelegateSwizzler (from GoogleUtilities)
    // will handle the URL. Calling GIDSignIn.sharedInstance.handle(url) here would be redundant and
    // can cause a crash (fatal error: OIDExternalUserAgentSession already completed).
    if isFirebaseSwizzlingEnabled() {
      return false
    }
    return GIDSignIn.sharedInstance.handle(url)
  }

  private func isFirebaseSwizzlingEnabled() -> Bool {
    // Check if FirebaseAppDelegateProxyEnabled is explicitly disabled
    // If the key is missing, it defaults to true (enabled)
    if let proxyEnabled = Bundle.main.object(forInfoDictionaryKey: "FirebaseAppDelegateProxyEnabled") as? Bool, !proxyEnabled {
      return false
    }

    // Check if FIRApp class is available (FirebaseCore is linked)
    guard let firAppClass = NSClassFromString("FIRApp") as? NSObject.Type else {
      return false
    }

    // Check if Firebase is configured
    // If Firebase is linked but not configured (e.g. early in startup or intentionally unused),
    // the swizzler might not be active or we shouldn't rely on it.
    let selector = NSSelectorFromString("defaultApp")
    if firAppClass.responds(to: selector),
       firAppClass.perform(selector) != nil {
      return true
    }

    return false
  }
}
#endif