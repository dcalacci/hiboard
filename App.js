import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

import ReaderView from "./components/ReaderView";
import ApiTokenInput from "./components/PinboardLogin";
import PinboardListView from "./components/PinboardListView";
import PdfView from "./components/PdfView";
// import SimplePdfView from "./components/SimplePdfView";

// const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const proxyUrl = "";
export default function App() {
  const [apiToken, setApiToken] = useState("");
  const [currentArticleUrl, setCurrentArticleUrl] = useState("");

  const BackToListButton = () => {
    return (
      <TouchableHighlight onPress={() => setCurrentArticleUrl("")}>
        <Text
          onMouseOver={(e) => (e.target.style.background = "#ffcc80")}
          onMouseLeave={(e) => (e.target.style.background = "#ffffff")}
          style={styles.backText}
        >
          back to list
        </Text>
      </TouchableHighlight>
    );
  };

  const ListOrArticle = () => {
    const isPdf = currentArticleUrl.indexOf(".pdf") > -1;
    if (currentArticleUrl !== "") {
      return (
        <View style={styles.container}>
          <BackToListButton />
          {isPdf ? (
            <PdfView url={currentArticleUrl} />
          ) : (
            <ReaderView url={proxyUrl + currentArticleUrl} />
          )}
          <BackToListButton />
          <StatusBar style="light" />
        </View>
      );
    } else {
      return (
        <PinboardListView
          token={apiToken}
          clickArticle={(l) => {
            setCurrentArticleUrl(l);
          }}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {apiToken == "" ? (
        <ApiTokenInput setToken={setApiToken} />
      ) : (
        <ListOrArticle />
      )}
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
  backText: {
    fontFamily: "Helvetica Neue",
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    fontSize: 18,
    borderBottomWidth: 2,
  },
});
