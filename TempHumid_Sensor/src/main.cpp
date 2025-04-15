#include <WiFi.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <Firebase_ESP_Client.h>
// Thêm các tiêu đề hỗ trợ token
#include "addons/TokenHelper.h"
// Thêm các tiêu đề hỗ trợ RTDB
#include "addons/RTDBHelper.h"
// Cấu hình WiFi
// Cấu hình Firebase
// Cấu hình tài khoản Firebase (tùy chọn)
#include "secrets.h" // Thư mục chứa thông tin cấu hình WiFi, Firebase và tài khoản

#define DHTPIN 14         // Chân kết nối DHT22
#define DHTTYPE DHT22    // Loại cảm biến DHT22
#define RELAY_AC_PIN 4   // Chân kết nối relay AC
#define RELAY_FAN_PIN 5  // Chân kết nối relay FAN

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Định nghĩa đối tượng Firebase Data
FirebaseData fbdo;
FirebaseData stream;  // Đối tượng stream riêng biệt để theo dõi thay đổi
FirebaseAuth auth;
FirebaseConfig config;

// Biến trạng thái xác thực
bool signupOK = false;

// Các biến sẽ được cập nhật khi dữ liệu thay đổi
float max_temp = 30.0;
float max_humid = 50.0;
float temp_diff = 0.2;
float humid_diff = 3;
bool isACOn = false;
bool isFanOn = false;

// Hàm callback xử lý khi có thay đổi từ stream
void streamCallback(FirebaseStream data){
    // In đường dẫn của dữ liệu đã thay đổi
    Serial.printf("Phát hiện thay đổi tại đường dẫn: %s\n", data.dataPath().c_str());
    Serial.printf("Đường dẫn theo dõi: %s\n", data.streamPath().c_str());
    
    // In toàn bộ nội dung dữ liệu
    Serial.printf("Dữ liệu: %.2f\n", data.doubleData());

    // Kiểm tra đường dẫn có thay đổi và cập nhật biến tương ứng
    String path = data.dataPath();
    Serial.println(path);
    
    // Xử lý khi đường dẫn là maxTemp
    if (path == "/maxTemp") {
        if (data.dataType() == "float" || data.dataType() == "double") {
          // Cập nhật ngưỡng tối đa của nhiệt độ
          max_temp = data.doubleData();
          Serial.printf("Cập nhật giá trị giới hạn nhiệt độ: %.2f\n", max_temp);
        }
    }

    else if (path == "/maxHumid") {
        if (data.dataType() == "float" || data.dataType() == "double") {
          // Cập nhật ngưỡng tối đa của độ ẩm
          max_humid = data.doubleData();
          Serial.printf("Cập nhật giá trị giới hạn độ ẩm: %.2f\n", max_humid);
        }
    }

    Serial.println("---");
}

// Hàm callback khi stream bị timeout hoặc ngắt kết nối
void streamTimeoutCallback(bool timeout){
  if (timeout) {
      Serial.println("Stream bị timeout, sẽ tiếp tục lại sau...");
  }

  if (!stream.httpConnected()) {
      Serial.printf("Lỗi stream: %d, Chi tiết: %s\n", stream.httpCode(), stream.errorReason().c_str());
  }
}


