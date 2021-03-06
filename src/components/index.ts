import _Vue from "vue";
import _VuerdCore from "./editor/VuerdCore.vue";
import { Plugin, Option } from "@/types";
import Logger from "@/ts/Logger";
import Command from "@/plugin/Command";
import TextEditor from "./plugins/editor/TextEditor";
import Readme from "./plugins/editor/Readme";
import VSCode from "./plugins/theme/VSCode";
import AtomOneDark from "./plugins/theme/AtomOneDark";
import AtomOneLight from "./plugins/theme/AtomOneLight";
import VSCodeIcons from "./plugins/icon/VSCodeIcons";

const VuerdCore = {
  install(Vue: typeof _Vue, option?: Option) {
    if (option && option.logLevel) {
      Logger.logLevel = option.logLevel;
    }
    Vue.component("VuerdCore", _VuerdCore);
  },
  use<T>(plugin: Plugin<T>, option?: T) {
    plugin.install(new Command(), option);
  }
};

// default editor
VuerdCore.use(TextEditor);
VuerdCore.use(Readme);

// default theme
VuerdCore.use(VSCode);
VuerdCore.use(AtomOneDark);
VuerdCore.use(AtomOneLight);

// default icon
VuerdCore.use(VSCodeIcons);

export default VuerdCore;
