//
//  CounterViewManager.m
//  customInput
//
//  Created by vuhoangha on 3/30/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "React/RCTViewManager.h"
@interface RCT_EXTERN_MODULE(SmartInputManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(value, NSString)
RCT_EXPORT_VIEW_PROPERTY(pattern, NSString)
RCT_EXPORT_VIEW_PROPERTY(bgColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(color, NSString)
RCT_EXPORT_VIEW_PROPERTY(keyboard, NSString)
RCT_EXPORT_VIEW_PROPERTY(editable, BOOL)
RCT_EXPORT_VIEW_PROPERTY(fontSize, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(onUpdate, RCTDirectEventBlock)

@end
