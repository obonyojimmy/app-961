import Foundation
import React

@objc(ReactNativeBridgeHolder)
class ReactNativeBridgeHolder: NSObject {
    static let shared = ReactNativeBridgeHolder()
    var bridge: RCTBridge?
}