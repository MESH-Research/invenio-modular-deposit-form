import { ORCID } from "orcid-utils";

import { i18next } from "@translations/invenio_modular_deposit_form/i18next";

/**
 * Test if argument is a Research Organization Registry identifier.
 *
 * The ROR is a 9-character alphanumeric string. It can be in the
 * form of a URL or just the ROR. If the value to be tested is
 * not a string, the error message will be "ROR must be a string".
 *
 * This can be used as a yup validation method using the yup
 * addMethod function like this:
 *
 *   import { addMethod } from "yup";
 *   import { rorValidator } from "./validatorsForIds";
 *   addMethod(yup.string, "ror", rorValidator);
 *
 * Then you can use it in a schema like this:
 *
 *   import * as yup from "yup";
 *   const schema = yup.object().shape({
 *     ror: yup.string().ror("Invalid ROR identifier"),
 *   });
 *
 * If your schema does not provide a custom error message when
 * it calls the ror method, the default error message will be
 * "Invalid ROR identifier". Otherwise this is overridden by
 * the custom error message.
 *
 * @param {string} message
 * @returns either true or an error message
 */
function rorValidator(message) {
  return this.test("ror", message, function (val) {
    const { path, createError } = this;

    if (typeof val !== "string") {
      return createError({ path, message: i18next.t("ROR identifier cannot be empty") });
    }

    const rorRegexp = new RegExp(
      "^(?:(?:https?://)?ror.org/)?(0\\w{6}\\d{2})$",
      "i"
    );
    // See https://ror.org/facts/#core-components.

    if (!rorRegexp.test(val)) {
      return createError({
        path,
        message: message ?? i18next.t("Invalid ROR identifier"),
      });
    }

    return true;
  });
}

/**
 * Test if argument is an International Standard Name Identifier.
 *
 * The ISNI is a 16-digit number which can be divided into four
 * blocks.
 *
 * This can be used as a yup validation method using the yup
 * addMethod function like this:
 *
 *  import { addMethod } from "yup";
 *  import { isniValidator } from "./validatorsForIds";
 *  addMethod(yup.string, "isni", isniValidator);
 *
 * Then you can use it in a schema like this:
 *
 *   import * as yup from "yup";
 *   const schema = yup.object().shape({
 *    isni: yup.string().isni("Invalid ISNI identifier"),
 *   });
 *
 * If your schema does not provide a custom error message when
 * it calls the isni method, the default error message will be
 * "Invalid ISNI identifier". Otherwise this is overridden by
 * the custom error message. The only exception is where the
 * ISNI is not a valid length, in which case the default error
 * message is "ISNI is not a valid length" and this will not be
 * overridden.
 *
 * @param {string} message
 * @returns either true or an error message
 */
function isniValidator(message) {
  return this.test("isni", message, function (val) {
    const { path, createError } = this;

    // Test if argument is an International Standard Name Identifier.
    const convertXTo10 = (x) => {
      // Convert char to int with X being converted to 10.
      return x !== "X" ? parseInt(x, 10) : 10;
    };

    val = val.replace(/-/g, "").replace(/ /g, "").toUpperCase();
    if (val.length !== 16) {
      return createError({
        path,
        message: message ?? i18next.t("ISNI is not a valid length"),
      });
    }

    try {
      let r = 0;
      for (let x of val.slice(0, -1)) {
        r = (r + parseInt(x, 10)) * 2;
      }
      const ck = (12 - (r % 11)) % 11;
      if (ck !== convertXTo10(val.slice(-1))) {
        return createError({
          path,
          message: message ?? i18next.t("Invalid ISNI identifier"),
        });
      }
    } catch (error) {
      return createError({
        path,
        message: message ?? i18next.t("Invalid ISNI identifier"),
      });
    }

    return true;
  });
}

