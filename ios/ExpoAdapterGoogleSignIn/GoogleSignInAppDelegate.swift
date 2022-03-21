#if canImport(ExpoModulesCore) 
import ExpoModulesCore
import GoogleSignIn

public class GoogleSignInAppDelegate: ExpoAppDelegateSubscriber {
  public func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return GIDSignIn.sharedInstance.handle(url)
  }
}
#endif
