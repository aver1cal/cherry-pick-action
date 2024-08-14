<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

## Fork of this action: [cherry-pick-action](https://github.com/marketplace/actions/github-cherry-pick-action) && [cherry-pick-action](https://github.com/marketplace/actions/xealth-cherry-picker)

We'd like to acknowledge [cherry-pick-action](https://github.com/marketplace/actions/github-cherry-pick-action) for giving a great foundation for us to build additional functionality. Please check out that action if you think it better suits your needs. 

# A Cherry Pick GitHub Action 🍒 

Automatically create a cherry pick `pull-request` to user defined `labels` and/or static release branches!

- [What does it do?](#-what-does-it-do)  
- [Differences](#differences-from-cherry-pick-action)  
- [Examples/Demos](#-examplesdemos) 
- [Usage](#-usage)
- [Configuration](#-configuration) 
- [Inputs](#action-inputs)

---

## 🤔 What does it do? 

This action will:

- Checkout the triggered action.
- Create the new branch name `cherry-pick-${GITHUB_SHA}` from `branch` input.
- Cherry-pick the `${GITHUB_SHA}` into the created `branch`
- Push a new `branch` to `remote`
- Open a pull request to `branch`

----

## Differences from [cherry-pick-action](https://github.com/marketplace/actions/github-cherry-pick-action)

In the other action, a user must specify the release branch in the `workflow`; This action allows for users to input their own branches via `labels`.
This action also supports specifying multiple release branches in **one PR**. 

----

## 💻 Examples/Demos
Head over to [this repo](https://github.com/arivera-xealth/sample-repo/pulls) to see this in "action"! (pun intended)

Take this [pull request](https://github.com/arivera-xealth/sample-repo/pull/66) for example:
- Before or after merging the pull request `main`, the user specified the release branch they'd like to cherry pick that commit to.
- By adding the `CP v2.0.0` label, the action opened [this](https://github.com/arivera-xealth/sample-repo/pull/67) pull request on behalf of the user, according to the action's [Configuration](#configuration).

## 🕺 Usage

Usage depends on your needs. Please see the following options:

**Do you want users to be able to specify the release branches dynamically via `labels`?**

- Please see [User Defined Labels](#user-defined-labels) and its [inputs](#user-defined-labels-1).

**Want to statically define a release branch or trigger it based on other logic?**

- Please see [Basic Configuration](#basic-configuration) and its [inputs](#basic-configuration-1)

----

## 📋 Configuration

### Basic Configuration

```yml
on:
  pull_request:
    branches:
      - main
    types: ["labeled"]

jobs:
  cherry_pick_release:
    runs-on: ubuntu-latest
    name: Cherry pick into selected branch
    if: 
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Cherry pick
        uses: aver1cal/cherry-pick-action@v1.0.0
        with:
          allowUserToSpecifyBranchViaLabel: 'true'
          labelPatternRequirement: 'cherry-pick v' #Every label that starts with "cherry-pick v" will be cherry picked
          userBranchPrefix: 'v' #This add a prefix to the branch (if the branch starts with a prefix)
          body: 'Picked from: ${{ github.event.pull_request.html_url }}'
          labels: |
            cherry-pick
          reviewers: |
            aReviewerUser
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
----


## Action inputs

#### Basic Configuration
If your release branches do not change often, setting up user defined labels might not be necessary. 

| Name | Description | Default |
| --- | --- | --- |
| `token` | `GITHUB_TOKEN` or a `repo` scoped [Personal Access Token (PAT)](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). | `GITHUB_TOKEN` |
| `committer` | The committer name and email address in the format `Display Name <email@address.com>`. Defaults to the GitHub Actions bot user. | `GitHub <noreply@github.com>` |
| `author` | The author name and email address in the format `Display Name <email@address.com>`. Defaults to the user who triggered the workflow run. | `${{ github.actor }} <${{ github.actor }}@users.noreply.github.com>` |
| `branch` | Name of the branch to merge the cherry pick. | `create-pull-request/patch` |
| `labels` | A comma or newline-separated list of labels. | |
| `assignees` | A comma or newline-separated list of assignees (GitHub usernames). | |
| `reviewers` | A comma or newline-separated list of reviewers (GitHub usernames) to request a review from. | |
| `team-reviewers` | A comma or newline-separated list of GitHub teams to request a review from. Note that a `repo` scoped [PAT](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) may be required. | |
| `body` | Content of cherry-pick PR description. | |
| `titlePrefix` | Optional prefix in front of the duplicated title in cherry-pick PR. | |

If you'd like users to cherry pick based on label input, see below:

#### User Defined Labels
| Name | Description | Default |
| --- | --- | --- |
| `allowUserToSpecifyBranchViaLabel` | Must be `true` (string) if enabled, Allows the user to specify which branch or branches to cherry pick to via their label | |
| `labelPatternRequirement` | If the above is true, a user can specify a label pattern to look for. Ex: "CP v" will find labels like "CP v1.0.0" ||
| `userBranchPrefix` | A prefix to apply to the release branches. Ex: v -> `v1.0.0` or release- -> `release-1.0.0` ||

- _Keep in mind, `branch` will be overriden if `allowUserToSpecifyBranchViaLabel` is set true!_
- _Also, `labelPatternRequirement` searches for an exact match using `.includes(labelPatternRequirement)`: We plan to support regex eventually_


_Note from the [original author](carloscastrojumo/github-cherry-pick-action):_

### Working with forked repositories

If you are using this action while working with forked repositories (e.g. when you get pull requests from external contributors), you will have to adapt the trigger to avoid permission problems.

In such a case you should use the `pull_request_target` trigger, which was introduced by github for this usecase.

### Example 

```yml
on:
  pull_request_target:
    branches:
      - main
    types: ["closed"]
 ...
```
More information can be found in the [GitHub Blog](https://github.blog/2020-08-03-github-actions-improvements-for-fork-and-pull-request-workflows/#improvements-for-public-repository-forks)

## Contributing

Please contribute by opening a pull-request! We recommend also opening a pull request to the [original creator's repository](https://github.com/marketplace/actions/github-cherry-pick-action) as well. 

## License

[MIT](LICENSE)
