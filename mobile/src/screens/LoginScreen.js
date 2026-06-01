import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { loginAdmin } from '../api/api';

export default function LoginScreen({ navigation }) {
  const [login, setLogin] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleLogin = async () => {
    try {
      const response = await loginAdmin(login, contrasena);
      if (response.data.message === 'Login exitoso') {
        navigation.replace('Main');
      }
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control de Asistencia</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuario Admin"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={contrasena}
        onChangeText={setContrasena}
      />
      <Button title="Ingresar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 }
});
