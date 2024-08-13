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
exports.createPullRequest = createPullRequest;
exports.buildBranchesFromLabels = buildBranchesFromLabels;
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const utils = __importStar(require("./utils"));
const _ = __importStar(require("lodash"));
const ERROR_PR_REVIEW_FROM_AUTHOR = 'Review cannot be requested from pull request author';
async function createPullRequest(inputs, prBranch, branch) {
    const octokit = github.getOctokit(inputs.token);
    if (process.env.GITHUB_REPOSITORY !== undefined) {
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        // Get PR title
        let title = github.context.payload &&
            github.context.payload.pull_request &&
            github.context.payload.pull_request.title;
        core.info(`Using title '${title ?? ''}'`);
        if (inputs.titlePrefix != null) {
            title = inputs.titlePrefix + " " + title;
        }
        // Get PR body
        const body = inputs.body ? inputs.body :
            github.context.payload &&
                github.context.payload.pull_request &&
                github.context.payload.pull_request.body;
        core.info(`Using body '${body ?? ''}'`);
        // Create PR
        const pull = await octokit.rest.pulls.create({
            owner,
            repo,
            head: prBranch,
            base: branch,
            title,
            body
        });
        // Apply labels
        if (inputs.labels.length > 0) {
            const prLabels = github.context.payload?.pull_request?.labels ??
                [];
            if (prLabels) {
                for (const label of prLabels) {
                    if (label.name !== inputs.branch) {
                        inputs.labels.push(label.name);
                    }
                }
            }
            // if allowUserToSpecifyBranchViaLabel is true, we
            // only want the branch label, configured labels, and PR labels to be applied
            // this is done with filterIrrelevantBranchLabels()
            core.info(`Applying labels '${JSON.stringify(inputs.labels)}'`);
            await octokit.rest.issues.addLabels({
                owner,
                repo,
                issue_number: pull.data.number,
                labels: inputs.allowUserToSpecifyBranchViaLabel
                    ? utils.filterIrrelevantBranchLabels(inputs, inputs.labels, branch)
                    : inputs.labels
            });
        }
        // Apply assignees
        if (inputs.assignees.length > 0) {
            core.info(`Applying assignees '${JSON.stringify(inputs.assignees)}'`);
            await octokit.rest.issues.addAssignees({
                owner,
                repo,
                issue_number: pull.data.number,
                assignees: inputs.assignees
            });
        }
        // Request reviewers and team reviewers
        try {
            if (inputs.reviewers.length > 0) {
                core.info(`Requesting reviewers '${JSON.stringify(inputs.reviewers)}'`);
                await octokit.rest.pulls.requestReviewers({
                    owner,
                    repo,
                    pull_number: pull.data.number,
                    reviewers: inputs.reviewers
                });
            }
            if (inputs.teamReviewers.length > 0) {
                core.info(`Requesting team reviewers '${JSON.stringify(inputs.teamReviewers)}'`);
                await octokit.rest.pulls.requestReviewers({
                    owner,
                    repo,
                    pull_number: pull.data.number,
                    team_reviewers: inputs.teamReviewers
                });
            }
        }
        catch (e) {
            if (e instanceof Error) {
                if (e.message && e.message.includes(ERROR_PR_REVIEW_FROM_AUTHOR)) {
                    core.warning(ERROR_PR_REVIEW_FROM_AUTHOR);
                }
                else {
                    throw e;
                }
            }
            throw e;
        }
    }
}
function buildBranchesFromLabels(inputs) {
    core.info(`inputs ${JSON.stringify(inputs)}`);
    const potentialBranches = github.context.payload?.pull_request?.labels ?? [];
    core.info(`potential branches ${JSON.stringify(potentialBranches)}`);
    if (!potentialBranches) {
        throw Error('no labels found for cherry picking');
    }
    const matchedLabels = potentialBranches.map((branchToCheck) => {
        return utils.validatelabelPatternRequirement(inputs.labelPatternRequirement, branchToCheck.name);
    });
    const filteredLabels = _.compact(matchedLabels);
    core.info(`branch labels ${JSON.stringify(filteredLabels)}`);
    return filteredLabels.map((matchedLabel) => {
        return utils.parseBranchFromLabel(inputs.userBranchPrefix, matchedLabel);
    });
}
