import { Tree } from "@/store/tree";
import { Tab } from "@/store/view";
import { path } from "@/store/tree/treeHelper";

export default class TabModel implements Tab {
  public active: boolean;
  private tree: Tree;

  constructor(tree: Tree) {
    this.tree = tree;
    this.active = false;
  }

  get id(): string {
    return this.tree.id;
  }

  get name(): string {
    return this.tree.name;
  }

  set name(name: string) {
    this.tree.name = name;
  }

  get value(): string | undefined {
    return this.tree.value;
  }

  set value(value: string | undefined) {
    if (value) {
      this.tree.value = value;
    }
  }

  get edit(): boolean {
    return this.tree.edit;
  }

  set edit(value: boolean) {
    this.tree.edit = value;
  }

  get path(): string {
    return path(this.tree);
  }

  public setTree(tree: Tree) {
    this.tree = tree;
  }
}
