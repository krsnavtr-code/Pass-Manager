import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, Alert } from 'react-native';

/**
 * Refined Props: We ensure href is strictly a string when dealing with 
 * external web URLs to satisfy the expo-web-browser requirements.
 */
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href as Href}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // 1. Prevent the default behavior of opening the system browser
          event.preventDefault();

          try {
            // 2. Open the link in a secure in-app browser
            // Using AUTOMATIC ensures it feels like a native "Sheet" on iOS
            await openBrowserAsync(href, {
              presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
              enableBarCollapsing: true,
              toolbarColor: '#007AFF', // Aligns with your brand color
            });
          } catch (error) {
            Alert.alert(
              "Browser Error",
              "Unable to open this link. Please check your internet connection."
            );
          }
        }
      }}
    />
  );
}