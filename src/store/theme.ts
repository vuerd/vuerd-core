import Vue from "vue";
import Vuex from "vuex";
import { Theme, Color } from "@/types";

Vue.use(Vuex);

export interface State {
  drop: string;
  sash: string;
  active: string;
  editor: string;
  titleBar: string;
  activityBar: string;
  statusbar: string;
  font: string;
  fontActive: string;
  contextmenu: string;
  contextmenuActive: string;
  sidebar: string;
  sidebarActive: string;
  tabBar: string;
  tab: string;
  tabActive: string;
}

export const enum Commit {
  change = "change",
  theme = "theme"
}

export const enum ColorKey {
  drop = "drop",
  sash = "sash",
  active = "active",
  editor = "editor",
  titleBar = "titleBar",
  activityBar = "activityBar",
  statusbar = "statusbar",
  font = "font",
  fontActive = "fontActive",
  contextmenu = "contextmenu",
  contextmenuActive = "contextmenuActive",
  sidebar = "sidebar",
  sidebarActive = "sidebarActive",
  tabBar = "tabBar",
  tab = "tab",
  tabActive = "tabActive"
}

export default new Vuex.Store<State>({
  state: {
    drop: "#9DA5B4",
    sash: "#80808059",
    active: "#0081C3",
    editor: "#282C34",
    titleBar: "#282C34",
    activityBar: "#282C34",
    statusbar: "#21252B",
    font: "#CCCCCC",
    fontActive: "white",
    contextmenu: "#21252B",
    contextmenuActive: "#282C34",
    sidebar: "#21252B",
    sidebarActive: "#282C34",
    tabBar: "#21252B",
    tab: "#21252B",
    tabActive: "#282C34"
  },
  getters: {
    color(state: State): Color {
      const color: Color | any = {};
      Object.keys(state).forEach(key => {
        const colorKey = key as ColorKey;
        color[colorKey] = state[colorKey];
      });
      return color;
    }
  },
  mutations: {
    change(state: State, payload: { colorKey: ColorKey; color: string }) {
      const { colorKey, color } = payload;
      state[colorKey] = color;
    },
    theme(state: State, theme: Theme) {
      Object.keys(state).forEach(key => {
        const colorKey = key as ColorKey;
        state[colorKey] = theme.color[colorKey];
      });
    }
  },
  actions: {}
});
