<script>
  import { getProps } from "@js/commands";
  import { onMount } from "svelte";
  import { format } from "date-fns";

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

      abiList: props["ro.vendor.product.cpu.abilist"],
    };

    return device;
  };

  const systemProps = () => {
    let buildDateUtc = parseInt(props["ro.product.build.date.utc"]);
    let buildDate = new Date(buildDateUtc * 1000);
    let os = {
      // Android
      androidVersion: props["ro.product.build.version.release"],
      firstApiLevel: props["ro.product.first_api_level"],
      apiLevel: props["ro.product.build.version.sdk"],

      // Security
      securityPatch: props["ro.build.version.security_patch"],
      encryptionState: props["ro.crypto.state"],
      encryptionMode: props["ro.crypto.volume.filenames_mode"],
      selinux: props["ro.boot.selinux"],
      verity: props["ro.boot.veritymode"],

      // Firmware
      firmwareVersion: props["ro.odm.build.version.incremental"],
      firmwareBuildDate: props["ro.odm.build.date"],
      firmwareFingerprint: props["ro.odm.build.fingerprint"],

      // ROM
      buildDate: format(buildDate, "yyyy-MM-dd"),
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
      "Security patch": sysProps.securityPatch,
      Firmware: sysProps.firmwareVersion,
      "Build ID": sysProps.buildId,
      "Build date": sysProps.buildDate,
      Encryption:
        sysProps.encryptionState === "encrypted"
          ? sysProps.encryptionMode
          : "disabled",
      SELinux: sysProps.selinux,
      Verity: sysProps.verity,
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
      <div class="card__header">System</div>
      <table>
        {#each Object.entries(os) as [prop, value]}
          <tr>
            <td class="td--prop">{prop}</td>
            <td style="width: 0.5rem" />
            <td class="td--value">{value}</td>
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

  .card__header {
    @include typography.typography("headline6");
    color: var(--mdc-theme-primary);
    margin-bottom: 0.5rem;
  }

  table {
    .td--prop {
      text-align: start;
      font-weight: 500;
    }

    .td--value {
      text-align: end;
    }
  }

  .os {
    padding: 0.35rem 0.5rem;
    display: flex;
    flex-direction: column;
  }
</style>
