"use strict";var pascalToCamelCase=function(a){return a.replace(/^([A-Z])/,function(a){return a.toLowerCase()})},identifierPattern=/(claim|credential|uca|type)-((\w+):[\w.:]+)-v(\d+)/,parseIdentifier=function(a){return a.match(identifierPattern)};module.exports={pascalToCamelCase:pascalToCamelCase,parseIdentifier:parseIdentifier};