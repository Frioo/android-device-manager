<script>
  import { getProps } from "@js/commands";
  import { onMount } from "svelte";

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
    os = systemProps();
  }

  onMount(async () => {
    props = await getProps();
    console.log(props);
  });
</script>

{#if device}
  <div class="device">
    <div class="mdc-typography--headline4">Device</div>
    <table>
      {#each Object.entries(device) as [prop, value]}
        <tr>
          <td>{prop}</td>
          <td>{value}</td>
        </tr>
      {/each}
    </table>
  </div>
{/if}

{#if os}
  <div class="os">
    <div class="mdc-typography--headline4">OS</div>
    <table>
      {#each Object.entries(os) as [prop, value]}
        <tr>
          <td>{prop}</td>
          <td>{value}</td>
        </tr>
      {/each}
    </table>
  </div>
{/if}

<style lang="scss">
  @use "@material/typography/mdc-typography";
</style>
