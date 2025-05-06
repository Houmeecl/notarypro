import express from 'express';
import path from 'path';

/**
 * Configuración de rutas estáticas para HTML directo
 * Esta función agrega rutas para servir archivos HTML directamente, sin pasar por el frontend de React
 */
export function setupStaticRoutes(app: express.Express) {
  // Rutas especiales para acceso directo a las páginas HTML de RON
  app.get('/ron/cliente', (req, res) => {
    res.sendFile(path.resolve('public/ron-session.html'));
  });
  
  app.get('/ron/certificador', (req, res) => {
    res.sendFile(path.resolve('public/ron-certifier.html'));
  });
  
  // Ruta para la versión App Builder de RON (más moderna y con más funcionalidades)
  app.get('/ron/app', (req, res) => {
    res.sendFile(path.resolve('public/ron-appbuilder.html'));
  });
  
  // Otras rutas estáticas se pueden agregar aquí
  
  console.log('Rutas estáticas para HTML configuradas.');
}