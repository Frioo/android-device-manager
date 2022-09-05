<script>
  import { formatSize } from "@js/utils";

  /* SMUI */
  import List, {
    Item,
    Text,
    PrimaryText,
    SecondaryText,
    Graphic,
  } from "@smui/list/styled";
  import { A, Span, Li } from "@smui/common/elements/index.js";

  /* Icons */
  import SymlinkIcon from "@mdi/svg/svg/share-outline.svg?component";
  import FolderIcon from "@mdi/svg/svg/folder-outline.svg?component";
  import FileIcon from "@mdi/svg/svg/file-outline.svg?component";
  import DownloadsFolderIcon from "@mdi/svg/svg/folder-download-outline.svg?component";
  import { onMount } from "svelte";

  export let entry;
  let type;
  let icon;
  let primaryText;
  let secondaryText;

  $: if (entry) {
    type = entry.type;
    primaryText = entry.name;
    if (type === "dir") {
      icon = FolderIcon;
      secondaryText = `${entry.itemCount} ${
        entry.itemCount === 1 ? "item" : "items"
      }`;
    } else if (type === "file") {
      icon = FileIcon;
      secondaryText = formatSize(entry.bytes);
    } else if (type === "link") {
      icon = SymlinkIcon;
      secondaryText = entry.linksTo;
    }
  }

  onMount(() => {});
</script>

{#if entry}
  <Item class="fs-entry" on:SMUI:action component={Li}>
    <Graphic class="fs-entry--icon">
      <svelte:component this={icon} />
    </Graphic>
    <Text>
      <PrimaryText>{primaryText}</PrimaryText>
      <SecondaryText>
        {secondaryText}
      </SecondaryText>
    </Text>
  </Item>
{/if}

<style lang="scss">
  /* File/Folder list items */
  @import url("@styles/FileSystemEntry.scss");
</style>
