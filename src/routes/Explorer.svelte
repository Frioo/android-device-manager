<script>
  import { onMount } from "svelte";
  import { ls, subdirSizes } from "@js/commands";
  import { formatSize } from "@js/utils";

  /* SMUI */
  import Button, { Label } from "@smui/button/styled";
  import IconButton from "@smui/icon-button/styled";
  import List, { Separator } from "@smui/list/styled";
  import Textfield from "@smui/textfield/styled";
  import Icon from "@smui/textfield/icon/styled";

  /* Components */
  import FileSystemEntry from "@lib/FileSystemEntry.svelte";

  /* Icons */
  import UpArrowIcon from "@mdi/svg/svg/arrow-up.svg?component";

  const listDir = async (path) => {
    items = await ls(path);
    console.table(items);
  };

  const subdirs = async (path) => {
    let subdirs = await subdirSizes(path);
    return subdirs;
  };

  const handleItemClick = async (item) => {
    path = [...path, item.name];
  };

  const handleUp = async () => {
    path = path.slice(0, -1);
  };

  const iconSize = 18;

  let path = ["sdcard"];
  let items = [];

  $: if (path) {
    console.log(UpArrowIcon);
    let pathStr = path.join("/");
    Promise.all([listDir(pathStr), subdirs(pathStr)]);
  }

  onMount(async () => {});
</script>

<div class="explorer">
  <div class="explorer-nav">
    <IconButton class="explorer-nav--up" on:click={handleUp}>
      <UpArrowIcon width={iconSize} height={iconSize} />
    </IconButton>
    <Textfield
      class="explorer-nav--cwd"
      variant="outlined"
      value={"//" + path.join("/")}
    />
  </div>
  <List>
    {#each items as item, i}
      <FileSystemEntry
        entry={item}
        on:SMUI:action={() => handleItemClick(item)}
      />
      {#if i !== items.length - 1}
        <Separator class="fs-entry-separator" />
      {/if}
    {/each}
  </List>
</div>

<style>
  /* SMUI overrides */
  @import url("@styles/Explorer.scss");

  /* Explorer ribbon */

  .explorer-nav {
    display: flex;
    width: 100%;
  }
</style>
