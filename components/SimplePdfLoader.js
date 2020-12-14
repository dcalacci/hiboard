import React, { useEffect, useState, useRef, useCallback } from "react";

import { Document, Page, pdfjs } from "react-pdf";
// import pdfjsLib from "pdfjs-dist/build/pdf";
// import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

export default function SimplePdfLoader({
  url,
  children,
  beforeLoad,
  setPdfDocument,
  fn,
}) {
  const pdfRef = React.createRef();

  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  // pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  const [pdf, setPdf] = useState();

  useEffect(() => {
    const loadingTask = pdfjs.getDocument(url);
    loadingTask.promise.then(
      (loadedPdf) => {
        setPdf(loadedPdf);
      },
      function (reason) {
        console.error(reason);
      }
    );
  }, [url]);

  useEffect(() => {
    setPdfDocument(pdf);
    console.log("pdf changed:", pdf);
  }, [pdf]);

  // TODO: so close. need to somehow rewrite all of pdf highlight to usethe pdfjs inside of react-pdf, or something???
  // OR just do a much simple rhighlight solution.
  return (
    <>
      <span ref={pdfRef} />
      {!pdf ? beforeLoad : fn(pdf)}
    </>
  );
}
