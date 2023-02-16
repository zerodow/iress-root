//
//  CounterViewManager.swift
//  customInput
//
//  Created by vuhoangha on 3/30/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

@objc(SmartInputManager)
class SmartInputManager: RCTViewManager {
  override func view() -> UIView! {
    return SmartInput()
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
