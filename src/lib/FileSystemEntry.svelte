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

  /* Icons */
  import SymlinkIcon from "@mdi/svg/svg/share-outline.svg?component";
  import FolderIcon from "@mdi/svg/svg/folder-outline.svg?component";
  import FileIcon from "@mdi/svg/svg/file-outline.svg?component";
  import DownloadsFolderIcon from "@mdi/svg/svg/folder-download-outline.svg?component";

  export let entry;
  let type;
  let icon;

  $: if (entry) {
    type = entry.type;
    if (type === "dir") {
      icon = FolderIcon;
    } else if (type === "file") {
      icon = FileIcon;
    } else if (type === "link") {
      icon = SymlinkIcon;
    }
  }
</script>

<Item class="fs-entry" on:SMUI:action>
  <Graphic class="fs-entry--icon">
    <svelte:component this={icon} />
  </Graphic>
  <Text>
    <PrimaryText>{entry.name}</PrimaryText>
    <SecondaryText>
      {formatSize(entry.bytes)}
    </SecondaryText>
  </Text>
</Item>

<style lang="scss">
  /* File/Folder list items */
  @import url("@styles/FileSystemEntry.scss");
</style>