/**
 * Test if argument is a Gemeinsame Normdatei identifier.
 *
 * The GND is a 10-digit number with an optional check digit.
 *
 * This can be used as a yup validation method using the yup
 * addMethod function like this:
 *
 *   import { addMethod } from "yup";
 *   import { gndValidator } from "./validatorsForIds";
 *   addMethod(yup.string, "gnd", gndValidator);
 *
 * Then you can use it in a schema like this:
 *
 *  import * as yup from "yup";
 *  const schema = yup.object().shape({
 *    gnd: yup.string().gnd("Invalid GND identifier"),
 *  });
 *
 * If your schema does not provide a custom error message when
 * it calls the gnd method, the default error message will be
 * "Invalid GND identifier". Otherwise this is overridden by
 * the custom error message.
 *
 * If the value to be tested starts with "http://d-nb.info/gnd/",
 * the prefix is ignored for validation.
 *
 * @param {string} message
 * @returns either true or an error message
 */
function gndValidator(message) {
  return this.test("gnd", message, function (val) {
    const { path, createError } = this;

    if (typeof val !== "string") {
      return createError({ path, message: i18next.t("GND identifier cannot be empty") });
    }

    const gndResolverUrl = "http://d-nb.info/gnd/";

    if (val.startsWith(gndResolverUrl)) {
      val = val.slice(gndResolverUrl.length);
    }

    // GND must match one of these patterns:
    // 1. Start with 1 followed by optional 0, 1, or 2, then 7 digits and a check digit (X or number)
    // 2. Start with 4 or 7 followed by 6 digits and a hyphen and a digit
    // 3. Start with 1-9 followed by 0-7 digits and a hyphen and a check digit (X or number)
    // 4. Start with 3 followed by 7 digits and a check digit (X or number)
    const gndRegexp = new RegExp(
      "^(?:(?:gnd:|GND:)?)?(" +
        "1[012]?\\d{7}[0-9X]|" +
        "(?:4|7)\\d{6}-\\d|" +
        "(?:[1-9])\\d{0,7}-[0-9X]|" +
        "(?:3)\\d{7}[0-9X]" +
        ")$"
    );

    if (!gndRegexp.test(val)) {
      return createError({ path, message: message ?? i18next.t("Invalid GND") });
    }

    return true;
  });
}

/**
 * Test if argument is an ORCID.
 *
 * This can be used as a yup validation method using the yup
 * addMethod function like this:
 *
 *  import { addMethod } from "yup";
 *  import { orcidValidator } from "./validatorsForIds";
 *  addMethod(yup.string, "orcid", orcidValidator);
 *
 * Then you can use it in a schema like this:
 *
 *   import * as yup from "yup";
 *   const schema = yup.object().shape({
 *     orcid: yup.string().orcid("Invalid ORCID identifier"),
 *   });
 *
 * If your schema does not provide a custom error message when
 * it calls the orcid method, the default error message will be
 * "Invalid ORCID identifier". Otherwise this is overridden by
 * the custom error message.
 *
 * The ORCID can be in the form of a URL or just the ORCID. If
 * the value to be tested is not a string, the error message will
 * be "ORCID must be a string".
 *
 * @param {string} message
 * @returns
 */
function orcidValidator(message) {
  return this.test("orcid", message, function (val) {
    const { path, createError } = this;

    if (typeof val !== "string") {
      return createError({ path, message: i18next.t("ORCID must be a string") });
    } else if (!ORCID.isValid(val)) {
      return createError({ path, message: message ?? i18next.t("Invalid ORCID") });
    }

    return true;
  });
}

function sanitizeWPUsername(username, strict = false) {
  let rawUsername = username;

  // Remove HTML tags
  username = username.replace(/<\/?[^>]+(>|$)/g, "");

  // Remove accents
  username = username.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Remove percent-encoded characters
  username = username.replace(/%[a-fA-F0-9]{2}/g, "");

  // Remove HTML entities
  username = username.replace(/&[^;]+;/g, "");

  // If strict, reduce to ASCII for max portability
  if (strict) {
    username = username.replace(/[^a-z0-9 _.\-@]/gi, "");
  }

  // Remove all whitespace
  username = username.replace(/\s+/g, "");

  return username;
}

/**
 * Validator that always passes (for schemes like grid, igsn, upc, w3id, other, crossreffunderid).
 * Mirrors server-side always_valid in invenio-rdm-records config.
 */
function alwaysValidValidator(message) {
  return this.test("always_valid", message, function () {
    return true;
  });
}

/**
 * Test if argument is a valid ARK. Mirrors idutils.is_ark.
 */
