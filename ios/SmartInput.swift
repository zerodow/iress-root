import UIKit

extension UIColor {
  convenience init(hexFromString:String, alpha:CGFloat = 1.0) {
    var cString:String = hexFromString.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
    var rgbValue:UInt32 = 10066329 //color #999999 if string has wrong format
    
    if (cString.hasPrefix("#")) {
      cString.remove(at: cString.startIndex)
    }
    
    if ((cString.count) == 6) {
      Scanner(string: cString).scanHexInt32(&rgbValue)
    }
    
    self.init(
      red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
      green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
      blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
      alpha: alpha
    )
  }
}

@objc(SmartInput)
class SmartInput: UITextField, UITextFieldDelegate {
  @objc var value: NSString = "" {
    didSet {
      self.text = value as String
    }
  }
  @objc var bgColor: NSString = "#ffffff" {
    didSet {
      self.backgroundColor = UIColor(hexFromString: bgColor as String)
    }
  }
  @objc var color: NSString = "#000000" {
    didSet {
      self.textColor = UIColor(hexFromString: color as String)
    }
  }
  @objc var fontSize: NSNumber = 15 {
    didSet {
      self.font = UIFont.systemFont(ofSize: CGFloat(fontSize))
    }
  }
  @objc var editable: Bool = true {
    didSet {
      self.isUserInteractionEnabled = editable == true
    }
  }
  @objc var keyboard: NSString = "" {
    didSet {
      let keyboardName = keyboard as String

      switch keyboardName {
      case "number-pad":
        self.keyboardType = UIKeyboardType.numberPad
      case "decimal-pad":
        self.keyboardType = UIKeyboardType.decimalPad
      case "numeric":
        self.keyboardType = UIKeyboardType.decimalPad
      case "email-address":
        self.keyboardType = UIKeyboardType.emailAddress
      case "phone-pad":
        self.keyboardType = UIKeyboardType.phonePad
      case "ascii-capable":
        self.keyboardType = UIKeyboardType.asciiCapable
      case "numbers-and-punctuation":
        self.keyboardType = UIKeyboardType.numbersAndPunctuation
      case "url":
        self.keyboardType = UIKeyboardType.URL
      case "name-phone-pad":
        self.keyboardType = UIKeyboardType.namePhonePad
      case "twitter":
        self.keyboardType = UIKeyboardType.twitter
      case "web-search":
        self.keyboardType = UIKeyboardType.webSearch
      default:
        self.keyboardType = UIKeyboardType.default
      }
    }
  }
  @objc var pattern: NSString = "\\.*"
  @objc var onUpdate: RCTDirectEventBlock?
  
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    self.frame = frame;
    
    self.addTarget(
      self,
      action: #selector(onEditingChange),
      for: .editingChanged
    )
    
    self.delegate = self
  }
  
  required init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
    let text = (self.text ?? "") as NSString
    
    let newText = text.replacingCharacters(in: range, with: string)
    if let regex = try? NSRegularExpression(pattern: pattern as String, options: .caseInsensitive) {
      return regex.numberOfMatches(in: newText, options: .reportProgress, range: NSRange(location: 0, length: (newText as NSString).length)) > 0
    }
    return false
  }
  
  @objc func onEditingChange() {
    onUpdate!(["value": self.text ?? ""])
  }
}
