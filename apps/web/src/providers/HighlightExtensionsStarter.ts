"use client";
import hljs from "highlight.js";
//@ts-ignore
import hljsDefineSolidity from "highlightjs-solidity";

const initHighlightJSExtensions = () => {
    hljsDefineSolidity(hljs);
    hljs.initHighlightingOnLoad();
};

export { initHighlightJSExtensions };
