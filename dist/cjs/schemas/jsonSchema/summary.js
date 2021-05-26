'use strict';

const _ = require('lodash');
const { Claim } = require('../../claim/Claim');
const credDefinitions = require('../../creds/definitions');
const claimDefinitions = require('../../claim/definitions');

module.exports = {
  SummaryMapper,
  summaryMap
};