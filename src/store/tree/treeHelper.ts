import { SIZE_TREE_HEIGHT } from "@/ts/layout";
import { Tree, TreeSelect } from "@/store/tree";
import { Tree as TreeModel, TreeSave } from "@/types";
import { log, isData, getData, uuid } from "@/ts/util";

export function findById(container: Tree, id: string): Tree | null {
  if (container.id === id) {
    return container;
  } else {
    let target: Tree | null = null;
    if (container.children) {
      for (const value of container.children) {
        target = findById(value, id);
        if (target) {
          break;
        }
      }
    }
    return target;
  }
}

export function findByTree(container: Tree, tree: Tree): Tree | null {
  if (container.id === tree.id) {
    return container;
  } else {
    let target: Tree | null = null;
    if (container.children) {
      for (const value of container.children) {
        target = findByTree(value, tree);
        if (target) {
          break;
        }
      }
    }
    return target;
  }
}

export function childrenCount(tree: Tree, count: number = 0): number {
  let sum = count;
  if (tree.children && tree.children.length !== 0 && tree.open) {
    tree.children.forEach((node: Tree) => {
      sum += childrenCount(node, 1);
    });
  }
  return sum;
}

export function path(tree: Tree, buffer: string[] = []): string {
  if (tree.parent) {
    buffer.unshift(tree.name);
    path(tree.parent, buffer);
  }
  return buffer.join("/");
}

export function pathOld(
  tree: Tree,
  oldName: string,
  buffer: string[] = []
): string {
  if (tree.parent) {
    buffer.unshift(oldName);
    path(tree.parent, buffer);
  }
  return buffer.join("/");
}

export function select(
  container: Tree,
  selects: TreeSelect[],
  tree: Tree,
  event: MouseEvent
): TreeSelect[] {
  const trees = childrenOpenArray(container);
  // none display delete
  for (let i = 0; i < selects.length; i++) {
    const index = trees.indexOf(selects[i]);
    if (index === -1) {
      selects.splice(i, 1);
      i--;
    }
  }
  if (selects.length === 0) {
    // select
    const index = trees.indexOf(tree);
    const treeSelect = treeToSelect(tree, index * SIZE_TREE_HEIGHT);
    selects.push(treeSelect);
  } else if (event.ctrlKey && event.shiftKey) {
    // multiple range select
    let start = trees.indexOf(tree);
    const last = lastSelect(selects);
    let end = start;
    if (last) {
      end = trees.indexOf(last);
    }
    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }
    for (let i = start; i <= end; i++) {
      if (isData(selects, trees[i].id)) {
        const treeSelect = treeToSelect(
          trees[i],
          i * SIZE_TREE_HEIGHT,
          nextOrder(selects)
        );
        selects.push(treeSelect);
      }
    }
    for (const treeSelect of selects) {
      const index = trees.indexOf(treeSelect);
      treeSelect.top = index * SIZE_TREE_HEIGHT;
    }
    const current = getData(selects, tree.id);
    if (current) {
      selects[selects.indexOf(current)].order = nextOrder(selects);
    }
  } else if (event.shiftKey) {
    // range select
    let start = trees.indexOf(tree);
    let end = start;
    const last = lastSelect(selects);
    if (last) {
      end = trees.indexOf(last);
    }
    const current = start;
    selects = [];
    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }
    for (let i = start; i <= end; i++) {
      const treeSelect = treeToSelect(
        trees[i],
        i * SIZE_TREE_HEIGHT,
        nextOrder(selects)
      );
      selects.push(treeSelect);
    }
    if (current === start) {
      selects[0].order = nextOrder(selects);
    }
  } else if (event.ctrlKey) {
    // multiple select
    if (isData(selects, tree.id)) {
      const treeSelect = treeToSelect(tree, 0, nextOrder(selects));
      selects.push(treeSelect);
    }
    for (const treeSelect of selects) {
      const index = trees.indexOf(treeSelect);
      treeSelect.top = index * SIZE_TREE_HEIGHT;
    }
  } else {
    // select
    const index = trees.indexOf(tree);
    const treeSelect = treeToSelect(tree, index * SIZE_TREE_HEIGHT);
    selects = [treeSelect];
  }
  return selects;
}

function nextOrder(selects: TreeSelect[]): number {
  let max = 0;
  selects.forEach((treeSelect: TreeSelect) => {
    if (max < treeSelect.order) {
      max = treeSelect.order;
    }
  });
  return max + 1;
}

export function childrenOpenArray(container: Tree, stack?: Tree[]): Tree[] {
  if (!stack) {
    stack = [];
  } else {
    stack.push(container);
  }
  if (container.children && container.children.length !== 0 && container.open) {
    container.children.forEach((tree: Tree) => {
      childrenOpenArray(tree, stack);
    });
  }
  return stack;
}

export function childrenArray(container: Tree, stack?: Tree[]): Tree[] {
  if (!stack) {
    stack = [];
  } else {
    stack.push(container);
  }
  if (container.children && container.children.length !== 0) {
    container.children.forEach((tree: Tree) => {
      childrenArray(tree, stack);
    });
  }
  return stack;
}

