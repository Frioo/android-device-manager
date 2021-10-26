<script>
  import { onMount } from "svelte";
  import { formatSize } from "@js/utils";
  import { packages, packageDiskStats, systemApps } from "@js/commands";
  import { listApps } from "@js/pm";
  import { apps_cache } from "@js/stores";

  /* SMUI */
  import List, { Item, Text, PrimaryText, SecondaryText } from "@smui/list";
  import Button, { Group, Label } from "@smui/button";
  import AppItem from "@lib/AppItem.svelte";

  let stats;
  let apps;
  let ubApps = apps_cache.subscribe((val) => (apps = val));
  let includeSystemApps = false;
  let statusText = "";
  let statusProgress;
  let items;
  let filters = {
    installedBy: {
      selected: "user",
      values: ["user", "system", "all"],
    },
  };

  $: if (apps) {
    items = apps;
  }

  const setFilter = (group, value) => {
    let newFilters = filters;
    newFilters[group].selected = value;
    filters = newFilters;
    items = apps.filter((app) => {
      return app[group] === value;
    });
    console.log("filters updated", items);
  };

  const onApp = (e) => {
    statusProgress = Math.round((e.current / e.total) * 100) / 100;
    console.log(statusProgress);
    statusText = `${e.current}/${e.total}`;
  };

  onMount(async () => {
    //stats = await packageDiskStats();
    //await packages();
    //await systemApps();
    await listApps({ installedBy: "all", onApp });
  });

  /* const handleFilterInstalledBy = (installedBy) => {
    items = apps.filter((app) => app.installedBy === installedBy);
  }; */
</script>

<div class="apps-loader">
  <LinearProgress progress={statusProgress} close={statusProgress >= 1} />
</div>
<div class="apps">
  <!-- Filters -->
  <div class="apps-filters">
    {#each Object.keys(filters) as group}
      <Group variant="raised">
        {#each filters[group].values as filter}
          <Button
            variant="raised"
            disabled={filters[group].selected === filter}
            on:click={() => setFilter(group, filter)}
          >
            <Label>{filter}</Label>
          </Button>
        {/each}
      </Group>
    {/each}
  </div>
  <!-- Apps list -->
  {#if items}
    <div class="mdc-typography--button">
      {statusText}
    </div>
    <div class="apps-list">
      {#each items as app}
        <AppItem {app} />
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .apps-list {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .apps-loader {
    position: absolute;
    top: 0;
    width: 100%;
    left: 0;
  }
</style>
