<template lang="pug">
  .contextmenu
    ul(:style="contextmenuStyle" ref="ul")
      li(
        v-for="menu in getMenus"
        :key="menu.id"
        @click="onExecute(menu)"
        @mouseover="onMouseover(menu)"
        @mouseenter="onMouseenter"
        @mouseleave="onMouseleave"
      )
        span.name {{menu.name}}
        span.keymap {{menu.keymap}}
        span.arrow(v-if="menu.children")
          MDIcon(:size="16") mdi-chevron-right
    Contextmenu(
      v-if="currentMenu && currentMenu.children"
      :menus="currentMenu.children"
      :x="childrenX"
      :y="childrenY"
    )
</template>

<script lang="ts">
import themeStore, { State as ThemeState } from "@/store/theme";
import { Menu, MenuType } from "@/store/contextmenu";
import treeStore from "@/store/tree";
import { log } from "@/ts/util";
import eventBus, { Bus } from "@/ts/EventBus";
import { path } from "@/store/tree/treeHelper";
import { Component, Prop, Vue } from "vue-property-decorator";
import MDIcon from "./MDIcon.vue";

const MENU_HEIGHT = 39.17;

@Component({
  name: "Contextmenu",
  components: {
    MDIcon
  }
})
export default class Contextmenu extends Vue {
  @Prop({ type: Number, default: 0 })
  private x!: number;
  @Prop({ type: Number, default: 0 })
  private y!: number;
  @Prop({ type: Array, default: () => [] })
  private menus!: Array<Menu<any>>;

  private windowHeight: number = window.innerHeight;
  private currentMenu: Menu<any> | null = null;

  get contextmenuStyle(): string {
    return `
    top: ${this.y}px;
    left: ${this.x}px;
    color: ${this.theme.font};
    background-color: ${this.theme.contextmenu};
    `;
  }

  get getMenus(): Array<Menu<any>> {
    let menus = this.menus;
    if (
      menus.length !== 0 &&
      menus[0].type === MenuType.explorer &&
      treeStore.state.selects.length === 0
    ) {
      const reMenus: Array<Menu<any>> = [];
      menus.forEach(menu => {
        if (menu.type === MenuType.explorer) {
          if (!menu.option || !menu.option.selectOnly) {
            reMenus.push(menu);
          }
        } else {
          reMenus.push(menu);
        }
      });
      menus = reMenus;
    }
    return menus;
  }

  get childrenX(): number {
    const ul = this.$refs.ul as HTMLElement;
    return this.x + ul.clientWidth;
  }

  get childrenY(): number {
    if (this.currentMenu) {
      const menus = this.getMenus;
      let y = this.y + menus.indexOf(this.currentMenu) * MENU_HEIGHT;
      if (this.currentMenu.children) {
        const height = (this.currentMenu.children.length - 1) * MENU_HEIGHT;
        if (y + height > this.windowHeight) {
          y -= height;
        }
      }
      return y;
    }
    return this.y;
  }

  get theme(): ThemeState {
    return themeStore.state;
  }

  private onExecute(menu: Menu<any>) {
    log.debug("Contextmenu onExecute");
    if (!menu.children && menu.execute && typeof menu.execute === "function") {
      switch (menu.type) {
        case MenuType.explorer:
          menu.execute(treeStore.state.selects);
          eventBus.$emit(Bus.Explorer.contextmenuEnd);
          break;
        case MenuType.explorerRemote:
          const paths: string[] = [];
          treeStore.state.selects.forEach(value => {
            paths.push(path(value));
          });
          menu.execute(paths);
          eventBus.$emit(Bus.Explorer.contextmenuEnd);
          break;
        default:
          menu.execute();
          break;
      }
    }
  }

  private onMouseover(menu: Menu<any>) {
    log.debug("Contextmenu onMouseover");
    this.currentMenu = menu;
  }

  private onMouseenter(event: MouseEvent) {
    const el = event.target as HTMLElement;
    el.style.color = this.theme.fontActive;
    el.style.backgroundColor = this.theme.contextmenuActive;
  }

  private onMouseleave(event: MouseEvent) {
    const el = event.target as HTMLElement;
    el.style.color = "";
    el.style.backgroundColor = "";
  }
}
</script>

<style scoped lang="scss">
.contextmenu {
  ul {
    position: fixed;
    z-index: 9000;

    li {
      padding: 10px;
      cursor: pointer;
      font-size: $size-font + 2;
      white-space: nowrap;

      span {
        width: 100px;
        display: inline-flex;
        vertical-align: middle;
        align-items: center;
        overflow: hidden;
      }

      .name {
      }

      .keymap,
      .arrow {
        width: 100%;
        display: inline;
        padding-left: 10px;
      }
    }
  }
}

ul,
ol {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
