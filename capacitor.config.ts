import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.novira.app',
  appName: 'Novira',
  webDir: 'out',
  server: {
    // Use your live Vercel URL so Server Actions and Supabase work seamlessly.
    // Remove this block to use a local static build instead.
    url: 'https://novira-one.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0c081e',
  },
  android: {
    backgroundColor: '#0c081e',
    allowMixedContent: false,
  },
};

export default config;
