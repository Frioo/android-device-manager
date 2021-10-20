<script>
  import { getProps } from "@js/commands";
  import { onMount } from "svelte";

  /* SMUI */
  import Card, {
    PrimaryAction,
    Actions,
    ActionButtons,
    ActionIcons,
  } from "@smui/card/styled";

  const deviceProps = () => {
    let device = {
      // 'Xiaomi'
      manufacturer: props["ro.product.manufacturer"],
      // 'Mi 10T Lite'
      name: props["ro.product.marketname"],
      // 'gauguin'
      codename: props["ro.product.odm.device"],
      // 'gauguin_eea'
      variantCodename: props["ro.product.odm.name"],
      model: props["ro.product.odm.model"],
    };

    return device;
  };

  const systemProps = () => {
    let os = {
      // Android
      androidVersion: props["ro.product.build.version.release"],
      firstApiLevel: props["ro.product.first_api_level"],
      apiLevel: props["ro.product.build.version.sdk"],

      // Firmware
      firmwareVersion: props["ro.odm.build.version.incremental"],
      firmwareBuildDate: props["ro.odm.build.date"],
      firmwareFingerprint: props["ro.odm.build.fingerprint"],

      // ROM
      buildDate: props["ro.product.build.date"],
      buildId: props["ro.product.build.id"],
      buildFingerprint: props["ro.product.build.fingerprint"],
    };

    return os;
  };

  let props;
  let device;
  let os;

  $: if (props) {
    device = deviceProps();
    let sysProps = systemProps();
    os = {
      Android: sysProps.androidVersion,
      Firmware: sysProps.firmwareVersion,
      "Build date": sysProps.buildDate,
    };
  }

  onMount(async () => {
    props = await getProps();
    console.log(props);
  });
</script>

{#if device}
  <div class="device">
    <!-- <div class="mdc-typography--headline4">Device</div> -->
    <div class="device__name">
      {device.manufacturer}
      {device.name}
    </div>
    <div class="device__model">
      {device.codename}
      {device.model}
    </div>
  </div>
{/if}

{#if os}
  <Card variant="outlined">
    <div class="os">
      <div class="card__header">OS</div>
      <table>
        {#each Object.entries(os) as [prop, value]}
          <tr>
            <td>{prop}</td>
            <td>{value}</td>
          </tr>
        {/each}
      </table>
    </div>
  </Card>
{/if}

<style lang="scss">
  @use "@material/typography";
  @import url("../styles/Home.scss");

  .device {
    margin-bottom: 2rem;
  }

  .device__name {
    @include typography.typography("headline4");
  }

  .device__model {
    @include typography.typography("subtitle2");
    opacity: 0.65;
    text-transform: uppercase;
    font-family: "consolas";
  }

  .os {
    padding: 0.35rem 0.5rem;
    display: flex;
    flex-direction: column;
  }
</style>
