<script>
  import { onMount } from "svelte";
  import { push, pop, replace } from "svelte-spa-router";
  import { ls, subdirSizes } from "@js/commands";
  import { formatSize, arraysEqual } from "@js/utils";
  import { get } from "svelte/store";
  import { explorer_cache } from "@js/stores";
  import { navigate, list, up } from "@js/explorer";
  import { fly, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

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

  const handleNavigate = async (item) => {
    if (item.type === "file") {
      return;
    }
    state = await navigate([item.name]);
  };

  const handleUp = async () => {
    state = await up();
  };

  const iconSize = 18;

  export let params = {};
  let state = get(explorer_cache);
  let path = state.path;

  let items = state.items;
  let rootEl;

  let fullPath;

  $: if (path) {
    fullPath = `//${path.join("/")}`;
  } else {
    fullPath = "";
  }

  $: if (state) {
    if (!items) {
      console.log("[Explorer] state loaded", state);
      items = state.items;
    } else if (!arraysEqual(state.path, path)) {
      console.log("[Explorer] state updated", state);
      path = state.path;
      items = state.items;
    }

    // Without this, there's a weird bug where after changing directories,
    // the item at the index of the clicked directory would render focused
    // --mdc-ripple-upgraded--background-focused
    // activeElement.blur() removes focus from the focused element.
    if (document) {
      document.activeElement.blur();
    }

    //unfocusItems();
  }

  onMount(async () => {
    if (!items) {
      state = await navigate(path, false);
    }
  });
</script>

{#if state}
  <div bind:this={rootEl} class="explorer">
    <div class="explorer-nav">
      <IconButton class="explorer-nav--up" on:click={handleUp}>
        <UpArrowIcon width={iconSize} height={iconSize} />
      </IconButton>
      <Textfield
        class="explorer-nav--cwd"
        variant="outlined"
        value={fullPath}
        disabled={fullPath === ""}
      />
    </div>
    {#if items}
      <div class="explorer-dir">
        {#each items as item, i}
          <div
            in:fly={{ y: -20, duration: 100, delay: i * 35, easing: cubicOut }}
          >
            <FileSystemEntry
              entry={item}
              on:SMUI:action={() => handleNavigate(item)}
            />
          </div>
          {#if i !== items.length - 1}
            <Separator class="fs-entry-separator" />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* SMUI overrides */
  @import url("@styles/Explorer.scss");

  /* Explorer ribbon */

  .explorer-nav {
    display: flex;
    width: 100%;
  }

  .explorer-dir {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
