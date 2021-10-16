<script>
  import { onMount } from "svelte";
  import { formatSize } from "@js/utils";
  import { packageDiskStats } from "@js/commands";

  /* SMUI */
  import List, { Item, Text, PrimaryText, SecondaryText } from "@smui/list";

  let stats;

  onMount(async () => {
    stats = await packageDiskStats();
  });
</script>

<div class="apps">
  {#if stats}
    <List twoLine singleSelection>
      {#each stats["apps"] as app}
        <Item>
          <Text>
            <PrimaryText>{app.package}</PrimaryText>
            <SecondaryText>{formatSize(app.size + app.dataSize)}</SecondaryText>
          </Text>
        </Item>
      {/each}
    </List>
  {/if}
</div>

<style>
  * :global(.mdc-deprecated-list-item__text) {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-around;
  }

  * :global(.mdc-deprecated-list-item__primary-text) {
    display: flex;
  }
</style>
