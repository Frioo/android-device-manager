<script>
  import "typeface-roboto";
  import { onMount } from "svelte";

  /* Routing */
  import Router, { push, pop, replace } from "svelte-spa-router";
  import Home from "@routes/Home.svelte";
  import Explorer from "@routes/Explorer.svelte";
  import Apps from "@routes/Apps.svelte";

  /* JS */
  import {
    ls,
    getInstalledPackages,
    getProps,
    dumpBattery,
  } from "./lib/js/commands";

  /* SMUI */
  import Drawer, {
    AppContent,
    Content as DrawerContent,
  } from "@smui/drawer/styled";
  import List, { Item, Text } from "@smui/list/styled";
  import Button, { Label } from "@smui/button/styled";
  import Card, { Content } from "@smui/card/styled";

  const routes = {
    "/": Home,
    "/explorer": Explorer,
    "/apps": Apps,
  };

  let items = [
    { href: "/", text: "Home", icon: "" },
    { href: "/explorer", text: "Files", icon: "" },
    { href: "/apps", text: "Apps", icon: "" },
    { href: "", text: "", icon: "" },
  ];

  /* const handleProps = async () => {
    let props = await getProps();
    items = Object.entries(props).map((e) => ({
      prop: e[0],
      value: e[1],
    }));
    console.log(items);
  }; */
</script>

<main>
  <Drawer>
    <DrawerContent>
      <List>
        {#each items as { href, text, icon }}
          <Item on:click={() => push(href)}>
            <Text>{text}</Text>
          </Item>
        {/each}
      </List>
    </DrawerContent>

    <AppContent>
      <Router {routes} />
    </AppContent>
  </Drawer>
</main>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    font-family: "Roboto";
  }

  main {
    width: 100vw;
    height: 100vh;
  }

  /* Drawer */
  :global(.mdc-drawer) {
    width: 100%;
    flex-direction: row;
  }

  :global(.mdc-drawer__content) {
    width: 20vw;
    border-right: 1px solid rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
  }

  :global(.mdc-drawer-app-content) {
    padding: 16px;
    padding-bottom: 0;
    width: 100%;
    overflow-y: auto;
  }

  /* Drawer list */
  :global(.mdc-deprecated-list) {
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
  }

  * :global(.smui-card__content) {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
  }

  .row {
    display: flex;
    width: 100%;
  }

  * :global(.row *) {
    margin-right: 0.65rem;
  }
</style>
