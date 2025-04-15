# Hệ thống giám sát nhiệt độ, độ ẩm

1. Mô phỏng ESP32 + cảm biến đọc dữ liệu và gửi lên Realtime Database & nếu vượt quá giá trị giới hạn thì sẽ bật điều hòa hoặc quạt
2. Giao diện Web lấy dữ liệu từ Firebase để quan sát và điều chỉnh các thông số

## Cách cài đặt hệ thống để hoạt động trên máy của bạn

* Yêu cầu: Đã cài Docker Desktop

Đối với mô phỏng đọc cảm biến

Cách 1: Chạy Wokwi trên web, đường link: https://wokwi.com/projects/428260644692765697

- Thực hiện theo các hướng dẫn ở phần comment

Cách 2: Chạy Wokwi trên Visual Studio Code

* Tại Realtime Database trên Firebase (start in test mode)
* Cấu trúc Realtime Database gợi ý

  ```bash
  {
    "threshold": {
      "maxTemp": 30,
      "maxHumid": 70,
      "tempThreshold": 0.3,
      "humidThreshold": 3
    },
    "sensor": {
      "temperature": 30,
      "humidity": 40
    },
    "device": {
      "air_conditioner": false,
      "fan": false
    }
  }
  ```
* Lấy các thông tin sau từ Firebase:

  Database URL: https://your-project-id.firebaseio.com/ hoặc https://your-project-id.firebaseio.database.app

  API Key: Tìm ở tab Web API Key
* Cài các extension Wokwi for VS Code, PlatformIO
* Trong VS Code, nhấn F1 hoặc vào thanh tìm kiếm trên cùng, chọn >Wokwi: Request A New License
* Làm theo chỉ dẫn (đăng kí license trên trang web của Wokwi)
* Clone project này về

```bash
git clone https://github.com/leduytan0706/TempHumidMonitor.git
```

* Tạo file secrets.h trong thư mục TempHumid_Sensoor/include, thay các giá trị define: Wifi SSID, Wifi Password, Database URL, API Key, Email và Password của User (nếu có)
* Cài đặt các thư viện sau, nếu như PlatformIO không tự động cài đặt:

1. marcoschwartz/LiquidCrystal_I2C@^1.1.4
2. adafruit/DHT sensor library@^1.4.6
3. mobizt/Firebase Arduino Client Library for ESP8266 and ESP32@^4.4.17

* **Chú ý**: Nếu PlatformIO không tự xác định project thì phải tạo hai cửa số, một cửa sổ cho TempHumid_Sensor và một cửa sổ cho TempHumid_Web
* Trong Firebase, vào mục Project Settings/ Your Apps, tạo Web App (nếu chưa tạo), copy các cấu hình được đề cập và thêm vào đường dẫn TempHumidMonitor/TempHumid_Web/.env như sau:

  ```
  VITE_FIREBASE_API_KEY="Your_Firebase_API_Key"
  VITE_FIREBASE_AUTH_DOMAIN="Your_Firebase_Auth_Domain"
  VITE_FIREBASE_DATABASE_URL="Your_Firebase_Database_URL"
  VITE_FIREBASE_PROJECT_ID="Your_Firebase_Project_ID"
  VITE_FIREBASE_STORAGE_BUCKET="Your_Firebase_Storage_Bucker"
  VITE_FIREBASE_MESSAGING_SENDER_ID="Your_Firebase_Messaging_Sender_ID"
  VITE_FIREBASE_APP_ID=1"Your_Firebase_App_ID"
  VITE_FIREBASE_MEASUREMENT_ID="Your_Firebase_Measurement_ID"

  ```
* Trong cửa sổ TempHumid_Sensor:

  - Nhấn nút sau (biểu tượng V) ở góc trái dưới cùng VS Code để PlatformIO compile code

  ![1744682049210](image/README/1744682049210.png)

  - Sau khi hiện thành công (Success), bấm F1 -> Chọn >Wokwi: Start Simulator
* Trong cửa sổ TempHumid_Web:

  - Mở Terminal, di chuyển tới thư mục vite-project
  - Build app bằng Docker:

    ```bash
    docker build -t my-vite-app .
    ```

    - Chạy app:

```bash
docker run -p 8080:80 my-vite-app
```

- Khi đó Web sẽ chạy ở http://localhost:8080
- Điều chỉnh cảm biến ở màn hình mô phỏng để thấy các thông báo và các thay đổi trên realtime database và trên giao diện web
