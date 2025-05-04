import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.vecinoxpress.pos',
  appName: 'VecinoXpress POS',
  webDir: './client/dist',
  server: {
    androidScheme: 'https',
    cleartext: true
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
    buildOptions: {
      keystorePath: './my-release-key.keystore',
      keystorePassword: 'vecinos123',
      keystoreAlias: 'vecinoxpress',
      keystoreAliasPassword: 'vecinos123'
    }
  }
};

export default config;