export function move(
  selects: TreeSelect[],
  folder: Tree,
  currentTree: Tree
): TreeSelect[] {
  if (folder.children && folder.id !== currentTree.id) {
    if (isData(selects, currentTree.id)) {
      // single
      if (
        !findByTree(currentTree, folder) &&
        folder.children.filter(value => value.name === currentTree.name)
          .length === 0
      ) {
        deleteByTree(currentTree);
        folder.children.push(currentTree);
        currentTree.parent = folder;
        orderByNameASC(folder);
      }
    } else {
      // select
      for (let i = 0; i < selects.length; i++) {
        if (findByTree(selects[i], folder)) {
          selects.splice(i, 1);
          i--;
        }
      }
      for (const treeSelect of selects) {
        if (
          folder.children.filter(value => value.name === treeSelect.name)
            .length === 0
        ) {
          deleteByTree(treeSelect as Tree);
          folder.children.push(treeSelect as Tree);
          treeSelect.parent = folder;
        }
      }
      orderByNameASC(folder);
      selects = [];
    }
  }
  return selects;
}

export function movePaths(
  selects: TreeSelect[],
  folder: Tree,
  currentTree: Tree
): string[] {
  const paths: string[] = [];
  if (folder.children && folder.id !== currentTree.id) {
    if (isData(selects, currentTree.id)) {
      // single
      if (
        !findByTree(currentTree, folder) &&
        folder.children.filter(value => value.name === currentTree.name)
          .length === 0
      ) {
        paths.push(path(currentTree));
      }
    } else {
      // select
      for (const treeSelect of selects) {
        if (
          folder.children.filter(value => value.name === treeSelect.name)
            .length === 0
        ) {
          paths.push(path(treeSelect));
        }
      }
    }
  }
  return paths;
}

export function deleteByTree(tree: Tree) {
  log.debug("treeHandler deleteByTree");
  if (tree && tree.parent) {
    const parent = tree.parent;
    if (parent.children) {
      const currentIndex = parent.children.indexOf(tree);
      parent.children.splice(currentIndex, 1);
    }
  }
}

export function orderAllByNameASC(root: Tree) {
  if (root.children) {
    orderByNameASC(root);
    root.children.forEach((tree: Tree) => {
      if (tree.children) {
        orderByNameASC(tree);
      }
    });
  }
}

export function orderByNameASC(folder: Tree) {
  if (folder.children) {
    const folders: Tree[] = [];
    const files: Tree[] = [];
    const sortTrees: Tree[] = [];
    folder.children.forEach((tree: Tree) => {
      if (tree.children) {
        folders.push(tree);
      } else {
        files.push(tree);
      }
    });
    folders.sort(treeSortNameASC);
    files.sort(treeSortNameASC);
    sortTrees.push.apply(sortTrees, folders);
    sortTrees.push.apply(sortTrees, files);
    folder.children = sortTrees;
  }
}

function treeSortNameASC(a: Tree, b: Tree): number {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

export function lastSelect(selects: TreeSelect[]): TreeSelect | null {
  if (selects.length === 0) {
    return null;
  } else {
    let target = selects[0];
    selects.forEach((treeSelect: TreeSelect) => {
      if (target.order < treeSelect.order) {
        target = treeSelect;
      }
    });
    return target;
  }
}

export function treeToSelect(
  tree: Tree,
  top: number = 0,
  order: number = 0
): TreeSelect {
  const treeSelect = tree as TreeSelect;
  treeSelect.top = top;
  treeSelect.order = order;
  return treeSelect;
}

export function modelToTree(treeModel: TreeModel): Tree {
  const tree: Tree = {
    id: uuid(),
    parent: null,
    name: treeModel.name,
    open: treeModel.open,
    edit: false
  };
  if (treeModel.children) {
    tree.children = [];
    treeModel.children.forEach((value: TreeModel) => {
      if (tree.children) {
        tree.children.push(modelToTree(value));
      }
    });
  }
  return tree;
}

export function selectParentTrees(selects: TreeSelect[]): TreeSelect[] {
  const selectParentList: TreeSelect[] = [];
  selects.sort(selectSortTopASC);
  selects.forEach(tree => {
    if (selectParentList.length === 0) {
      selectParentList.push(tree);
    } else {
      const root = selectParentList[selectParentList.length - 1];
      if (findByTree(root, tree) === null) {
        selectParentList.push(tree);
      }
    }
  });
  return selectParentList;
}

function selectSortTopASC(a: TreeSelect, b: TreeSelect) {
  return a.top - b.top;
}

export function treeEdits(tree: Tree, treeSaves: TreeSave[] = []): TreeSave[] {
  if (tree.edit) {
    treeSaves.push({
      oldPath: null,
      path: path(tree),
      name: tree.name,
      value: tree.value
    });
  }
  if (tree.children) {
    tree.children.forEach(value => treeEdits(value, treeSaves));
  }
  return treeSaves;
}

export function treeEditAllEnd(tree: Tree) {
  if (tree.edit) {
    tree.edit = false;
  }
  if (tree.children) {
    tree.children.forEach(value => treeEditAllEnd(value));
  }
}
