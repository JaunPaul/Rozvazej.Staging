<script lang="ts">
    import { fade } from "svelte/transition";
    import type { RegistrationState } from "../../../state/RegistrationState.svelte";
    import Errors from "../../Errors.svelte";
    import { t } from "../../../i18n/i18n.svelte";
    import { getCountries } from "../../../i18n/countriesGetter";
    import DriversLicenseUpload from "../../DriversLicenseUpload.svelte";

    let { registrationState }: { registrationState: RegistrationState } =
        $props();
</script>

{#snippet residenceFields()}
    <div class="input-wrap">
        <label for="placeOfBirth" class="field-label"
            >{t("labels.placeOfBirth")}</label
        ><input
            class="input-2 w-input"
            name="placeOfBirth"
            data-name="placeOfBirth"
            type="text"
            id="placeOfBirth"
            placeholder={t("ph.placeOfBirth")}
            bind:value={registrationState.values.placeOfBirth}
        />
        <Errors errors={registrationState.errors} path="placeOfBirth" />
    </div>

    <div class="box has-8-gap">
        <div class="form-heading">
            {t("labels.permanentResidence")}
        </div>
        <div class="form-line"></div>
    </div>
    <div>
        <div class="input-group-wrap">
            <div class="input-wrap relative">
                <label for="permanentResidenceStreet" class="field-label"
                    >{t("labels.street")}</label
                >
                <input
                    class="input-2 w-input"
                    type="text"
                    id="permanentResidenceStreet"
                    name="permanentResidenceStreet"
                    placeholder={t("ph.permanentResidenceStreet")}
                    bind:value={
                        registrationState.values.permanentResidenceStreet
                    }
                />
                <Errors
                    errors={registrationState.errors}
                    path="permanentResidenceStreet"
                />
            </div>
            <div class="input-wrap relative">
                <label for="permanentResidenceStreetNumber" class="field-label"
                    >{t("labels.houseNumber")}</label
                >
                <input
                    class="input-2 w-input"
                    type="text"
                    id="permanentResidenceStreetNumber"
                    name="permanentResidenceStreetNumber"
                    placeholder={t("ph.permanentResidenceStreetNumber")}
                    bind:value={
                        registrationState.values.permanentResidenceStreetNumber
                    }
                />
                <Errors
                    errors={registrationState.errors}
                    path="permanentResidenceStreetNumber"
                />
            </div>
        </div>
        <div class="input-group-wrap">
            <div class="input-wrap relative">
                <label for="permanentResidenceCity" class="field-label"
                    >{t("labels.city")}</label
                >
                <input
                    class="input-2 w-input"
                    type="text"
                    id="permanentResidenceCity"
                    name="permanentResidenceCity"
                    placeholder={t("ph.permanentResidenceCity")}
                    bind:value={registrationState.values.permanentResidenceCity}
                />
                <Errors
                    errors={registrationState.errors}
                    path="permanentResidenceCity"
                />
            </div>
            <div class="input-wrap">
                <label for="permanentResidenceCountry" class="field-label"
                    >{t("labels.permanentResidenceCountry")}</label
                >
                <select
                    class="input-2"
                    id="permanentResidenceCountry"
                    name="permanentResidenceCountry"
                    bind:value={
                        registrationState.values.permanentResidenceCountry
                    }
                >
                    <option value="" disabled
                        >{t("select.placeholder.country")}</option
                    >
                    {#await getCountries("cs") then countries}
                        {#each countries as country}
                            {#each Object.entries(country) as [code, name]}
                                <option value={code}>{name}</option>
                            {/each}
                        {/each}
                    {/await}
                </select>
                <Errors
                    errors={registrationState.errors}
                    path="permanentResidenceCountry"
                />
            </div>
        </div>
    </div>
{/snippet}

<div in:fade class="box has-8-gap">
    {#if registrationState.askCountryAgain}
        <div class="input-wrap">
            <label for="country" class="field-label"
                >{t("labels.citizenship")}</label
            >
            <select
                class="input-2"
                id="country"
                bind:value={registrationState.values.country}
            >
                <option value="" disabled
                    >{t("select.placeholder.country")}</option
                >
                {#await getCountries("cs") then countries}
                    {#each countries as country}
                        {#each Object.entries(country) as [code, name]}
                            <option value={code}>{name}</option>
                        {/each}
                    {/each}
                {/await}
            </select>
            <Errors errors={registrationState.errors} path="country" />
        </div>
    {/if}
    <div class="input-group-wrap">
        <div class="input-wrap">
            <label for="gender" class="field-label">{t("labels.gender")}</label>
            <select
                class="input-2"
                id="gender"
                name="gender"
                bind:value={registrationState.values.gender}
            >
                <option value="" disabled
                    >{t("select.placeholder.gender")}</option
                >
                <option value="muž">{t("options.gender.male")}</option>
                <option value="žena">{t("options.gender.female")}</option>
            </select>
            <Errors errors={registrationState.errors} path="gender" />
        </div>
    </div>
    {#if registrationState.values.country.length > 0}
        {@render residenceFields()}
    {/if}
    <div class="input-wrap">
        <label for="transport" class="field-label"
            >{t("labels.transport")}</label
        >
        <select
            class="input-2"
            id="transport"
            name="transport"
            bind:value={registrationState.values.transport}
        >
            <option value="" disabled
                >{t("select.placeholder.transport")}</option
            >
            <option value="auto">{t("options.transport.car")}</option>
            <option value="kolo">{t("options.transport.bike")}</option>
            <option value="motorka">{t("options.transport.motorcycle")}</option>
            <option value="el-kolobezka"
                >{t("options.transport.electricScooter")}</option
            >
        </select>
        <Errors errors={registrationState.errors} path="transport" />
    </div>

    <!-- Drivers License if Auto -->
    {#if registrationState.values.transport === "auto"}
        <DriversLicenseUpload {registrationState}></DriversLicenseUpload>
    {/if}
</div>
