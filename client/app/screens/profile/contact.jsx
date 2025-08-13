import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Linking } from 'react-native';
import { scaleFont } from '../../utils/scale-fonts';
import { Images } from '../../utils/assets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Contact() {
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    background: {
      flex: 1
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
    },
    title: {
      fontSize: scaleFont(20),
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 15,
    },
    label: {
      fontSize: scaleFont(16),
      color: 'rgb(0,140,255)',
      marginTop: 15,
      marginBottom: 5,
      fontWeight: 'bold',
    },
    link: {
      fontSize: scaleFont(14),
      color: 'white',
      textDecorationLine: 'underline',
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
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
    socialRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
    },
    socialIcon: {
      width: 24,
      height: 24,
      marginRight: 10,
    },
    socialText: {
      fontSize: scaleFont(15),
      color: 'white',
      textDecorationLine: 'underline',
      justifyContent: 'center'
    },
    emailButton: {
      marginTop: 30,
      backgroundColor: 'rgb(0,140,255)',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    emailButtonText: {
      fontSize: scaleFont(16),
      color: 'white',
      fontWeight: 'bold',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    flyerIcon: {
      width: 20,
      height: 20,
      tintColor: 'white',
      marginRight: 10,
    },
  });

  return (
    <ImageBackground source={Images.darkProfileBackground} resizeMode="cover" style={styles.background}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleContainer}>
            <Image source={Images.contactTwo} style={styles.titleIcon} />
            <Text allowFontScaling={false} style={styles.titleText}>Get in Touch</Text>
          </View>

          <Text allowFontScaling={false} style={styles.label}>Live Chat</Text>
          <Text allowFontScaling={false} style={styles.link}>
            Reach us instantly via the in-app chat on weekdays 9AM–6PM.
          </Text>

          <Text allowFontScaling={false} style={styles.label}>Phone</Text>
          <TouchableOpacity onPress={() => Linking.openURL('tel:+1234567890')}>
            <Text allowFontScaling={false} style={styles.link}>+1 (234) 567-890</Text>
          </TouchableOpacity>

          <Text allowFontScaling={false} style={styles.label}>Social Media</Text>
          <TouchableOpacity style={styles.socialRow} onPress={() => Linking.openURL('https://instagram.com/promanager')}>
            <Image source={Images.instagram} style={styles.socialIcon} />
            <Text allowFontScaling={false} style={styles.socialText}>@promanager</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialRow} onPress={() => Linking.openURL('https://facebook.com/promanager')}>
            <Image source={Images.facebook} style={styles.socialIcon} />
            <Text allowFontScaling={false} style={styles.socialText}>@promanager</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialRow} onPress={() => Linking.openURL('https://linkedin.com/company/promanager')}>
            <Image source={Images.linkedIn} style={styles.socialIcon} />
            <Text allowFontScaling={false} style={styles.socialText}>Pro Manager</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.emailButton}
            onPress={() => Linking.openURL('mailto:support@promanager.app')}
          >
            <View style={styles.buttonContent}>
              <Image source={Images.paperAirplane} style={styles.flyerIcon} />
              <Text allowFontScaling={false} style={styles.emailButtonText}>Send Us a Message</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

