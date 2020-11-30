import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ReaderView from "./components/ReaderView";

export default function App() {
  return (
    <View style={styles.container}>
      <ReaderView
        url="https://www.nytimes.com/2020/11/30/us/supreme-court-immigrants-redistricting.html"
        // url="http://chuangcn.org/2020/11/delivery-renwu-translation/"
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
