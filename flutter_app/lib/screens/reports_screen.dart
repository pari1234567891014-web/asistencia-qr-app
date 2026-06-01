import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import '../services/api_service.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({Key? key}) : super(key: key);

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  DateTime _selectedDay = DateTime.now();
  DateTime _focusedDay = DateTime.now();
  List<dynamic> _reports = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchReports(_selectedDay);
  }

  void _fetchReports(DateTime date) async {
    setState(() => _isLoading = true);
    final dateString = "${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}";
    try {
      final reports = await ApiService.getReports(dateString);
      setState(() {
        _reports = reports;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error al cargar reportes')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reportes de Asistencia')),
      body: Column(
        children: [
          TableCalendar(
            locale: 'es_ES', // Calendario en español
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
              _fetchReports(selectedDay);
            },
            calendarStyle: const CalendarStyle(
              selectedDecoration: BoxDecoration(color: Colors.blueAccent, shape: BoxShape.circle),
              todayDecoration: BoxDecoration(color: Colors.orangeAccent, shape: BoxShape.circle),
            ),
          ),
          const Divider(),
          Expanded(
            child: _isLoading 
                ? const Center(child: CircularProgressIndicator())
                : _reports.isEmpty
                    ? const Center(child: Text('No hay registros para esta fecha.', style: TextStyle(fontStyle: FontStyle.italic)))
                    : ListView.builder(
                        itemCount: _reports.length,
                        itemBuilder: (context, index) {
                          final item = _reports[index];
                          final personal = item['personal'] ?? {};
                          final nombreCompleto = "${personal['nombres'] ?? ''} ${personal['apellido_paterno'] ?? ''}".trim();
                          final ci = personal['ci'] ?? 'N/A';
                          
                          final dtEntrada = DateTime.tryParse(item['hora_entrada'] ?? '');
                          final dtSalida = item['hora_salida'] != null ? DateTime.tryParse(item['hora_salida']) : null;
                          
                          final strEntrada = dtEntrada != null ? "${dtEntrada.toLocal().hour.toString().padLeft(2,'0')}:${dtEntrada.toLocal().minute.toString().padLeft(2,'0')}" : '--:--';
                          final strSalida = dtSalida != null ? "${dtSalida.toLocal().hour.toString().padLeft(2,'0')}:${dtSalida.toLocal().minute.toString().padLeft(2,'0')}" : '--:--';

                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: ListTile(
                              leading: const CircleAvatar(backgroundColor: Colors.blueAccent, child: Icon(Icons.person, color: Colors.white)),
                              title: Text('$nombreCompleto (CI: $ci)', style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('Entrada: $strEntrada | Salida: $strSalida\nEstado: ${item['estado']}'),
                              isThreeLine: true,
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
