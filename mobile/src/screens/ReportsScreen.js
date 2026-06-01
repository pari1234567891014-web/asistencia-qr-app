import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getReports } from '../api/api';

export default function ReportsScreen() {
  const [reportes, setReportes] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);

  const fetchReports = async (fecha) => {
    try {
      const response = await getReports(fecha);
      setReportes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReports(fechaSeleccionada);
  }, [fechaSeleccionada]);

  const renderItem = ({ item }) => {
    const nombreCompleto = item.personal 
      ? `${item.personal.nombres} ${item.personal.apellido_paterno} ${item.personal.apellido_materno}`
      : 'Desconocido';
      
    const horaEntrada = new Date(item.hora_entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const horaSalida = item.hora_salida ? new Date(item.hora_salida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    return (
      <View style={styles.item}>
        <Text style={styles.name}>{nombreCompleto} - CI: {item.personal?.ci}</Text>
        <Text style={styles.times}>Entrada: {horaEntrada} | Salida: {horaSalida}</Text>
        <Text style={styles.status}>Estado: {item.estado}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={day => {
          setFechaSeleccionada(day.dateString);
        }}
        markedDates={{
          [fechaSeleccionada]: {selected: true, disableTouchEvent: true, selectedColor: '#00adf5'}
        }}
      />
      <Text style={styles.subtitle}>Reporte para: {fechaSeleccionada}</Text>
      <FlatList
        data={reportes}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No hay registros para esta fecha.</Text>}
        refreshing={false}
        onRefresh={() => fetchReports(fechaSeleccionada)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  item: { backgroundColor: '#f0f0f0', padding: 15, marginHorizontal: 15, marginVertical: 8, borderRadius: 8, elevation: 2 },
  name: { fontSize: 16, fontWeight: 'bold' },
  times: { marginTop: 5, color: '#555' },
  status: { color: '#007BFF', fontWeight: 'bold', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 20, fontStyle: 'italic', color: '#888' }
});
