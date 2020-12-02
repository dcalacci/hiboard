import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import HTMLView from "react-native-htmlview";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import sanitizeHtml from "sanitize-html";

const ReaderView = ({ url }) => {
  const [cleanHtml, setCleanHtml] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    console.log("current article url:", url);
    parseHtml();
    console.log("clean html:", cleanHtml);
    console.log(("title", title));
  }, [url]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      const surroundEl = document.createElement("span");
      const contents = range.extractContents();
      // instead of using surround, we do this in order to allow the user to select
      // more than just one text node
      surroundEl.appendChild(contents);
      surroundEl.style.backgroundColor = "#ffcc80";
      range.insertNode(surroundEl);
      // use selection.toString to extract the text iself.
      console.log(selection.toString());
    }
  };

  const parseHtml = async () => {
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    try {
      const response = await fetch(proxyUrl + url);
      console.log("response", response);
      const html = await response.text();
      const sanitized = sanitizeHtml(html);
      const doc = new JSDOM(sanitized, { url: proxyUrl + url });
      let reader = new Readability(doc.window.document);
      let readabilityArticle = reader.parse();
      setTitle(readabilityArticle.title);
      setCleanHtml(readabilityArticle.content);
    } catch (e) {
      console.error(e);
      if (onError) {
        this.mounted && onError(e);
      }
    }
  };

  //TODO: turn title into a link to original content
  return (
    <View style={[styles.viewContainer]}>
      {!cleanHtml ? (
        <View
          testID="reader-loader"
          style={[styles.flex, styles.loadingContainer]}
        ></View>
      ) : (
        <ScrollView
          style={[styles.flexContent, { flex: 5 }]}
          testID="reader-body"
        >
          {title ? (
            <Text testID="reader-title" style={[styles.title]}>
              {title}
            </Text>
          ) : null}
          <HTMLView
            value={cleanHtml}
            rootComponentProps={{ onMouseUp: handleMouseUp }}
          />
        </ScrollView>
      )}

      <ScrollView style={{ flex: 1 }}></ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    fontWeight: "600",
  },
  viewContainer: {
    flex: 1,
    flexDirection: "row",
    alignContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 100,
    flexBasis: "60%",
  },
  container: {
    paddingHorizontal: 8,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  flexContent: {
    flex: 6,
  },
  flexGrotto: {
    flex: 4,
  },
});

export default ReaderView;
