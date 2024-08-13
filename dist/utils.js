"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputAsArray = getInputAsArray;
exports.getStringAsArray = getStringAsArray;
exports.parseDisplayNameEmail = parseDisplayNameEmail;
exports.validatelabelPatternRequirement = validatelabelPatternRequirement;
exports.parseBranchFromLabel = parseBranchFromLabel;
exports.filterIrrelevantBranchLabels = filterIrrelevantBranchLabels;
const core = __importStar(require("@actions/core"));
function getInputAsArray(name, options) {
    return getStringAsArray(core.getInput(name, options));
}
function getStringAsArray(str) {
    return str
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(x => x !== '');
}
function parseDisplayNameEmail(displayNameEmail) {
    // Parse the name and email address from a string in the following format
    // Display Name <email@address.com>
    const pattern = /^([^<]+)\s*<([^>]+)>$/i;
    // Check we have a match
    const match = displayNameEmail.match(pattern);
    if (!match) {
        throw new Error(`The format of '${displayNameEmail}' is not a valid email address with display name`);
    }
    // Check that name and email are not just whitespace
    const name = match[1].trim();
    const email = match[2].trim();
    if (!name || !email) {
        throw new Error(`The format of '${displayNameEmail}' is not a valid email address with display name`);
    }
    return { name, email };
}
function validatelabelPatternRequirement(labelPatternRequirement, label) {
    return label.includes(labelPatternRequirement) ? label : undefined;
}
function parseBranchFromLabel(branchPrefix, label) {
    const versionMatchRegex = /[0-9]\d*(\.[0-9]\d*)*$/;
    const version = label.match(versionMatchRegex);
    if (!version)
        throw new Error('user did not specify release version or the release version is in an invalid format');
    return `${branchPrefix}${version[0]}`;
}
function filterIrrelevantBranchLabels(inputs, labels, branch) {
    return labels.filter((label) => {
        if (!validatelabelPatternRequirement(inputs.labelPatternRequirement, label))
            return true;
        else {
            const branchWithoutPrefix = branch.replace(inputs.userBranchPrefix, '');
            return label.includes(branchWithoutPrefix);
        }
    });
}