function arkValidator(message) {
  return this.test("ark", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    if (typeof val !== "string") return createError({ path, message: message ?? i18next.t("ARK must be a string") });
    const arkSuffix = /^ark:\/?[0-9bcdfghjkmnpqrstvwxz]+\/.+$/i;
    try {
      const u = new URL(val);
      const match = arkSuffix.test(val) || (u.protocol === "http:" && u.hostname && arkSuffix.test(u.pathname.slice(1)));
      if (!match) return createError({ path, message: message ?? i18next.t("Invalid ARK") });
    } catch {
      if (!arkSuffix.test(val)) return createError({ path, message: message ?? i18next.t("Invalid ARK") });
    }
    return true;
  });
}

/**
 * Test if argument is an arXiv ID. Mirrors idutils.is_arxiv (post-2007 and pre-2007).
 */
function arxivValidator(message) {
  return this.test("arxiv", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    if (typeof val !== "string") return createError({ path, message: message ?? i18next.t("arXiv must be a string") });
    const post2007 = /^(arxiv:)?(\d{4})\.(\d{4,5})(v\d+)?$/i;
    const pre2007 = /^(arxiv:)?([a-z\-]+)(\.[a-z]{2})?(\/\d{4})(\d+)(v\d+)?$/i;
    const withClass = /^(arxiv:)?(?:[a-z\-]+)(?:\.[a-z]{2})?\/(\d{4})\.(\d{4,5})(v\d+)?$/i;
    const v = val.trim();
    if (!post2007.test(v) && !pre2007.test(v) && !withClass.test(v)) {
      return createError({ path, message: message ?? i18next.t("Invalid arXiv identifier") });
    }
    return true;
  });
}

/**
 * Test if argument is an ADS bibliographic code. Mirrors idutils.is_ads.
 */
function adsValidator(message) {
  return this.test("ads", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    if (typeof val !== "string") return createError({ path, message: message ?? i18next.t("ADS/Bibcode must be a string") });
    const ads = /^(ads:|ADS:)?(\d{4}[A-Za-z]\S{13}[A-Za-z.:])$/;
    if (!ads.test(val.trim())) return createError({ path, message: message ?? i18next.t("Invalid ADS/Bibcode") });
    return true;
  });
}

/**
 * Test if argument is EAN-13. Mirrors idutils.is_ean13.
 */
function ean13Validator(message) {
  return this.test("ean13", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    if (typeof val !== "string" || val.length !== 13) return createError({ path, message: message ?? i18next.t("Invalid EAN-13") });
    const sequence = [1, 3];
    let r = 0;
    for (let i = 0; i < 12; i++) r += parseInt(val[i], 10) * sequence[i % 2];
    const ck = (10 - (r % 10)) % 10;
    if (ck !== parseInt(val[12], 10)) return createError({ path, message: message ?? i18next.t("Invalid EAN-13") });
    return true;
  });
}

/**
 * Test if argument is an ISSN. Mirrors idutils.is_issn. Used for issn, eissn, lissn.
 */
function issnValidator(message) {
  return this.test("issn", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    const v = val.replace(/-/g, "").replace(/ /g, "").toUpperCase();
    if (v.length !== 8) return createError({ path, message: message ?? i18next.t("Invalid ISSN") });
    const convertX = (x) => (x === "X" ? 10 : parseInt(x, 10));
    let r = 0;
    for (let i = 0; i < 8; i++) r += (8 - i) * convertX(v[i]);
    if (r % 11 !== 0) return createError({ path, message: message ?? i18next.t("Invalid ISSN") });
    return true;
  });
}

/**
 * Test if argument is a Handle. Mirrors idutils.is_handle.
 */
function handleValidator(message) {
  return this.test("handle", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    if (typeof val !== "string") return createError({ path, message: message ?? i18next.t("Handle must be a string") });
    const handle = /^(hdl:\s*|(?:https?:\/\/)?hdl\.handle\.net\/)?([^/.]+(\.[^/.]+)*\/.*)$/i;
    if (!handle.test(val.trim())) return createError({ path, message: message ?? i18next.t("Invalid Handle") });
    return true;
  });
}

