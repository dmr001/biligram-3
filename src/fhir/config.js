export default {
    clientId: {
        "apporchard.epic.com": "bdbb53cf-6d26-4cb0-a778-e04a94b22e99", // For Sandbox
        "haikuor.providence.org": "bdbb53cf-6d26-4cb0-a778-e04a94b22e99", // For PRD
        "haikuwa.providence.org": "bdbb53cf-6d26-4cb0-a778-e04a94b22e99", // For PRD
        "haikuak.providence.org": "bdbb53cf-6d26-4cb0-a778-e04a94b22e99", // For PRD


        "haikuor-staging.providence.org": "3d1fe54b-1efc-4858-8f2d-ebf549186abf", // Biligram Non-PRD
        "haikuwa-staging.providence.org": "3d1fe54b-1efc-4858-8f2d-ebf549186abf", // Biligram Non-PRD
        "haikuak-staging.providence.org": "3d1fe54b-1efc-4858-8f2d-ebf549186abf", // Biligram Non-PRD

    },
    clientSecrets: {
        "apporchard.epic.com": "hIwCMavvb4t6z90BA42UOAdWvnzfhrGOlA4ntqhsxoPPSJpKm5ugMLYSxqhxoPPZXyYe203CISLsn/6Bm5EoSv==", // For Sandbox
        "haikuor.providence.org": "hIwCMavvb4t6z90BA42UOAdWvnzfhrGOlA4ntqhsxoPPSJpKm5ugMLYSxqhxoPPZXyYe203CISLsn/6Bm5EoSv==", // For PRD
        "haikuwa.providence.org": "hIwCMavvb4t6z90BA42UOAdWvnzfhrGOlA4ntqhsxoPPSJpKm5ugMLYSxqhxoPPZXyYe203CISLsn/6Bm5EoSv==", // For PRD
        "haikuak.providence.org": "hIwCMavvb4t6z90BA42UOAdWvnzfhrGOlA4ntqhsxoPPSJpKm5ugMLYSxqhxoPPZXyYe203CISLsn/6Bm5EoSv==", // For PRD


        "haikuor-staging.providence.org": "1AQH+O1A4ntqhsPPSJpK5ugMLYiiij8ak8V90a8IYMkYB0CzMrliOJ5EosvN4eCCeAxKKYAA/HXLhG47kVHlHG==", // Biligram - Non prod
        "haikuwa-staging.providence.org": "1AQH+O1A4ntqhsPPSJpK5ugMLYiiij8ak8V90a8IYMkYB0CzMrliOJ5EosvN4eCCeAxKKYAA/HXLhG47kVHlHG==", // Biligram - Non prod
        "haikuak-staging.providence.org": "1AQH+O1A4ntqhsPPSJpK5ugMLYiiij8ak8V90a8IYMkYB0CzMrliOJ5EosvN4eCCeAxKKYAA/HXLhG47kVHlHG==", // Biligram - Non prod


    },
    phototherapyFlowsheetCode: {    // encoded phototherapy row for each host via .ZFHIRENDCODEFLO[306664127
        // There's no other way to do this (as of 2021) except to get a unique encoded FLO row number for each
        "haikuor.providence.org": 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|tDAY4zz2n-r4Iye9sQgXm0A0', // OCPRD
        "haikuwa.providence.org": 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|tbBhRGwfHBAscSiy9E8N5kg0',  // WMPRD
        "haikuak.providence.org": 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|tUqd70DhzZN3cZQmyFjXb9A0',  // AKPRD
        "haikuor-staging.providence.org": 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|tPobsgZ1RwOFCIWGNeCQDIQ0', // OCTST
        "haikuak-staging.providence.org": 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|t.LjUH46sreWjEFgWGGec-A0',  // AKTST
        "haikuwa-staging.providence.org": 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|t0wKUA7v4IHNf.snRjqlF2w0', // WMTST

    }
}

