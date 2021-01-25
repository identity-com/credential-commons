const { definitions: ucaDefinitions } = require('@identity.com/uca');

// ######################################### DEFINITIONS ###########################################
const definitions = [
  {
    identifier: 'claim-cvc:Email.domain-v1',
    version: '1',
    type: 'cvc:Type:domain',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Contact.email-v1',
    version: '1',
    type: 'claim-cvc:Type.email-v1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:User.id-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:User.realm-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Phone.countryCode-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Phone.number-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Phone.extension-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Phone.lineType-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:PhoneNumber.countryCode-v1',
    type: 'claim-cvc:Phone.countryCode-v1',
    version: '1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:PhoneNumber.number-v1',
    type: 'claim-cvc:Phone.number-v1',
    version: '1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:PhoneNumber.extension-v1',
    type: 'claim-cvc:Phone.extension-v1',
    version: '1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:PhoneNumber.lineType-v1',
    type: 'claim-cvc:Phone.lineType-v1',
    version: '1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Contact.phoneNumber-v1',
    version: '1',
    type: 'claim-cvc:Type.phoneNumber-v1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Name.givenNames-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Name.familyNames-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Name.otherNames-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Type.Name-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'givenNames',
          type: 'claim-cvc:Name.givenNames-v1',
        },
        {
          name: 'familyNames',
          type: 'claim-cvc:Name.familyNames-v1',
        },
        {
          name: 'otherNames',
          type: 'claim-cvc:Name.otherNames-v1',
        },
      ],
      required: ['givenNames'],
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.name-v1',
    version: '1',
    type: 'claim-cvc:Type.Name-v1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Identity.name-v1',
    version: '1',
    type: 'claim-cvc:Type.Name-v1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.nationality-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.number-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Identity.dateOfBirth-v1',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Address.city-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Address.postalCode-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'claim-cvc:Address.state-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Address.county-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'claim-cvc:Address.country-v1',
    version: '1',
    type: 'cvc:Type:country',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.address-v1',
    version: '1',
    type: 'claim-cvc:Type.address-v1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Identity.address-v1',
    version: '1',
    type: 'claim-cvc:Type.address-v1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.dateOfIssue-v1',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.dateOfExpiry-v1',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.dateOfBirth-v1',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.enum-v1',
    version: '1',
    type: 'String',
  },
  {
    identifier: 'claim-cvc:Document.type-v1',
    version: '1',
    type: 'cvc:Type:documentType',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.gender-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.issueLocation-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.issueAuthority-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.issueCountry-v1',
    version: '1',
    type: 'cvc:Type:country',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.placeOfBirth-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Type.email-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'username',
          type: 'cvc:Email:username',
        },
        {
          name: 'domain',
          type: 'claim-cvc:Email.domain-v1',
        },
      ],
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Type.phoneNumber-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'country',
          type: 'claim-cvc:PhoneNumber.country-v1',
        },
        {
          name: 'countryCode',
          type: 'claim-cvc:PhoneNumber.countryCode-v1',
        },
        {
          name: 'number',
          type: 'claim-cvc:PhoneNumber.number-v1',
        },
        {
          name: 'extension',
          type: 'claim-cvc:PhoneNumber.extension-v1',
        },
        {
          name: 'lineType',
          type: 'claim-cvc:PhoneNumber.lineType-v1',
        },
      ],
      required: ['country', 'countryCode', 'number', 'lineType'],
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:PhoneNumber.country-v1',
    type: 'cvc:Type:country',
    version: '1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Type.Name-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'givenNames',
          type: 'claim-cvc:Name.givenNames-v1',
        },
        {
          name: 'familyNames',
          type: 'claim-cvc:Name.familyNames-v1',
        },
        {
          name: 'otherNames',
          type: 'claim-cvc:Name.otherNames-v1',
        },
      ],
      required: ['givenNames'],
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Type.address-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'country',
          type: 'claim-cvc:Address.country-v1',
        },
        {
          name: 'county',
          type: 'claim-cvc:Address.county-v1',
        },
        {
          name: 'state',
          type: 'claim-cvc:Address.state-v1',
        },
        {
          name: 'street',
          type: 'claim-cvc:Address.street-v1',
        },
        {
          name: 'unit',
          type: 'claim-cvc:Address.unit-v1',
        },
        {
          name: 'city',
          type: 'claim-cvc:Address.city-v1',
        },
        {
          name: 'postalCode',
          type: 'claim-cvc:Address.postalCode-v1',
        },
      ],
      required: ['street', 'city', 'state', 'country'],
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Address.street-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Address.unit-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.properties-v1',
    version: '1',
    attestable: true,
    type: {
      properties: [
        {
          name: 'dateOfIssue',
          type: 'claim-cvc:Document.dateOfIssue-v1',
        },
        {
          name: 'dateOfExpiry',
          type: 'claim-cvc:Document.dateOfExpiry-v1',
        },
      ],
      required: ['dateOfIssue'],
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:SocialSecurity.number-v1',
    version: '1',
    type: 'cvc:Type:socialSecurityNumber',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Validation:evidences.idDocumentFront-v1',
    version: '1',
    type: 'cvc:Evidences:idDocumentFront',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Validation:evidences.idDocumentBack-v1',
    version: '1',
    type: 'cvc:Evidences:idDocumentBack',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Validation:evidences.selfie-v1',
    version: '1',
    type: 'cvc:Evidences:selfie',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.evidences-v1',
    version: '1',
    attestable: true,
    type: {
      properties: [{
        name: 'idDocumentFront',
        type: 'claim-cvc:Validation:evidences.idDocumentFront-v1',
      },
      {
        name: 'idDocumentBack',
        type: 'claim-cvc:Validation:evidences.idDocumentBack-v1',
      },
      {
        name: 'selfie',
        type: 'claim-cvc:Validation:evidences.selfie-v1',
      }],
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Vaccination.date-v1',
    version: '1',
    type: 'cvc:Type:timestamp',
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Test.date-v1',
    version: '1',
    type: 'cvc:Type:timestamp',
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Vaccination.name-v1',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Vaccination.recordDetail-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'createdAt',
          type: 'cvc:Type:date',
        },
        {
          name: 'updatedAt',
          type: 'cvc:Type:date',
        },
      ],
    },
    required: ['createdAt'],
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Type.organizationName-v1',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Type.organizationId-v1',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Type.organization-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'name',
          type: 'claim-cvc:Type.organizationName-v1',
        },
        {
          name: 'id',
          type: 'claim-cvc:Type.organizationId-v1',
        },
      ],
    },
    required: ['name'],
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Type.patient-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'fullName',
          type: 'cvc:Type:fullName',
        },
        {
          name: 'dateOfBirth',
          type: 'cvc:Type:date',
        },
      ],
    },
    required: ['name'],
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Medical.code-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'name',
          type: 'cvc:Code:name',
        },
        {
          name: 'code',
          type: 'cvc:Code:code',
        },
        {
          name: 'codeSystem',
          type: 'cvc:Code:codeSystem',
        },
        {
          name: 'codeSystemName',
          type: 'cvc:Code:codeSystemName',
        },
      ],
    },
    required: ['name', 'code'],
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Manufacturer.name-v1',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Vaccination.manufacturer-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'name',
          type: 'claim-cvc:Manufacturer.name-v1',
        },
        {
          name: 'code',
          type: 'claim-cvc:Medical.code-v1',
        },
      ],
      required: ['name'],
    },
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Vaccination.id-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Medical.codes-v1',
    version: '1',
    type: 'Array',
    items: {
      type: 'claim-cvc:Medical.code-v1',
    },
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Codes.records-v1',
    version: '1',
    type: 'Array',
    items: {
      type: 'claim-cvc:Medical.code-v1',
    },
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Vaccination.record-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'vaccinationId',
          type: 'claim-cvc:Vaccination.id-v1',
        },
        {
          name: 'dateOfAdministration',
          type: 'claim-cvc:Vaccination.date-v1',
        },
        {
          name: 'manufacturer',
          type: 'claim-cvc:Vaccination.manufacturer-v1',
        },
        {
          name: 'name',
          type: 'claim-cvc:Vaccination.name-v1',
        },
        {
          name: 'detail',
          type: 'claim-cvc:Vaccination.recordDetail-v1',
        },
        {
          name: 'organization',
          type: 'cvc:Type:organization',
        },
        {
          name: 'codes',
          type: 'claim-cvc:Codes.records-v1',
        },
      ],
      required: ['vaccinationId', 'dateOfAdministration', 'name', 'organization'],
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Vaccination.records-v1',
    version: '1',
    type: 'Array',
    items: {
      type: 'claim-cvc:Vaccination.record-v1',
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Test.type-v1',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Test.result-v1',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Test.id-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Test.record-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'testId',
          type: 'claim-cvc:Test.id-v1',
        },
        {
          name: 'testDate',
          type: 'claim-cvc:Test.date-v1',
        },
        {
          name: 'resultDate',
          type: 'claim-cvc:Test.date-v1',
        },
        {
          name: 'type',
          type: 'claim-cvc:Test.type-v1',
        },
        {
          name: 'result',
          type: 'claim-cvc:Test.result-v1',
        },
        {
          name: 'organization',
          type: 'claim-cvc:Type.organization-v1',
        },
        {
          name: 'codes',
          type: 'claim-cvc:Codes.records-v1',
        },
      ],
      required: ['testId', 'testDate', 'type', 'result'],
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Test.records-v1',
    version: '1',
    type: 'Array',
    items: {
      type: 'claim-cvc:Test.record-v1',
    },
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Medical.covid19-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'vaccinations',
          type: 'claim-cvc:Vaccination.records-v1',
        },
        {
          name: 'tests',
          type: 'claim-cvc:Test.records-v1',
        },
        {
          name: 'patient',
          type: 'claim-cvc:Type.patient-v1',
        },
      ],
    },
    require: ['patient'],
    credentialItem: true,
  },
];

function transformUcaIdToClaimId(identifier) {
  const identifierComponents = identifier.split(':');
  return `claim-cvc:${identifierComponents[1]}.${identifierComponents[2]}-v1`;
}

function isDefinitionEqual(definition, ucaDefinition) {
  return definition.identifier === transformUcaIdToClaimId(ucaDefinition.identifier)
    || definition.identifier === ucaDefinition.identifier;
}

ucaDefinitions.forEach((ucaDefinition) => {
  let found = false;
  definitions.some((definition) => {
    if (isDefinitionEqual(definition, ucaDefinition)) {
      found = true;
    }
    return found;
  });
  if (!found) {
    definitions.push(ucaDefinition);
  }
});

module.exports = definitions;
