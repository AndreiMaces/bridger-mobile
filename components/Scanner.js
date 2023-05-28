import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, AppState } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Sensors from "expo-sensors";
import * as Network from "expo-network";
import io from "socket.io-client";
import { sha256 } from "js-sha256";
import * as Device from "expo-device";

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);
  const socket = io("https://api.watch.macesandrei.com", {
    path: "",
    forceNew: true,
    reconnectionAttempts: 3,
    timeout: 2000,
  });
  socket.on("connect", () => {
    console.log("connected");
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
  });
  socket.on("connect_error", (err) => {
    console.log(err);
  });

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    usID = data;
    const deviceIp = await Network.getIpAddressAsync();
    const link = sha256(data + deviceIp);
    socket.emit("join", {
      userId: data,
      deviceIp,
      deviceInfo: Device,
    });
    console.log(data);

    Sensors.Gyroscope.addListener((gyroscopeData) => {
      socket.emit(link + "gyroscope", gyroscopeData);
    });

    Sensors.Accelerometer.addListener((accelerometerData) => {
      socket.emit(link + "accelerometer", accelerometerData);
    });
    Sensors.Magnetometer.addListener((magnetometerData) => {
      socket.emit(link + "magnetometer", magnetometerData);
    });
    Sensors.Barometer.addListener((barometerData) => {
      socket.emit(link + "barometer", barometerData);
    });
    Sensors.LightSensor.addListener((lightSensorData) => {
      socket.emit(link + "lightSensor", lightSensorData);
    });
    Sensors.DeviceMotion.addListener((deviceMotionData) => {
      socket.emit(link + "deviceMotion", deviceMotionData);
    });
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});
