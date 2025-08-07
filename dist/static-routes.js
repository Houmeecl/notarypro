"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStaticRoutes = setupStaticRoutes;
const path_1 = __importDefault(require("path"));
/**
 * Configuración de rutas estáticas para HTML directo
 * Esta función agrega rutas para servir archivos HTML directamente, sin pasar por el frontend de React
 */
function setupStaticRoutes(app) {
    // Rutas especiales para acceso directo a las páginas HTML de RON
    app.get('/ron/cliente', (req, res) => {
        res.sendFile(path_1.default.resolve('public/ron-session.html'));
    });
    app.get('/ron/certificador', (req, res) => {
        res.sendFile(path_1.default.resolve('public/ron-certifier.html'));
    });
    // Ruta para la versión App Builder de RON (más moderna y con más funcionalidades)
    app.get('/ron/app', (req, res) => {
        res.sendFile(path_1.default.resolve('public/ron-appbuilder.html'));
    });
    // Otras rutas estáticas se pueden agregar aquí
    console.log('Rutas estáticas para HTML configuradas.');
}
