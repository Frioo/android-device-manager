<script>
  import { formatSize } from "@js/utils";

  /* SMUI */
  import List, { Item, Text, PrimaryText, SecondaryText } from "@smui/list";
  export let app;
</script>

<Item class="app">
  <Text>
    <PrimaryText
      >{app?.manifest?.application?.label
        ? app.manifest.application.label
        : app.pkg}</PrimaryText
    >
    <SecondaryText>{formatSize(app.size + app.dataSize)}</SecondaryText>
  </Text>
</Item>

<style lang="scss">
  @import url("@styles/AppItem.scss");
</style>
