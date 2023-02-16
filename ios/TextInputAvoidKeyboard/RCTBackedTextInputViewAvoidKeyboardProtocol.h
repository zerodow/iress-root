//
//  RCTBackedTextInputViewAvoidKeyboardProtocol.h
//  equix
//
//  Created by ThienCao on 7/14/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
@protocol RCTBackedTextInputDelegate;

NS_ASSUME_NONNULL_BEGIN

@protocol RCTBackedTextInputViewAvoidKeyboardProtocol <UITextInput>

@property (nonatomic, strong, nullable) UIColor *textColor;
@property (nonatomic, strong, nullable) UIFont *font;
@property (nonatomic, copy, nullable) NSAttributedString *attributedText;
@property (nonatomic, copy, nullable) NSString *placeholder;
@property (nonatomic, strong, nullable) UIView *inputView;
@property (nonatomic, strong, nullable) UIColor *placeholderColor;
@property (nonatomic, assign) NSTextAlignment textAlignment;
@property (nonatomic, assign, readonly) BOOL textWasPasted;
@property (nonatomic, assign) UIEdgeInsets textContainerInset;
@property (nonatomic, strong, nullable) UIView *inputAccessoryView;
@property (nonatomic, weak, nullable) id<RCTBackedTextInputDelegate> textInputDelegate;
@property (nonatomic, readonly) CGSize contentSize;

- (void)setSelectedTextRange:(nullable UITextRange *)selectedTextRange NS_UNAVAILABLE;
- (void)setSelectedTextRange:(nullable UITextRange *)selectedTextRange notifyDelegate:(BOOL)notifyDelegate;

@property (nonatomic, copy, nullable) NSString *text NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
