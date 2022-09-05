<script>
  import { onMount } from "svelte";
  import { format } from "date-fns";
  import { getProps, packageDiskStats } from "@js/commands";
  import { formatSize } from "@js/utils";

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
  let diskStats;
  let device;
  let os;
  let storage;

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

  $: if (diskStats) {
    let capacity = Number.parseInt(diskStats["System Size"]);
    let [dataFree, dataTotal] =
      diskStats["Data-Free"].match(/(\d+)(?! \/ )(\d+)/g);
    const data = {
      free: dataFree * 1000,
      total: dataTotal * 1000,
    };
    const photos = Number.parseInt(diskStats["Photos Size"]);
    const videos = Number.parseInt(diskStats["Videos Size"]);
    const apps = Number.parseInt(diskStats["App Size"]);
    const encryption =
      diskStats["File-based Encryption"] === "true\r" ? true : false;
    storage = {
      capacity,
      data,
      photos,
      videos,
      apps,
      encryption,
    };
  }

  onMount(async () => {
    props = await getProps();
    //console.log(props);
    diskStats = await packageDiskStats();
    //console.log(diskStats);
  });
</script>

{#if device}
  <div class="device">
    <!-- <div class="mdc-typography--headline4">Device</div> -->
    <div class="device__name">
      {device.manufacturer || ""}
      {device.name || ""}
    </div>
    <div class="device__model">
      {device.codename || ""}
      {device.model || ""}
    </div>
  </div>
{/if}

<div class="home-cards">
  {#if os}
    <Card variant="outlined">
      <div class="card os">
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

  {#if storage}
    <Card variant="outlined">
      <div class="card storage">
        <div class="card__header">Storage</div>
        <table>
          <tr>
            <td class="td--prop">Capacity</td>
            <td style="width: 0.5em" />
            <td class="td--value">{formatSize(storage.capacity)}</td>
          </tr>
          <tr>
            <td class="td--prop">Internal storage</td>
            <td style="width: 0.5em" />
            <td class="td--value"
              >{`${formatSize(storage.data.free)} / ${formatSize(
                storage.data.total
              )}`}</td
            >
          </tr>
          <tr>
            <td class="td--prop">Apps</td>
            <td style="width: 0.5em" />
            <td class="td--value">{formatSize(storage.apps)}</td>
          </tr>
          <tr>
            <td class="td--prop">Photos</td>
            <td style="width: 0.5em" />
            <td class="td--value">{formatSize(storage.photos)}</td>
          </tr>
          <tr>
            <td class="td--prop">Videos</td>
            <td style="width: 0.5em" />
            <td class="td--value">{formatSize(storage.videos)}</td>
          </tr>
          <tr>
            <td class="td--prop">Encryption</td>
            <td style="width: 0.5em" />
            <td class="td--value"
              >{storage.encryption ? "Enabled" : "Disabled"}</td
            >
          </tr>
        </table>
      </div>
    </Card>
  {/if}
</div>

<style lang="scss">
  @use "@material/typography";
  @import url("../styles/Home.scss");

  .home-cards {
    display: grid;
    grid-template-columns: repeat(2, max-content);
    gap: 1.5rem;
  }

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

  .card {
    padding: 0.35rem 0.75rem;
    display: flex;
    flex-direction: column;
  }
</style>
