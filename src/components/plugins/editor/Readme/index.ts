import hljs from "highlight.js";
import marked from "marked";
import Readme from "./Readme.vue";
import { Command } from "@/types";

marked.setOptions({
  highlight: function(code: string, lang: string) {
    try {
      return hljs.highlight(lang, code).value;
    } catch (e) {
      return hljs.highlightAuto(code).value;
    }
  }
});

export default {
  install(command: Command) {
    command.editorAdd({
      component: Readme,
      scope: ["README"]
    });
  }
};
