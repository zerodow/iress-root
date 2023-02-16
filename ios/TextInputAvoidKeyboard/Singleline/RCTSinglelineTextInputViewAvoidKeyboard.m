//
//  RCTSinglelineTextInputViewAvoidKeyboard.m
//  equix
//
//  Created by ThienCao on 7/14/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "RCTSinglelineTextInputViewAvoidKeyboard.h"

#import "../RCTBackedTextInputViewAvoidKeyboardProtocol.h"

#import <React/RCTBridge.h>
#import "RCTText/RCTUITextField.h"

@implementation RCTSinglelineTextInputViewAvoidKeyboard
{
  RCTUITextField *_backedTextInputView;
}
- (instancetype)initWithBridge:(RCTBridge *)bridge
{
  if (self = [super initWithBridge:bridge]) {
    // `blurOnSubmit` defaults to `true` for <TextInput multiline={false}> by design.
    self.blurOnSubmit = YES;

    _backedTextInputView = [[RCTUITextField alloc] initWithFrame:self.bounds];
    _backedTextInputView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _backedTextInputView.textInputDelegate = self;

    [self addSubview:_backedTextInputView];
  }

  return self;
}

- (id<RCTBackedTextInputViewAvoidKeyboardProtocol>)backedTextInputView
{
  return _backedTextInputView;
}
- (void)setShowSoftInputOnFocus:(BOOL)showSoftInputOnFocus
{
  if (showSoftInputOnFocus) {
    // Resets to default keyboard.
    _backedTextInputView.inputView = nil;
  } else {
    // Hides keyboard, but keeps blinking cursor.
    _backedTextInputView.inputView = [[UIView alloc] init];
  }
}
/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

@end
