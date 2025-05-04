import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.vecinoxpress.pos',
  appName: 'VecinoXpress',
  webDir: './client/dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // URL que utilizará la app para conectarse al servidor
    // En producción, se debe configurar la URL del servidor real
    url: 'https://app.vecinoxpress.cl',
    initialPath: '/vecinos/login'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#2d219b",
      showSpinner: true,
      spinnerColor: "#ffffff",
      androidSpinnerStyle: "large"
    }
  },
  android: {
    flavor: 'vecinoexpress',
    // Optimizaciones para tablet Lenovo
    minSdkVersion: 24, // Compatible con Android 7.0+
    targetSdkVersion: 33, // Android 13
    buildOptions: {
      keystorePath: './my-release-key.keystore',
      keystorePassword: 'vecinos123',
      keystoreAlias: 'vecinoxpress',
      keystoreAliasPassword: 'vecinos123',
      // Habilitar estas opciones para reducir el tamaño de la APK
      minifyEnabled: true,
      shrinkResources: true,
      proguardKeepAttributes: "Signature,Exceptions,InnerClasses,*Annotation*"
    }
  }
};

export default config;
