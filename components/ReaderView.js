import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import HTMLView from "react-native-htmlview";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const ReaderView = ({ url }) => {
  const [cleanHtml, setCleanHtml] = useState("");
  const [title, setTitle] = useState("");
  const [articleDetails, setArticleDetails] = useState({});
  const [showGrotto, setGrottoShowing] = useState(false);
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    // parse HTML and turn into reader mode when URL changes
    parseHtml();
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
      const newHighlight = {
        text: selection.toString(),
        html: contents,
        date: new Date(),
      };
      setHighlights([...highlights, newHighlight]);
    }
  };

  const parseHtml = async () => {
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    try {
      const response = await fetch(proxyUrl + url);
      console.log("response", response);
      const html = await response.text();
      // const sanitized = sanitizeHtml(html);
      const doc = new JSDOM(html, { url: proxyUrl + url });
      let reader = new Readability(doc.window.document);
      let readabilityArticle = reader.parse();
      setArticleDetails(readabilityArticle);
      setTitle(readabilityArticle.title);
      setCleanHtml(readabilityArticle.content);
    } catch (e) {
      console.error(e);
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
          {articleDetails ? (
            <Text style={[styles.author]}>{articleDetails.byline}</Text>
          ) : null}
          <HTMLView
            stylesheet={articleStyles}
            value={cleanHtml}
            rootComponentProps={{ onMouseUp: handleMouseUp }}
          />
        </ScrollView>
      )}

      {showGrotto ? <ScrollView style={{ flex: 1 }}></ScrollView> : <></>}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    fontWeight: "600",
  },
  author: {
    fontSize: 18,
    fontWeight: "400",
    textDecorationLine: "underline",
  },
  viewContainer: {
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
    maxWidth: "850px",
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
    margin: 20,
  },
  flexGrotto: {
    flex: 4,
  },
});

const articleStyles = {
  p: {
    margin: 10,
    fontSize: 24,
    fontFamily: "Helvetica Neue",
    fontWeight: "400",
    lineHeight: "150%",
  },
};

export default ReaderView;
