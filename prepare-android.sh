#!/bin/bash

# Script para inicializar el proyecto Android con Capacitor para VecinoXpress

echo "Inicializando proyecto Android para VecinoXpress..."

# Verificar si ya existe la carpeta android
if [ -d "./android" ]; then
  echo "La carpeta android ya existe. Continuando con la sincronización..."
else
  echo "Inicializando proyecto Android con Capacitor..."
  npx cap add android
fi

# Construir la aplicación para asegurarnos de tener los archivos de distribución
echo "Construyendo la aplicación web..."
npm run build

# Sincronizar con Capacitor
echo "Sincronizando recursos con Capacitor..."
npx cap sync android

# Configurar ícono y recursos para VecinoXpress
echo "Configurando recursos de Android para VecinoXpress..."

# Configurar colors.xml para usar el color de VecinoXpress
COLORS_XML="android/app/src/main/res/values/colors.xml"
echo '<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#2d219b</color>
    <color name="colorPrimaryDark">#2d219b</color>
    <color name="colorAccent">#50e3c2</color>
    <color name="ic_launcher_background">#2d219b</color>
</resources>' > "$COLORS_XML"
echo "   Colors.xml actualizado"

# Configurar strings.xml para usar el nombre correcto
STRINGS_XML="android/app/src/main/res/values/strings.xml"
sed -i 's/<string name="app_name">.*<\/string>/<string name="app_name">VecinoXpress<\/string>/g' "$STRINGS_XML"
echo "   Strings.xml actualizado"

# Modificar AndroidManifest.xml para configuraciones específicas
MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
  # Asegurarse de que la orientación sea portrait
  sed -i 's/android:screenOrientation=".*"/android:screenOrientation="portrait"/g' "$MANIFEST"
  
  # Asegurarse de que tengamos los permisos necesarios
  if ! grep -q "android.permission.NFC" "$MANIFEST"; then
    sed -i '/<uses-permission android:name="android.permission.INTERNET"\/>/a\    <uses-permission android:name="android.permission.NFC" />' "$MANIFEST"
  fi
  
  # Activar tema AppTheme.NoActionBar
  sed -i 's/android:theme="@style\/AppTheme"/android:theme="@style\/AppTheme.NoActionBar"/g' "$MANIFEST"
  
  echo "   AndroidManifest.xml actualizado"
else
  echo "   No se encontró AndroidManifest.xml, omitiendo configuraciones"
fi

# Configurar tema sin barra de acción
STYLES_XML="android/app/src/main/res/values/styles.xml"
if [ -f "$STYLES_XML" ]; then
  echo '<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Base application theme -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

    <style name="AppTheme.AppBarOverlay" parent="ThemeOverlay.AppCompat.Dark.ActionBar" />
    <style name="AppTheme.PopupOverlay" parent="ThemeOverlay.AppCompat.Light" />
</resources>' > "$STYLES_XML"
  echo "   Styles.xml actualizado"
else
  echo "   No se encontró styles.xml, omitiendo configuraciones"
fi

echo "Configuración de Android para VecinoXpress completada!"
echo "Ya puedes ejecutar './build-android.sh' para construir la APK optimizada."