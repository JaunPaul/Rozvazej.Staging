<script lang="ts">
    import { fade } from "svelte/transition";
    import type { RegistrationState } from "../../state/RegistrationState.svelte";
    import Errors from "../Errors.svelte";
    import { t } from "../../i18n/i18n.svelte";
    import { getInsuranceOptions } from "../../i18n/insuranceGetter";

    let { registrationState }: { registrationState: RegistrationState } =
        $props();
</script>

<div in:fade class="box has-8-gap">
    <div class="input-group-wrap">
        <div class="prefix">
            <label for="bankPrefix" class="field-label"
                >{t("labels.bank.prefix")}</label
            >
            <input
                class="input-2"
                type="text"
                id="bankPrefix"
                name="bankPrefix"
                placeholder={t("ph.bank.prefix")}
                bind:value={registrationState.values.bankPrefix}
            />
        </div>
        <div class="bank-number">
            <label for="bankNumber" class="field-label"
                >{t("labels.bank.number")}</label
            >
            <input
                class="input-2 w-input"
                type="text"
                id="bankNumber"
                name="bankNumber"
                placeholder={t("ph.bank.number")}
                bind:value={registrationState.values.bankNumber}
            />
            <Errors errors={registrationState.errors} path="bankNumber" />
        </div>
        <div class="bank-code">
            <label for="bankCode" class="field-label"
                >{t("labels.bank.code")}</label
            >
            <select
                class="input-2"
                id="bankCode"
                name="bankCode"
                bind:value={registrationState.values.bankCode}
            >
                <option value="" disabled>{t("select.placeholder.bank")}</option
                >
                <option value="0100">0100 – Komerční banka</option>
                <option value="0300">0300 – ČSOB</option>
                <option value="0600">0600 – MONETA</option>
                <option value="0800">0800 – Česká spořitelna</option>
                <option value="2010">2010 – Fio banka</option>
                <option value="3030">3030 – Air Bank</option>
                <option value="5500">5500 – Raiffeisenbank</option>
                <option value="6210">6210 – mBank</option>
                <option value="2700">2700 – UniCredit Bank</option>
                <option value="3050">3050 – Hello bank</option>
                <option value="3500">3500 – ING Bank</option>
                <option value="6800">6800 – Sberbank</option>
                <option value="2250">2250 – Banka Creditas</option>
                <option value="2070">2070 – Trinity Bank</option>
                <option value="4000">4000 – Expobank</option>
                <option value="8040">8040 – Oberbank</option>
                <option value="2600">2600 – Citibank</option>
                <option value="2020">2020 – MUFG Bank</option>
                <option value="2100">2100 – Hypoteční banka</option>
                <option value="2060">2060 – Citfin</option>
                <option value="2200">2200 – Peněžní dům</option>
                <option value="2220">2220 – Artesa</option>
                <option value="2260">2260 – NEY</option>
                <option value="3060">3060 – PKO BP</option>
                <option value="4300">4300 – Národní rozvojová banka</option>
                <option value="5800">5800 – J&T BANKA</option>
                <option value="6000">6000 – PPF banka</option>
                <option value="6200">6200 – COMMERZBANK</option>
                <option value="6300">6300 – BNP Paribas</option>
                <option value="6700">6700 – Všeobecná úvěrová banka</option>
                <option value="7910">7910 – Deutsche Bank</option>
                <option value="7950"
                    >7950 – Raiffeisen stavební spořitelna</option
                >
                <option value="7960">7960 – ČSOB Stavební spořitelna</option>
                <option value="7970">7970 – MONETA Stavební Spořitelna</option>
                <option value="7990"
                    >7990 – Modrá pyramida stavební spořitelna</option
                >
                <option value="8030"
                    >8030 – Volksbank Raiffeisenbank Nordoberpfalz</option
                >
                <option value="8060"
                    >8060 – Stavební spořitelna České spořitelny</option
                >
                <option value="8090">8090 – Česká exportní banka</option>
                <option value="8150">8150 – HSBC Continental Europe</option>
                <option value="6363">6363 – Partners banka</option>
            </select>
            <Errors errors={registrationState.errors} path="bankCode" />
        </div>
    </div>
    <div class="input-wrap">
        <label for="insurance" class="field-label"
            >{t("labels.insurance")}</label
        >
        <select
            class="input-2"
            id="insurance"
            name="insurance"
            bind:value={registrationState.values.insurance}
        >
            <option value="" disabled
                >{t("select.placeholder.insurance")}</option
            >
            {#await getInsuranceOptions("cs") then opts}
                {#each Object.entries(opts) as [k, v]}
                    <option value={k}>{v}</option>
                {/each}
            {/await}
        </select>
        <Errors errors={registrationState.errors} path="insurance" />
    </div>
    <div class="input-wrap">
        <label class="field-label" for="pinkStatementYes"
            >{t("labels.pinkStatement")}</label
        >
        <div class="input-group-wrap">
            <label
                class="registrationtype w-radio"
                class:is-checked={registrationState.values.pinkStatement ===
                    true}
            >
                <input
                    id="pinkStatementYes"
                    type="radio"
                    name="pinkStatement"
                    bind:group={registrationState.values.pinkStatement}
                    value={true}
                    style="opacity:0;position:absolute"
                />
                <span class="w-form-label">{t("answer.yes")}</span>
            </label>
            <label
                class="registrationtype w-radio"
                class:is-checked={registrationState.values.pinkStatement ===
                    false}
            >
                <input
                    id="pinkStatementNo"
                    type="radio"
                    name="pinkStatement"
                    bind:group={registrationState.values.pinkStatement}
                    value={false}
                    style="opacity:0;position:absolute"
                />
                <span class="w-form-label">{t("answer.no")}</span>
            </label>
        </div>
        <div class="text-explain">
            {@html t("hints.pinkstatement")}
        </div>
        <Errors errors={registrationState.errors} path="pinkStatement" />
    </div>
</div>
