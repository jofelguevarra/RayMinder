export class BLEConnection {
  constructor() { 
    this.bleDevice = null;
    this.bleCharacteristic = null;
    this.onMessageCallback = null;
    this.facingDirection = null;
  }

  async connectBLE() {
    console.log("Start connection to ESP32...");
    try {
      this.bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'ESP32-C3' }],
        optionalServices: ['12345678-1234-1234-1234-123456789012']
      });

      const server = await this.bleDevice.gatt.connect();
      const service = await server.getPrimaryService('12345678-1234-1234-1234-123456789012');
      this.bleCharacteristic = await service.getCharacteristic('12341234-1234-1234-1234-123412341234');

      // Add listener for incoming messages from ESP32
      await this.bleCharacteristic.startNotifications();
      this.bleCharacteristic.addEventListener('characteristicvaluechanged', this.readMessageFromESP.bind(this));

      console.log("Connected to ESP32 BLE!");
      console.log(this.bleCharacteristic);
    } catch (error) {
      console.error(error);
    }
  }

  async sendMessage(message) {
    if (this.bleCharacteristic) {
      console.log("Sending message " + message);
      await this.bleCharacteristic.writeValue(new TextEncoder().encode(message));
    } else {
      console.log("BLE not connected yet!");
    }
  }

  readMessageFromESP(e) {
    const message = new TextDecoder().decode(e.target.value);
    console.log("Received message:", message);
    if (this.onMessageCallback) this.onMessageCallback(message);
  }

  onMessage(callback) {
    this.onMessageCallback = callback;
  }
}

export const bleConnectionInstance = new BLEConnection();
