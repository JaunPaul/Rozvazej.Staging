<script lang="ts">
  import { RegistrationState, uploadAllToCloudinary } from "../state/RegistrationState.svelte";
  import CzechFileUpload from "./CzechFileUpload.svelte";
  import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from "../endpoints";
  
  // Create a fresh state for the debug view
  let registrationState = new RegistrationState();
  
  // Use a state for logs array
  let logs: string[] = $state([]);
  let busy = $state(false);

  function log(msg: string) {
    logs.push(msg); // mutate state array directly in Svelte 5 (if using proxies) or reassign
  }

  async function testUpload() {
    busy = true;
    log("Starting upload...");
    try {
      // CzechFileUpload puts files into filesNationalId
      const filesValues = registrationState.values.filesNationalId;
      if (!filesValues || filesValues.length === 0) {
        log("No files selected in CzechFileUpload (filesNationalId).");
        return;
      }

      const files = filesValues.map(f => ({ file: f, bucket: "debug-national-id" }));
      
      log(`Uploading ${files.length} file(s) to ${CLOUDINARY_UPLOAD_URL} with preset ${CLOUDINARY_UPLOAD_PRESET}...`);
      
      const res = await uploadAllToCloudinary(
        CLOUDINARY_UPLOAD_URL, 
        CLOUDINARY_UPLOAD_PRESET, 
        files
      );
      
      log("Upload finished.");
      if (res.urls.length > 0) {
        log("Successfull URLs:\n" + JSON.stringify(res.urls, null, 2));
      }
      if (res.failures.length > 0) {
        log("Failures:\n" + JSON.stringify(res.failures, null, 2));
      }
    } catch (e) {
      log("Error during upload: " + String(e));
      console.error(e);
    } finally {
      busy = false;
    }
  }
</script>

<div style="padding: 20px; max-width: 600px; margin: 0 auto; background: #f0f0f0; min-height: 100vh;">
  <h1 style="font-size: 24px; margin-bottom: 20px;">Debug Cloudinary Upload</h1>
  
  <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin-bottom: 15px;">Add files using the component below, then click Test Upload.</p>
    <!-- We reuse CzechFileUpload components which binds to registrationState -->
    <CzechFileUpload {registrationState} />
  </div>

  <button 
    onclick={testUpload} 
    disabled={busy}
    style="padding: 10px 20px; background: blue; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
  >
    {busy ? "Uploading..." : "Test Cloudinary Upload"}
  </button>

  <div style="margin-top: 20px; background: #333; color: #0f0; padding: 15px; border-radius: 4px; overflow-x: auto;">
    <h3 style="margin-top: 0; color: white;">Logs</h3>
    <pre style="white-space: pre-wrap;">{logs.join("\n")}</pre>
  </div>
</div>
