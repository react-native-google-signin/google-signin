// swift-tools-version: 6.0
// React Native autolinking resolves these paths from ios/build/generated/autolinking/libs/RNGoogleSignin.

import PackageDescription

let package = Package(
    name: "RNGoogleSignin",
    platforms: [.iOS("15.1")],
    products: [
        .library(name: "RNGoogleSignin", targets: ["RNGoogleSigninTarget"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
        .package(url: "https://github.com/google/GoogleSignIn-iOS", from: "9.0.0"),
    ],
    targets: [
        .target(
            name: "RNGoogleSigninTarget",
            dependencies: [.product(name: "ReactHeaders", package: "ReactNative"), .product(name: "ReactNativeHeaders", package: "ReactNative"), .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"), .product(name: "ReactAppHeaders", package: "React-GeneratedCode"), .product(name: "GoogleSignIn", package: "GoogleSignIn-iOS")],
            // A distinct target name avoids treating RNGoogleSignin.h as an
            // umbrella header alongside the excluded Xcode project.
            path: "ios",
            exclude: ["GoogleSignin.xcodeproj"],
            publicHeadersPath: ".",
            cSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                .headerSearchPath("."),
            ],
            cxxSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                .headerSearchPath("."),
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
            ],
            linkerSettings: [.linkedFramework("UIKit"), .linkedFramework("Foundation"), .linkedFramework("CoreGraphics")]
        ),
    ],
    cxxLanguageStandard: .cxx20
)
