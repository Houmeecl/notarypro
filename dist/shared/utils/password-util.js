"use strict";
/**
 * Utilidad para generar contraseñas aleatorias seguras
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomPassword = generateRandomPassword;
/**
 * Genera una contraseña aleatoria segura
 * @param length Longitud de la contraseña (por defecto 10)
 * @param includeUppercase Incluir letras mayúsculas (por defecto true)
 * @param includeNumbers Incluir números (por defecto true)
 * @param includeSymbols Incluir símbolos (por defecto true)
 * @returns Contraseña aleatoria generada
 */
function generateRandomPassword(length = 10, includeUppercase = true, includeNumbers = true, includeSymbols = true) {
    // Caracteres posibles para la contraseña
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_-+=<>?';
    // Inicio con caracteres en minúscula
    let allChars = lowercaseChars;
    // Agregar otros conjuntos de caracteres según sea necesario
    if (includeUppercase)
        allChars += uppercaseChars;
    if (includeNumbers)
        allChars += numberChars;
    if (includeSymbols)
        allChars += symbolChars;
    // Generar la contraseña
    let password = '';
    // Asegurar que la contraseña contenga al menos un carácter de cada tipo incluido
    if (includeUppercase) {
        password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    }
    if (includeNumbers) {
        password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    }
    if (includeSymbols) {
        password += symbolChars.charAt(Math.floor(Math.random() * symbolChars.length));
    }
    // Completar el resto de la contraseña
    while (password.length < length) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars.charAt(randomIndex);
    }
    // Mezclar caracteres para evitar un patrón predecible
    password = shuffleString(password);
    return password;
}
/**
 * Mezcla los caracteres de una cadena aleatoriamente
 * @param str Cadena a mezclar
 * @returns Cadena mezclada
 */
function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}
