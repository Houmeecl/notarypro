import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.vecinoxpress.pos',
  appName: 'VecinoXpress',
  webDir: './client/dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url: 'http://localhost:5000',
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
    buildOptions: {
      keystorePath: './my-release-key.keystore',
      keystorePassword: 'vecinos123',
      keystoreAlias: 'vecinoxpress',
      keystoreAliasPassword: 'vecinos123'
    }
  }
};

export default config;
