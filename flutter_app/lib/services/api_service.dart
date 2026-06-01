import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://asistencia-qr-app.onrender.com/api';

  static Future<Map<String, dynamic>> loginAdmin(String login, String contrasena) async {
    final response = await http.post(
      Uri.parse('$baseUrl/admin/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'login': login, 'contrasena': contrasena}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('isLogged', true);
      return {'success': true, 'data': data};
    } else {
      return {'success': false, 'error': data['error']};
    }
  }

  static Future<Map<String, dynamic>> scanQR(String qrToken) async {
    final response = await http.post(
      Uri.parse('$baseUrl/asistencia/scan'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'qr_token': qrToken}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'success': true, 'message': data['message']};
    } else {
      return {'success': false, 'error': data['error'] ?? 'Error desconocido'};
    }
  }

  static Future<List<dynamic>> getReports(String fecha) async {
    final response = await http.get(Uri.parse('$baseUrl/reportes?fecha=$fecha'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al cargar reportes');
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