void setup() {
  Serial.begin(115200);

  pinMode(RELAY_AC_PIN, OUTPUT);
  pinMode(RELAY_FAN_PIN, OUTPUT);

  // Tắt cả 2 khi bắt đầu
  digitalWrite(RELAY_AC_PIN, LOW);
  digitalWrite(RELAY_FAN_PIN, LOW);

  while (!Serial); // Chờ kết nối
  Serial.println("Đang khởi tạo...");
  // Khởi tạo LCD với 16 cột và 2 dòng
  lcd.init(); // Sử dụng lcd.init() thay vì lcd.begin()
  lcd.backlight();
  // Khởi tạo cảm biến DHT
  dht.begin();
  // Quét I2C để kiểm tra địa chỉ
  Wire.begin();
  Serial.println("I2C Scanner");
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("I2C device found at address 0x");
      if (addr < 16) Serial.print("0");
      Serial.print(addr, HEX);
      Serial.println(" !");
    }
  }
  Serial.println("Khởi tạo xong LCD.");
  
  // Kết nối WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Đang kết nối WiFi...");
  
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  
  Serial.println();
  Serial.print("Đã kết nối WiFi, địa chỉ IP: ");
  Serial.println(WiFi.localIP());
  
  // Cấu hình Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  
  // Xác thực với Firebase sử dụng email/password
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Kích hoạt tự động kết nối lại
  config.timeout.serverResponse = 10000;
  // Giúp phát hiện và hiển thị lỗi token
  config.token_status_callback = tokenStatusCallback; // từ TokenHelper.h

  
  Serial.println("Bắt đầu kết nối Firebase...");

  // Đặt kích thước bộ nhớ buffer
  fbdo.setBSSLBufferSize(2048 /* Rx buffer size in bytes from 512 - 16384 */, 1024 /* Tx buffer size in bytes from 512 - 16384 */);
  
  // Khởi tạo kết nối Firebase
  Firebase.begin(&config, &auth);

  Firebase.reconnectWiFi(true);
  
  // Đợi xác thực hoàn tất
  Serial.print("Đang kết nối tới Firebase... ");
  
  unsigned long ms = millis();
  while ((millis() - ms) < 10000 && !Firebase.ready()) {
    Serial.print(".");
    delay(300);
  }
  
  Serial.println(Firebase.ready());
  
  if (Firebase.ready()) {
    Serial.println("Đã kết nối thành công!");
    signupOK = true;
    
    // Thiết lập Stream để theo dõi thay đổi 
    if (!Firebase.RTDB.beginStream(&stream, "/threshold"))
      Serial.printf("beginStream error, %s\n", stream.errorReason().c_str());
    
    // Đăng ký callback functions khi dữ liệu thay đổi và khi mất kết nối
    Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeoutCallback);
  } else {
    Serial.println("Không thể kết nối!");
  }

  Firebase.setDoubleDigits(5);
  
  // Kích hoạt tự động kết nối lại
  Firebase.reconnectWiFi(true);

  // Lấy giới hạn nhiệt độ và độ ẩm từ firebase
  if (Firebase.RTDB.getJSON(&fbdo, "/threshold")) {
    FirebaseJson &json = fbdo.jsonObject();
  
    FirebaseJsonData value;
  
    if (json.get(value, "maxTemp") == 0) max_temp = value.to<float>();
    if (json.get(value, "maxHumid") == 0) max_humid = value.to<float>();;
    if (json.get(value, "tempThreshold") == 0) temp_diff = value.to<float>();;
    if (json.get(value, "humidThreshold") == 0) humid_diff = value.to<float>();;
  
    Serial.printf("max_temp: %.2f\n", max_temp);
    Serial.printf("max_humid: %.2f\n", max_humid);
    Serial.printf("min_temp: %.2f\n", temp_diff);
    Serial.printf("min_humid: %.2f\n", humid_diff);
    Serial.println();
  } else {
    Serial.print("Lỗi lấy JSON: ");
    Serial.println(fbdo.errorReason());
  }
}

void loop() {


  // Stream callback sẽ được gọi tự động khi dữ liệu thay đổi
  
  // Đọc cảm biến
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(h) || isnan(t)) {
    Serial.println("Xảy ra sự cố khi đọc cảm biến DHT22!");
    lcd.setCursor(0, 0);
    lcd.print("Không thể đọc");
    lcd.setCursor(0, 1);
    lcd.print("từ cảm biến DHT");
    return;
  }

  // Hiển thị kết quả lên Serial để kiểm tra
  Serial.printf("Nhiệt độ: %2fC, Độ ẩm: %.2f%\n",t,h);
  Serial.println();
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(t);
  lcd.print(" C");
  lcd.setCursor(0, 1);
  lcd.print("Humid: ");
  lcd.print(h);
  lcd.print(" %");

  static bool lastACStatus = false; // Khởi tạo biến static lưu lại trạng thái điều hòa
  static bool lastFanStatus = false; // Khởi tạo biến static lưu lại trạng thái quạt

  isACOn = (t > max_temp); // Kiểm tra điều kiện ngưỡng nhiệt độ tối đa hiện tại
  isFanOn = (h > max_humid); // Kiểm tra điều kiện ngưỡng độ ẩm tối đa hiện tại

  if (isACOn != lastACStatus){
    digitalWrite(RELAY_AC_PIN, isACOn ? HIGH : LOW);
    Firebase.RTDB.setBool(&fbdo, "/device/air_conditioner", isACOn);
    Serial.println(isACOn ? "Bật điều hòa" : "Tắt điều hòa");
    lastACStatus = isACOn; // Lưu lại trạng thái hiện tại của điều hòa
  }

  if (isFanOn != lastFanStatus) {
    digitalWrite(RELAY_FAN_PIN, isFanOn ? HIGH : LOW);
    Firebase.RTDB.setBool(&fbdo, "/device/fan", isFanOn);
    Serial.println(isFanOn ? "Bật quạt" : "Tắt quạt");
    lastFanStatus = isFanOn; // Lưu lại trạng thái hiện tại của quạt
  }

  static float lastTemp = -999; // Khởi tạo biến status lưu lại nhiệt độ hiện tại
  static float lastHumid = -999; // Khởi tạo biến status lưu lại độ ẩm hiện tại

  // Nếu chênh lệch nhiệt độ lớn hơn ngưỡng quy định, lưu vào firebase
  if (abs(t - lastTemp) >= temp_diff) {
    Firebase.RTDB.setDouble(&fbdo, "/sensor/temperature", t);
    lastTemp = t;
  }

  // Nếu chênh lệch độ ẩm lớn hơn ngưỡng quy định, lưu vào firebase
  if (abs(h - lastHumid) >= humid_diff) {
    Firebase.RTDB.setDouble(&fbdo, "/sensor/humidity", h);
    lastHumid = h;
  }
  

  // đợi khoảng 3 phút trước khi tiếp tục đo
  delay(10000);
}