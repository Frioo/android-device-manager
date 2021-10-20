<svelte:options accessors />

<script>
  import "typeface-roboto";
  import { onMount } from "svelte";

  /* Routing */
  import Router, { push, pop, replace, link } from "svelte-spa-router";
  import wrap from "svelte-spa-router/wrap";
  import active from "svelte-spa-router/active";
  import Home from "@routes/Home.svelte";
  import Explorer from "@routes/Explorer.svelte";
  import Apps from "@routes/Apps.svelte";

  /* JS */
  import { devices, waitForDevice } from "@js/commands";

  /* SMUI */
  import Drawer, {
    AppContent,
    Content as DrawerContent,
  } from "@smui/drawer/styled";
  import List, { Item, Text } from "@smui/list/styled";
  import Button, { Label } from "@smui/button/styled";
  import Card, { Content } from "@smui/card/styled";
  import CircularProgress from "@smui/circular-progress/styled";

  let isLoading = false;

  const deviceGuard = (component) => {
    return wrap({
      component,
      conditions: [
        async (detail) => {
          isLoading = true;
          const connectedDevices = await devices();
          if (connectedDevices.length > 0) {
            isLoading = false;
            return true;
          }
          const device = await waitForDevice("device");
          isLoading = false;
          return true;
        },
      ],
    });
  };

  const handleConditionsFailed = (e) => {
    console.warn(e);
  };

  const routes = {
    "/": deviceGuard(Home),
    "/explorer": deviceGuard(Explorer),
    "/apps": deviceGuard(Apps),
  };

  let items = [
    { href: "/", text: "Home", icon: "" },
    { href: "/explorer", text: "Files", icon: "" },
    { href: "/apps", text: "Apps", icon: "" },
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
          <a
            class="route-item"
            {href}
            use:link
            use:active={{
              path: href,
              className: "mdc-deprecated-list-item--activated",
            }}
          >
            <Item>
              <Text>{text}</Text>
            </Item>
          </a>
        {/each}
      </List>
    </DrawerContent>

    <AppContent>
      {#if isLoading}
        <div class="loading">
          <CircularProgress
            style="height: 32px; width: 32px; margin-bottom: 0.5rem;"
            indeterminate
          />
          <div class="mdc-typography--button">Waiting for a device...</div>
        </div>
      {/if}
      <Router on:conditionsFailed={handleConditionsFailed} {routes} />
    </AppContent>
  </Drawer>
</main>

<style lang="scss">
  @import url("@styles/App.scss");

  :global(html, body) {
    margin: 0;
    padding: 0;
    font-family: "Roboto";
  }

  main {
    width: 100vw;
    height: 100vh;
  }

  .route-item {
    text-decoration: none;
    color: unset;
  }

  .loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