/**
 * Test if argument is ISBN-10 or ISBN-13. Mirrors idutils.is_isbn (isbnlib).
 */
function isbnValidator(message) {
  return this.test("isbn", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    const v = val.replace(/[\s\-]/g, "");
    if (v.length === 10) {
      let r = 0;
      for (let i = 0; i < 9; i++) r += (10 - i) * parseInt(v[i], 10);
      r = (11 - (r % 11)) % 11;
      const ck = v[9].toUpperCase() === "X" ? 10 : parseInt(v[9], 10);
      if (r !== ck) return createError({ path, message: message ?? i18next.t("Invalid ISBN") });
      return true;
    }
    if (v.length === 13 && (v.startsWith("978") || v.startsWith("979"))) {
      const seq = [1, 3];
      let r = 0;
      for (let i = 0; i < 12; i++) r += parseInt(v[i], 10) * seq[i % 2];
      const ck = (10 - (r % 10)) % 10;
      if (ck !== parseInt(v[12], 10)) return createError({ path, message: message ?? i18next.t("Invalid ISBN") });
      return true;
    }
    return createError({ path, message: message ?? i18next.t("Invalid ISBN") });
  });
}

/**
 * Test if argument is an ISTC. Mirrors idutils.is_istc.
 */
function istcValidator(message) {
  return this.test("istc", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    const v = val.replace(/-/g, "").replace(/ /g, "").toUpperCase();
    if (v.length !== 16) return createError({ path, message: message ?? i18next.t("Invalid ISTC") });
    const sequence = [11, 9, 3, 1];
    let r = 0;
    for (let i = 0; i < 15; i++) r += parseInt(v[i], 16) * sequence[i % 4];
    const ck = (r % 16).toString(16).toUpperCase();
    if (ck !== v[15]) return createError({ path, message: message ?? i18next.t("Invalid ISTC") });
    return true;
  });
}

/**
 * Test if argument is an LSID. Mirrors idutils.is_lsid (URN with lsid pattern).
 */
function lsidValidator(message) {
  return this.test("lsid", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    if (typeof val !== "string") return createError({ path, message: message ?? i18next.t("LSID must be a string") });
    const lsid = /^urn:lsid:[^:]+(:[^:]+){2,3}$/i;
    try {
      const u = new URL(val);
      if (u.protocol !== "urn:" || u.hostname !== "" || !u.pathname) return createError({ path, message: message ?? i18next.t("Invalid LSID") });
      if (!lsid.test(val)) return createError({ path, message: message ?? i18next.t("Invalid LSID") });
    } catch {
      if (!lsid.test(val)) return createError({ path, message: message ?? i18next.t("Invalid LSID") });
    }
    return true;
  });
}

/**
 * Test if argument is a PubMed ID. Mirrors idutils.is_pmid.
 */
function pmidValidator(message) {
  return this.test("pmid", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    if (typeof val !== "string") return createError({ path, message: message ?? i18next.t("PMID must be a string") });
    const pmid = /^(pmid:|https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/)?(\d+)\/?$/i;
    if (!pmid.test(val.trim())) return createError({ path, message: message ?? i18next.t("Invalid PubMed ID") });
    return true;
  });
}

/**
 * Test if argument is a PURL. Mirrors idutils.is_purl.
 */
function purlValidator(message) {
  return this.test("purl", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    if (typeof val !== "string") return createError({ path, message: message ?? i18next.t("PURL must be a string") });
    try {
      const u = new URL(val);
      const purlHosts = ["purl.org", "purl.oclc.org", "purl.net", "purl.com", "purl.fdlp.gov"];
      if (!["http:", "https:"].includes(u.protocol) || !purlHosts.includes(u.hostname) || !u.pathname) {
        return createError({ path, message: message ?? i18next.t("Invalid PURL") });
      }
    } catch {
      return createError({ path, message: message ?? i18next.t("Invalid PURL") });
    }
    return true;
  });
}

/**
 * Test if argument is a URN. Mirrors idutils.is_urn.
 */
