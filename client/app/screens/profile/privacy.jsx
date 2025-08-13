import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { scaleFont } from '../../utils/scale-fonts';
import { Images } from '../../utils/assets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Privacy() {
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.65)',
      paddingTop: 50,
      paddingBottom: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
      paddingRight: 15,
    },
    backIcon: {
      width: 20,
      height: 20,
      tintColor: 'rgb(0,140,255)',
      transform: [{ scaleX: -1 }],
    },
    headerTitle: {
      fontSize: scaleFont(18),
      color: 'rgb(0,140,255)',
      fontWeight: 'bold',
    },
    content: {
      paddingTop: insets.top + 100,
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 20
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    titleIcon: {
      width: 25,
      height: 25,
      tintColor: 'rgb(0,140,255)',
      marginRight: 10,
    },
    titleText: {
      fontSize: scaleFont(20),
      fontWeight: 'bold',
      color: 'white',
    },
    sectionTitle: {
      fontSize: scaleFont(16),
      fontWeight: 'bold',
      color: 'rgb(0,140,255)',
      marginTop: 20,
    },
    paragraph: {
      fontSize: scaleFont(14),
      color: 'white',
      marginTop: 10,
      lineHeight: 22,
    },
  });

  return (
    <ImageBackground source={Images.darkProfileBackground} resizeMode="cover" style={styles.background}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleContainer}>
            <Image source={Images.privacy} style={styles.titleIcon} />
            <Text allowFontScaling={false} style={styles.titleText}>Our Privacy Policies</Text>
          </View>

          <Text allowFontScaling={false} style={styles.sectionTitle}>1. Introduction</Text>
          <Text allowFontScaling={false} style={styles.paragraph}>
            This Privacy Policy explains how we collect, use, and protect your information when you use the Pro Manager mobile application.
          </Text>

          <Text allowFontScaling={false} style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text allowFontScaling={false} style={styles.paragraph}>
            We collect personal details such as name, email, phone number, and account type (athlete or coach). We also gather app usage data to improve user experience.
          </Text>

          <Text allowFontScaling={false} style={styles.sectionTitle}>3. Use of Information</Text>
          <Text allowFontScaling={false} style={styles.paragraph}>
            Your data is used to manage your account, connect you with other users, enhance the platform, and send updates relevant to your usage.
          </Text>

          <Text allowFontScaling={false} style={styles.sectionTitle}>4. Data Sharing</Text>
          <Text allowFontScaling={false} style={styles.paragraph}>
            We do not sell or rent your personal data. Limited data may be shared with service providers under strict confidentiality or as required by law.
          </Text>

          <Text allowFontScaling={false} style={styles.sectionTitle}>5. Security</Text>
          <Text allowFontScaling={false} style={styles.paragraph}>
            We implement standard security measures to protect your information, but no method of transmission is completely secure.
          </Text>

          <Text allowFontScaling={false} style={styles.sectionTitle}>6. Your Rights</Text>
          <Text allowFontScaling={false} style={styles.paragraph}>
            You may update or delete your personal information at any time through your account settings, or request deletion by contacting us.
          </Text>

          <Text allowFontScaling={false} style={styles.sectionTitle}>7. Changes to This Policy</Text>
          <Text allowFontScaling={false} style={styles.paragraph}>
            We may update this policy from time to time. Changes will be posted in the app with a new effective date.
          </Text>

          <Text allowFontScaling={false} style={styles.sectionTitle}>8. Contact</Text>
          <Text allowFontScaling={false} style={styles.paragraph}>
            For questions or concerns, please contact us at: support@promanager.app
          </Text>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

