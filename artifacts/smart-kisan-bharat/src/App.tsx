import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
// अपने मुख्य डैशबोर्ड/नेविगेशन कॉम्पोनेंट को यहाँ इम्पोर्ट करें
// उदाहरण के लिए: import Dashboard from './src/screens/Dashboard';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />
      {/* यहाँ अपना डैशबोर्ड या नेविगेटर रखें */}
      {/* <Dashboard /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b', // स्मार्ट किसान भारत की डार्क-ग्रीन थीम
  },
});