function urnValidator(message) {
  return this.test("urn", message, function (val) {
    const { path, createError } = this;
    if (val === undefined || val === null || val === "") return true;
    if (typeof val !== "string") return createError({ path, message: message ?? i18next.t("URN must be a string") });
    try {
      const u = new URL(val);
      if (u.protocol !== "urn:" || u.hostname !== "" || !u.pathname) return createError({ path, message: message ?? i18next.t("Invalid URN") });
    } catch {
      return createError({ path, message: message ?? i18next.t("Invalid URN") });
    }
    return true;
  });
}

/**
 * Test if argument is a valid URL. Mirrors server-side idutils.is_url.
 */
function urlValidator(message) {
  return this.test("url", message, function (val) {
    const { path, createError } = this;

    if (val === undefined || val === null || val === "") {
      return true;
    }

    if (typeof val !== "string") {
      return createError({ path, message: message ?? i18next.t("URL must be a string") });
    }

    try {
      const u = new URL(val);
      if (!["http:", "https:"].includes(u.protocol)) {
        return createError({ path, message: message ?? i18next.t("Must be a valid URL (e.g. https://example.com)") });
      }
    } catch {
      return createError({ path, message: message ?? i18next.t("Must be a valid URL (e.g. https://example.com)") });
    }

    return true;
  });
}

/**
 * Test if argument is a valid DOI (Digital Object Identifier).
 *
 * DOI format: 10.<prefix>/<suffix> where prefix is assigned by a registration
 * agency (e.g. 10.1234) and suffix is assigned by the registrant. Matches
 * server-side idutils.is_doi used in invenio-rdm-records.
 *
 * @param {string} message
 * @returns either true or an error message
 */
function doiValidator(message) {
  return this.test("doi", message, function (val) {
    const { path, createError } = this;

    if (val === undefined || val === null || val === "") {
      return true;
    }

    if (typeof val !== "string") {
      return createError({ path, message: message ?? i18next.t("DOI must be a string") });
    }

    // Matches python `idutils.is_doi` via `idutils.validators.doi_regexp`.
    // python: (doi:\s*|(?:https?://)?(?:dx\.)?doi\.org/)?(10\.\d+(\.\d+)*/.+)$
    const doiRegexp =
      /^(doi:\s*|(?:https?:\/\/)?(?:dx\.)?doi\.org\/)?(10\.\d+(\.\d+)*\/.+)$/i;
    if (!doiRegexp.test(val.trim())) {
      return createError({
        path,
        message: message ?? i18next.t("Must be a valid DOI (e.g. 10.1234/example.12345)"),
      });
    }

    return true;
  });
}

/**
 * Map scheme id to validation function. Matches invenio-rdm-records config:
 * RDM_RECORDS_PERSONORG_SCHEMES and RDM_RECORDS_IDENTIFIERS_SCHEMES.
 * Each entry uses the same idutils-equivalent validator as the Python config.
 */
const SCHEME_ID_TO_VALIDATOR = {
  // RDM_RECORDS_IDENTIFIERS_SCHEMES
  ark: arkValidator,
  arxiv: arxivValidator,
  ads: adsValidator,
  crossreffunderid: alwaysValidValidator,
  doi: doiValidator,
  ean13: ean13Validator,
  eissn: issnValidator,
  grid: alwaysValidValidator,
  handle: handleValidator,
  igsn: alwaysValidValidator,
  isbn: isbnValidator,
  isni: isniValidator,
  issn: issnValidator,
  istc: istcValidator,
  lissn: issnValidator,
  lsid: lsidValidator,
  pmid: pmidValidator,
  purl: purlValidator,
  upc: alwaysValidValidator,
  url: urlValidator,
  urn: urnValidator,
  w3id: alwaysValidValidator,
  other: alwaysValidValidator,
  // RDM_RECORDS_PERSONORG_SCHEMES
  orcid: orcidValidator,
  gnd: gndValidator,
  ror: rorValidator,
};

export {
  adsValidator,
  alwaysValidValidator,
  arkValidator,
  arxivValidator,
  doiValidator,
  ean13Validator,
  gndValidator,
  handleValidator,
  isbnValidator,
  isniValidator,
  issnValidator,
  istcValidator,
  lsidValidator,
  orcidValidator,
  pmidValidator,
  purlValidator,
  rorValidator,
  SCHEME_ID_TO_VALIDATOR,
  urlValidator,
  urnValidator,
};
