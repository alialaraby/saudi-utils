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
