//
//  RCTSinglelineTextInputViewAvoidKeyboard.h
//  equix
//
//  Created by ThienCao on 7/14/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "RCTText/RCTBaseTextInputView.h"

NS_ASSUME_NONNULL_BEGIN

@interface RCTSinglelineTextInputViewAvoidKeyboard : RCTBaseTextInputView
@property (nonatomic, assign) BOOL showSoftInputOnFocus;
@end

NS_ASSUME_NONNULL_END
