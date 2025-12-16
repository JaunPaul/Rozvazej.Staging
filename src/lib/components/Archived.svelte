<!--

    <div class="input-wrap">
        <label for="field" class="field-label"
            >{t("labels.deliveryCompany")}</label
        >
        <div class="input-group-wrap">
            <label
                class="w-checkbox registrationtype"
                class:is-checked={registrationState.values.deliveryCompany.includes(
                    "Wolt",
                )}
            >
                <div
                    class="w-checkbox-input w-checkbox-input--inputType-custom check-box"
                    class:w--redirected-checked={registrationState.values.deliveryCompany.includes(
                        "Wolt",
                    )}
                ></div>
                <input
                    type="checkbox"
                    id="checkbox-wolt"
                    name="checkbox"
                    style="opacity:0;position:absolute;z-index:-1"
                    value="Wolt"
                    disabled={registrationState.values.submitSource === "Wolt"}
                    bind:group={registrationState.values.deliveryCompany}
                /><span class="w-form-label">Wolt</span>
            </label>
            <label
                class="w-checkbox registrationtype"
                class:is-checked={registrationState.values.deliveryCompany.includes(
                    "Bolt",
                )}
            >
                <div
                    class="w-checkbox-input w-checkbox-input--inputType-custom check-box"
                    class:w--redirected-checked={registrationState.values.deliveryCompany.includes(
                        "Bolt",
                    )}
                ></div>
                <input
                    type="checkbox"
                    id="checkbox-bolt"
                    name="checkbox"
                    style="opacity:0;position:absolute;z-index:-1"
                    value="Bolt"
                    disabled={registrationState.values.submitSource === "Bolt"}
                    bind:group={registrationState.values.deliveryCompany}
                /><span class="w-form-label">Bolt</span>
            </label>
            <label
                class="w-checkbox registrationtype"
                class:is-checked={registrationState.values.deliveryCompany.includes(
                    "Foodora",
                )}
            >
                <div
                    class="w-checkbox-input w-checkbox-input--inputType-custom check-box"
                    class:w--redirected-checked={registrationState.values.deliveryCompany.includes(
                        "Foodora",
                    )}
                ></div>
                <input
                    type="checkbox"
                    id="checkbox-foodora"
                    name="checkbox"
                    style="opacity:0;position:absolute;z-index:-1"
                    value="Foodora"
                    disabled={registrationState.values.submitSource ===
                        "Foodora"}
                    bind:group={registrationState.values.deliveryCompany}
                /><span class="w-form-label">Foodora</span>
            </label>
        </div>
    </div>

        <div class="input-wrap">
            <label for="companyId" class="field-label"
                >{t("labels.companyId")}</label
            >
            <input
                class="input-2 w-input"
                type="text"
                id="companyId"
                bind:value={registrationState.values.companyId}
            />
            <Errors errors={registrationState.errors} path="companyId" />
        </div>

<div class="input-wrap">
    <label class="field-label">{t("labels.applyAsCompany")}</label>
    <div class="input-group-wrap">
        <label
            class="registrationtype w-radio"
            class:is-checked={registrationState.values.applyAsCompany === true}
        >
            <input
                type="radio"
                bind:group={registrationState.values.applyAsCompany}
                value={true}
                style="opacity:0;position:absolute"
            />
            <span class="w-form-label">{t("answer.yes")}</span>
        </label>
        <label
            class="registrationtype w-radio"
            class:is-checked={registrationState.values.applyAsCompany === false}
        >
            <input
                type="radio"
                bind:group={registrationState.values.applyAsCompany}
                value={false}
                style="opacity:0;position:absolute"
            />
            <span class="w-form-label">{t("answer.no")}</span>
        </label>
    </div>
    <Errors errors={registrationState.errors} path="applyAsCompany" />
</div>-->
