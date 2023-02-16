//
//  RCTSinglelineTextInputViewAvoidKeyboardManager.m
//  equix
//
//  Created by ThienCao on 7/14/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "RCTSinglelineTextInputViewAvoidKeyboardManager.h"

#import "RCTText/RCTBaseTextInputShadowView.h"
#import "RCTText/RCTSinglelineTextInputView.h"
#import "RCTSinglelineTextInputViewAvoidKeyboard.h"
@implementation RCTSinglelineTextInputViewAvoidKeyboardManager
RCT_EXPORT_MODULE(RCTSinglelineTextInputViewAvoidKeyboard)
RCT_EXPORT_VIEW_PROPERTY(showSoftInputOnFocus, BOOL)
/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/
- (RCTShadowView *)shadowView
{
  RCTBaseTextInputShadowView *shadowView =
    (RCTBaseTextInputShadowView *)[super shadowView];

  shadowView.maximumNumberOfLines = 1;

  return shadowView;
}

- (UIView *)view
{
  return [[RCTSinglelineTextInputViewAvoidKeyboard alloc] initWithBridge:self.bridge];
}
@end
