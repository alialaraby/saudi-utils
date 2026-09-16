# Validation evidence

This document records the evidence strength and offline limitations of the implemented validators. Passing validation never constitutes authoritative verification.

## Identity validators

### National ID and Iqama

- **Evidence level:** `official-structural-community-checksum`
- **Checks:** exactly 10 ASCII digits, the documented `1` (National ID) or `2` (Iqama) prefix, and the shared alternating-double checksum.
- **Sources:** [SAMA Appendix C](https://rulebook.sama.gov.sa/en/appendix-c-0), [DGA open-source listing](https://oss.dga.gov.sa/en/products/2efb54db4afb400e8d663688954baa31), and the [linked community implementation](https://github.com/alhazmy13/Saudi-ID-Validator).
- **Limitation:** authoritative material supports the structure and existence of a verification digit, but the public normative source does not publish the checksum formula. Passing does not prove issuance, existence, ownership, holder identity, citizenship, residency, sponsorship, validity, status, or expiry.

`isSaudiId`, `validateSaudiId`, and `getSaudiIdType` only compose National ID and Iqama validation. They add no stronger claim.

### Border ID

- **Evidence level:** `best-known-structural`
- **Checks:** exactly 10 ASCII digits beginning with `3` or `4`.
- **Sources:** [Absher Border Number query](https://www.absher.sa/wps/vanityurl/en/individuals/querybordernumber) and [Jawazat public guidance](https://x.com/AljawazatKSA/status/943878092858318848).
- **Limitation:** no complete public normative schema or checksum was found, so no checksum is applied or implied. Passing does not prove that a value is accepted as a Border ID in every government workflow, or prove issuance, existence, ownership, person, identity, residency, visa, entry, or status. This provisional contract must be reviewed on every major release.

## Banking validators

### Saudi IBAN

- **Evidence level:** `official-checksum`
- **Checks:** the 24-character Saudi structure, uppercase `SA` country prefix, ASCII check and bank-identifier digits, uppercase ASCII alphanumeric BBAN, and ISO 13616 MOD-97-10 checksum.
- **Sources:** [SWIFT IBAN Registry](https://www.swift.com/sites/default/files/files/iban-registry_3.pdf) and [SAMA printed IBAN format](https://rulebook.sama.gov.sa/en/printed-iban-account-formats).
- **Limitation:** this is offline structural and checksum validation, not authoritative account or bank verification. Passing does not prove bank-code allocation, account existence, ownership, status, or ability to receive funds.

## Business and tax validators

### VAT Registration Number

- **Evidence level:** `official-structural`
- **Checks:** exactly 15 ASCII digits, with `3` as both the first and last digit.
- **Checksum:** none.
- **Sources:** [ZATCA Electronic Invoice XML Implementation Standard v1.2](https://zatca.gov.sa/ar/E-Invoicing/SystemsDevelopers/Documents/20230519_ZATCA_Electronic_Invoice_XML_Implementation_Standard_%20vTrack.pdf).
- **Limitation:** this is offline structural validation, not live ZATCA verification. Passing does not prove taxpayer registration, VAT registration or status, taxpayer identity, activity, ownership, or current legal status.

### ZATCA TIN

- **Evidence level:** `best-known-structural`
- **Checks:** exactly 10 ASCII digits.
- **Checksum:** none known or claimed.
- **Sources:** [ZATCA taxpayer services](https://zatca.gov.sa/en/eServices/Pages/eServices-048.aspx) and the [ZATCA E-Invoicing Implementation Resolution](https://zatca.gov.sa/en/E-Invoicing/Introduction/LawsAndRegulations/Documents/E-Invoicing%20Implementation%20Resolution_EN.pdf).
- **Limitation:** official materials distinguish the TIN from the 15-digit VAT Registration Number but do not publish a single normative checksum or richer offline grammar. This API is intentionally separate from VAT validation. Passing is only a best-known structural result, not live ZATCA verification, and does not prove taxpayer registration, tax type, taxpayer identity, ownership, activity, or current status.

### Unified National Number for non-governmental establishments

- **Evidence level:** `official-structural`
- **Checks:** exactly 10 ASCII digits beginning with `7`; the narrower `700` prefix is not required.
- **Checksum:** none.
- **Sources:** [SAMA approval of the Unified Number starting with 7](https://www.rulebook.sama.gov.sa/en/approval-unified-number-starting-7-issued-national-information-center-serve-unified-number-non).
- **Limitation:** this is offline structural validation, not live Ministry or other authoritative verification. Passing does not prove establishment existence, registration, ownership, legal form or status, commercial activity, or current registration.

### Commercial Registration — legacy structural format

- **Evidence level:** `best-known-structural`
- **Checks:** only the documented legacy structural format of exactly 10 ASCII digits.
- **Checksum:** none known or claimed; no regional or prefix rule is applied.
- **Sources:** the [Ministry of Commerce Commercial Register system transition](https://mc.gov.sa/en/mediacenter/News/Pages/18-09-24-01.aspx) and [Commercial Registration inquiry service](https://mc.gov.sa/en/eservices/Pages/ServiceDetails.aspx?sID=91).
- **Limitation:** the current Commercial Register system and transition to the Unified National Number make a broad Commercial Registration claim unreliable. This separate legacy-format API may overlap structurally with TIN and Unified National Number validation. Passing is not live Ministry verification and does not prove that a register or establishment exists, remains active, has a particular region, activity, owner, legal identity, or legal status.

## Telecom validators

The [CST National Numbering Plan](https://www.cst.gov.sa/en/regulations-and-licenses/regulations/Document-1573) and [CST numbering overview](https://www.cst.gov.sa/en/about/Numbering) are the structural sources for these validators. All telecom APIs have the `official-structural` evidence level. Saudi number portability means that a mobile prefix cannot establish the subscriber's current carrier, so this package neither restricts the `050`–`059` range by carrier nor exposes carrier detection.

### Mobile numbers

- **Supported representations:** unseparated national `05XXXXXXXX` and E.164 `+9665XXXXXXXX`, using ASCII digits only.
- **Checks:** exact length, layout, and the structural `05` or `+9665` prefix. No narrower `05X` allocation rule or checksum is applied.
- **Limitation:** passing does not prove allocation, subscriber identity, activation, reachability, geography of a specific subscriber, or current carrier.

### Landline numbers

- **Supported representations:** unseparated national and E.164 numbers using geographic codes `011`, `012`, `013`, `014`, `016`, or `017`; for example, `011XXXXXXX` or `+96611XXXXXXX`.
- **Checks:** exact length, layout, and one of the documented geographic codes. Codes `010`, `015`, `018`, and `019` are rejected.
- **Limitation:** passing does not prove allocation, subscriber identity, activation, reachability, geography of a specific subscriber, or current carrier.

### Toll-free numbers

- **Supported representation:** unseparated national `800XXXXXXX` only. International-looking forms such as `+966800...`, `966800...`, and `00966800...` are neither accepted nor generated. `9200` unified-access numbers are outside this toll-free contract.
- **Checks:** exact length, ASCII digits, and the `800` service prefix. No checksum is applied.
- **Limitation:** passing does not prove allocation, subscriber identity, activation, reachability, geography of a specific subscriber, or current carrier.

### Phone normalization

- **Supported representations:** mobile and landline numbers in unseparated national, `+966`, `966`, or `00966` form; toll-free numbers in canonical national `800...` form only.
- **Output:** canonical `+966...` for mobile and landline numbers, or canonical national `800...` for toll-free numbers, together with the structurally validated phone kind.
- **Rejected:** whitespace, punctuation, extensions, Unicode digits, malformed or duplicated country codes, unsupported service prefixes, and international-looking toll-free forms. Normalization does not guess a phone kind and revalidates its canonical output.
- **Limitation:** normalization changes representation only. It adds no evidence of allocation, subscriber identity, activation, reachability, geography of a specific subscriber, or current carrier.
