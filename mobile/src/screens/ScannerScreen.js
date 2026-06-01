import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { scanQRCode } from '../api/api';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    try {
      const response = await scanQRCode(data);
      Alert.alert('Éxito', response.data.message);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al escanear QR');
    }
  };

  if (hasPermission === null) {
    return <Text style={styles.centerText}>Solicitando permiso de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.centerText}>No se tiene acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <View style={styles.buttonContainer}>
          <Button title={'Escanear de Nuevo'} onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  centerText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  }
});
