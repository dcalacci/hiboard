import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import HTMLView from "react-native-htmlview";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const modalStyle = {
  position: "fixed",
  top: 0,
  left: "10%",
  width: "80%",
  height: 300,
  backgroundColor: "#ffffff",
  borderWidth: "5px",
  borderColor: "black",
};

const Modal = ({ handleClose, show, highlight, children }) => {
  const showHideStyle = show ? { display: "block" } : { display: "none" };
  const [notes, setNotes] = useState("");

  if (highlight) {
    return (
      <View style={[showHideStyle, modalStyle]}>
        <Text>{highlight.text}</Text>
        {children}
        <TouchableHighlight onPress={handleClose}>
          <Text>Close</Text>
        </TouchableHighlight>
      </View>
    );
  } else {
    return null;
  }
};

const ReaderView = ({ url }) => {
  const [cleanHtml, setCleanHtml] = useState("");
  const [title, setTitle] = useState("");
  const [articleDetails, setArticleDetails] = useState({});
  const [showGrotto, setGrottoShowing] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    showing: false,
    highlightIndex: 0,
  });
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    // parse HTML and turn into reader mode when URL changes
    parseHtml();
  }, [url]);

  useEffect(() => {
    getHighlightNotes(highlights.length - 1);
  }, [highlights]);

  const getHighlightNotes = (highlightIndex) => {
    setModalInfo({ highlightIndex, showing: true });
  };
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
        notes: "",
        saved: false,
      };
      setHighlights([...highlights, newHighlight]);
      // modal will get the highlight to select from index
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
        <>
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
          <Modal
            show={modalInfo.showing}
            handleClose={() => setModalInfo({ ...modalInfo, showing: false })}
            highlight={highlights[modalInfo.highlightIndex]}
          >
            <TextInput
              style={styles.textInputStyle}
              editable
              onChangeText={(text) => {
                const i = modalInfo.highlightIndex;
                // some fancy spreading and destructuring to
                // inject our notes
                setHighlights([
                  ...highlights.slice(0, i),
                  { ...highlights[i], notes: text },
                  ...highlights.slice(i + 1),
                ]);
              }}
            ></TextInput>
            <p> Modal </p>
          </Modal>
        </>
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
  textInputStyle: {
    borderWidth: 3,
    padding: 2,
    margin: 5,
    borderColor: "black",
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
