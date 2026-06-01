const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Rutas Básicas ---
app.get('/', (req, res) => {
    res.json({ message: 'API de Asistencia QR funcionando' });
});

// --- Administradores ---
app.post('/api/admin/login', async (req, res) => {
    const { login, contrasena } = req.body;
    
    // NOTA: En producción deberías usar bcrypt para comparar contraseñas hasheadas.
    const { data, error } = await supabase
        .from('administradores')
        .select('*')
        .eq('login', login)
        .eq('contrasena', contrasena)
        .single();
        
    if (error || !data) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    res.json({ message: 'Login exitoso', admin: data });
});

// --- Asistencias (Escanear QR) ---
app.post('/api/asistencia/scan', async (req, res) => {
    const { qr_token } = req.body;
    
    if (!qr_token) {
        return res.status(400).json({ error: 'Token QR requerido' });
    }
    
    // 1. Buscar a la persona por su QR token
    const { data: persona, error: personError } = await supabase
        .from('personal')
        .select('id')
        .eq('codigo_qr_token', qr_token)
        .single();
        
    if (personError || !persona) {
        return res.status(404).json({ error: 'QR no registrado o inválido' });
    }
    
    // 2. Verificar si ya tiene una entrada hoy (sin salida)
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const { data: asistenciaActual, error: asistenciaError } = await supabase
        .from('asistencias')
        .select('*')
        .eq('personal_id', persona.id)
        .eq('fecha', hoy)
        .is('hora_salida', null)
        .single();
        
    if (asistenciaActual) {
        // Registrar Salida
        const { data: updateData, error: updateError } = await supabase
            .from('asistencias')
            .update({ hora_salida: new Date().toISOString() })
            .eq('id', asistenciaActual.id)
            .select();
            
        if (updateError) return res.status(500).json({ error: updateError.message });
        return res.json({ message: 'Salida registrada con éxito', data: updateData });
    } else {
        // Registrar Entrada
        // TODO: Lógica para determinar 'ATRASO' basado en la hora. Por ahora fijo en 'PRESENTE'
        const { data: insertData, error: insertError } = await supabase
            .from('asistencias')
            .insert([{ 
                personal_id: persona.id, 
                fecha: hoy, 
                estado: 'PRESENTE' 
            }])
            .select();
            
        if (insertError) return res.status(500).json({ error: insertError.message });
        return res.json({ message: 'Entrada registrada con éxito', data: insertData });
    }
});

// --- Reportes ---
app.get('/api/reportes', async (req, res) => {
    const { fecha, mes, anio } = req.query;
    
    let query = supabase
        .from('asistencias')
        .select(`
            *,
            personal (
                nombres,
                apellido_paterno,
                apellido_materno,
                ci
            )
        `);
        
    // Filtro por fecha específica (YYYY-MM-DD)
    if (fecha) {
        query = query.eq('fecha', fecha);
    }
    
    // Filtros por mes/año simplificados
    if (anio && mes) {
        query = query.gte('fecha', `${anio}-${mes}-01`)
                     .lte('fecha', `${anio}-${mes}-31`);
    } else if (anio) {
        query = query.gte('fecha', `${anio}-01-01`)
                     .lte('fecha', `${anio}-12-31`);
    }
    
    // Ordenar por fecha de entrada (más reciente primero)
    query = query.order('hora_entrada', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    
    res.json(data);
});

// --- Personal (Registrados) ---
app.get('/api/personal', async (req, res) => {
    const { data, error } = await supabase.from('personal').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/personal', async (req, res) => {
    const { nombres, apellido_paterno, apellido_materno, ci, codigo_qr_token } = req.body;
    
    const { data, error } = await supabase
        .from('personal')
        .insert([{ nombres, apellido_paterno, apellido_materno, ci, codigo_qr_token }])
        .select();
        
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Personal registrado con éxito', personal: data });
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
