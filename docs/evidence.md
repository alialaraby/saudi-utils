# Validation evidence

This register defines the strongest offline claim made by each implemented validator. Passing a
validator never constitutes authoritative verification and never proves issuance, ownership,
existence, activity, registration, account status, address existence, or phone reachability.

## Evidence levels

| Level                                    | Meaning                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `official-checksum`                      | Authoritative material supports both the structure and checksum method.                                                              |
| `official-structural`                    | Authoritative material supports the structure; no additional checksum is claimed.                                                    |
| `official-structural-community-checksum` | An authority supports the structure and existence of a check digit, while the public formula comes from an ecosystem implementation. |
| `best-known-structural`                  | The validator implements the most consistently documented offline structure available and states the evidence gap.                   |

`ValidationEvidence` is a documentation classification, not a field returned by validators.

## Identity

### National ID — `validateNationalId`, `isNationalId`

- **Evidence level:** `official-structural-community-checksum`.
- **Exact offline rule:** exactly 10 ASCII digits; prefix `1`; alternating positions are doubled,
  decimal digits are summed, and the total must be divisible by 10.
- **Checksum:** yes, the alternating-double rule.
- **Approved references:** [SAMA Appendix C](https://rulebook.sama.gov.sa/en/appendix-c-0),
  [DGA open-source listing](https://oss.dga.gov.sa/en/products/2efb54db4afb400e8d663688954baa31),
  and its [linked community implementation](https://github.com/alhazmy13/Saudi-ID-Validator).
- **Does not prove:** issuance, existence, ownership, holder identity, citizenship, validity, or
  expiry.
- **Known limitation:** the public SAMA material describes a verification digit but does not
  publish its formula; the implemented formula is supported by the DGA-linked ecosystem code.

### Iqama — `validateIqama`, `isIqama`

- **Evidence level:** `official-structural-community-checksum`.
- **Exact offline rule:** exactly 10 ASCII digits; prefix `2`; the same alternating-double rule as
  National ID.
- **Checksum:** yes, the alternating-double rule.
- **Approved references:** [SAMA Appendix C](https://rulebook.sama.gov.sa/en/appendix-c-0),
  [DGA open-source listing](https://oss.dga.gov.sa/en/products/2efb54db4afb400e8d663688954baa31),
  and its [linked community implementation](https://github.com/alhazmy13/Saudi-ID-Validator).
- **Does not prove:** issuance, existence, ownership, holder identity, residency, sponsorship,
  validity, status, or expiry.
- **Known limitation:** the same public-formula gap as National ID applies.

### Saudi person ID composition — `validateSaudiId`, `isSaudiId`, `getSaudiIdType`

- **Evidence level:** `official-structural-community-checksum`.
- **Exact offline rule:** accepts a value only when National ID or Iqama validation succeeds;
  `getSaudiIdType` then returns `"national-id"`, `"iqama"`, or `null`.
- **Checksum:** yes, through the selected National ID or Iqama validator; no additional checksum.
- **Approved references:** the National ID and Iqama references above.
- **Does not prove:** any fact beyond the underlying offline structure and checksum.
- **Known limitation:** composition adds no evidence and inherits the public-formula gap.

### Border ID — `validateBorderId`, `isBorderId`

- **Evidence level:** `best-known-structural`.
- **Exact offline rule:** exactly 10 ASCII digits beginning with `3` or `4`.
- **Checksum:** none applied or implied.
- **Approved references:** [Absher Border Number query](https://www.absher.sa/wps/vanityurl/en/individuals/querybordernumber)
  and [Jawazat public guidance](https://x.com/AljawazatKSA/status/943878092858318848).
- **Does not prove:** that the value is accepted in every government workflow, issuance,
  existence, ownership, person, identity, residency, visa, entry, or status.
- **Known limitation:** no complete public normative schema or checksum was found. This provisional
  contract must be reviewed on every major release.

## Banking

### Saudi IBAN — `validateSaudiIban`, `isSaudiIban`

- **Evidence level:** `official-checksum`.
- **Exact offline rule:** exactly 24 uppercase ASCII alphanumeric characters: `SA`, two check
  digits, two numeric bank-identifier digits, then 18 uppercase ASCII alphanumeric characters.
- **Checksum:** yes, ISO 13616 MOD-97-10.
- **Approved references:** [SWIFT IBAN Registry](https://www.swift.com/sites/default/files/files/iban-registry_3.pdf)
  and [SAMA printed IBAN format](https://rulebook.sama.gov.sa/en/printed-iban-account-formats).
- **Does not prove:** bank-code allocation, account existence, ownership, status, activity, or
  ability to receive funds.
- **Known limitation:** checksum success is not a live bank or account lookup.

`normalizeIban` changes only the documented representation and revalidates the result.
`formatIban` groups only an already-valid canonical value; it does not normalize invalid,
lowercase, or spaced input.

## Business and tax

### VAT Registration Number — `validateVatNumber`, `isVatNumber`

- **Evidence level:** `official-structural`.
- **Exact offline rule:** exactly 15 ASCII digits with `3` as both the first and last digit.
- **Checksum:** none.
- **Approved reference:** [ZATCA Electronic Invoice XML Implementation Standard v1.2](https://zatca.gov.sa/ar/E-Invoicing/SystemsDevelopers/Documents/20230519_ZATCA_Electronic_Invoice_XML_Implementation_Standard_%20vTrack.pdf).
- **Does not prove:** taxpayer identity, VAT registration, ownership, activity, or current status.
- **Known limitation:** this is structural validation, not live ZATCA verification.

### ZATCA TIN — `validateTin`, `isTin`

- **Evidence level:** `best-known-structural`.
- **Exact offline rule:** exactly 10 ASCII digits.
- **Checksum:** none known or claimed.
- **Approved references:** [ZATCA taxpayer services](https://zatca.gov.sa/en/eServices/Pages/eServices-048.aspx)
  and [ZATCA E-Invoicing Implementation Resolution](https://zatca.gov.sa/en/E-Invoicing/Introduction/LawsAndRegulations/Documents/E-Invoicing%20Implementation%20Resolution_EN.pdf).
- **Does not prove:** taxpayer registration, tax type, taxpayer identity, ownership, activity, or
  current status.
- **Known limitation:** official material distinguishes TIN from the 15-digit VAT Registration
  Number but does not publish one normative checksum or richer offline grammar. The TIN API is not
  a VAT alias.

### Unified National Number — `validateUnifiedNationalNumber`, `isUnifiedNationalNumber`

- **Evidence level:** `official-structural`.
- **Exact offline rule:** exactly 10 ASCII digits beginning with `7`; `700` is not required.
- **Checksum:** none.
- **Approved reference:** [SAMA approval of the Unified Number starting with 7](https://www.rulebook.sama.gov.sa/en/approval-unified-number-starting-7-issued-national-information-center-serve-unified-number-non).
- **Does not prove:** establishment existence, registration, ownership, legal form, activity, or
  current legal status.
- **Known limitation:** this is not a live Ministry or registry lookup.

### Commercial Registration — `validateCommercialRegistration`, `isCommercialRegistration`

- **Evidence level:** `best-known-structural`.
- **Exact offline rule:** exactly 10 ASCII digits in the legacy Commercial Registration
  representation; no regional or prefix rule.
- **Checksum:** none known or claimed.
- **Approved references:** [Ministry of Commerce Commercial Register transition](https://mc.gov.sa/en/mediacenter/News/Pages/18-09-24-01.aspx)
  and [Commercial Registration inquiry service](https://mc.gov.sa/en/eservices/Pages/ServiceDetails.aspx?sID=91).
- **Does not prove:** that a register or establishment exists or remains active, region, activity,
  ownership, legal identity, or legal status.
- **Known limitation:** this API covers only the legacy 10-digit structural format. The current
  Commercial Register and Unified National Number transition makes a broader claim unsafe. Use the
  Unified National Number API for that distinct structure.

TIN, legacy Commercial Registration, and Unified National Number grammars intentionally overlap.
The validators apply independent offline rules and do not infer identifier type.

## Telecom

The approved structural references for all telecom validators are the
[CST National Numbering Plan](https://www.cst.gov.sa/en/regulations-and-licenses/regulations/Document-1573)
and [CST numbering overview](https://www.cst.gov.sa/en/about/Numbering).

### Mobile — `validateMobileNumber`, `isMobileNumber`

- **Evidence level:** `official-structural`.
- **Exact offline rule:** unseparated national `05XXXXXXXX` or E.164 `+9665XXXXXXXX`, using ASCII
  digits.
- **Checksum:** none.
- **Approved references:** the CST sources above.
- **Does not prove:** allocation, subscriber identity, activation, reachability, or current
  carrier.
- **Known limitation:** the complete structural `050`–`059` range is accepted. Number portability
  means a prefix cannot identify the current carrier.

### Landline — `validateLandlineNumber`, `isLandlineNumber`

- **Evidence level:** `official-structural`.
- **Exact offline rule:** unseparated national or E.164 form using geographic code `011`, `012`,
  `013`, `014`, `016`, or `017`.
- **Checksum:** none.
- **Approved references:** the CST sources above.
- **Does not prove:** allocation, subscriber identity, activation, reachability, or the
  subscriber's exact geography.
- **Known limitation:** `010`, `015`, `018`, and `019` are outside the supported geographic codes.

### Toll-free — `validateTollFreeNumber`, `isTollFreeNumber`

- **Evidence level:** `official-structural`.
- **Exact offline rule:** national `800XXXXXXX` only, using ASCII digits.
- **Checksum:** none.
- **Approved references:** the CST sources above.
- **Does not prove:** allocation, subscriber identity, activation, reachability, or status.
- **Known limitation:** international-looking forms are unsupported and `9200` unified-access
  numbers are not treated as toll-free.

`normalizePhoneNumber` accepts only the representations listed in the
[API reference](api.md). Normalization changes representation and reports a structural kind; it
adds no evidence of allocation, identity, activation, reachability, geography, or carrier.

## National Address

The approved structural reference for all National Address validators is
[SPL National Address](https://splonline.com.sa/en/door-step/). SPL uses both “additional number”
and “secondary number” for the same four-digit component.

### Postal code — `validatePostalCode`, `isPostalCode`

- **Evidence level:** `official-structural`.
- **Exact offline rule:** exactly 5 ASCII digits.
- **Checksum:** none.
- **Approved reference:** the SPL source above.
- **Does not prove:** allocation, address existence, municipality, or deliverability.
- **Known limitation:** no cross-field or live SPL verification is performed.

### Building number — `validateBuildingNumber`, `isBuildingNumber`

- **Evidence level:** `official-structural`.
- **Exact offline rule:** exactly 4 ASCII digits.
- **Checksum:** none.
- **Approved reference:** the SPL source above.
- **Does not prove:** allocation, building existence, location, or deliverability.
- **Known limitation:** leading zeroes are structurally accepted and no cross-field check occurs.

### Additional number — `validateAdditionalNumber`, `isAdditionalNumber`

- **Evidence level:** `official-structural`.
- **Exact offline rule:** exactly 4 ASCII digits.
- **Checksum:** none.
- **Approved reference:** the SPL source above.
- **Does not prove:** allocation, address existence, location, or deliverability.
- **Known limitation:** leading zeroes are structurally accepted and no cross-field check occurs.

### Short Address — `validateShortAddress`, `isShortAddress`

- **Evidence level:** `official-structural`.
- **Exact offline rule:** exactly 4 uppercase ASCII letters immediately followed by 4 ASCII
  digits.
- **Checksum:** none.
- **Approved reference:** the SPL source above.
- **Does not prove:** allocation, address existence, location, or deliverability.
- **Known limitation:** validation accepts only the canonical unseparated uppercase form;
  `normalizeShortAddress` supports the explicitly documented lowercase/one-space variants.

### National Address object — `validateNationalAddress`

- **Evidence level:** `official-structural`.
- **Exact offline rule:** a non-null, non-array object with own data properties `buildingNumber`,
  `street`, `district`, `city`, `postalCode`, and `additionalNumber`; all are non-empty primitive
  strings, and numeric components pass their validators.
- **Checksum:** none.
- **Approved reference:** the SPL source above.
- **Does not prove:** address existence, allocation, spelling, municipality, geolocation,
  deliverability, or relationships between fields.
- **Known limitation:** text fields are not trimmed, normalized, or restricted by language. Extra
  fields are ignored, and successful validation returns a fresh object containing only required
  fields.
