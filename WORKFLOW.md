# Development Workflow

This document is meant to help everyone understand the flow from the
moment you decide you want to contribute a patch to the codebase to
it being live in production.

There are three roles to the workflow: the developer's role, the
PR reviewer's role, and the release role.

## Developer

Once you've decided you want to write code for some feature or bugfix,
follow these steps:

1. Fork the main repository
2. Make a branch
3. Document, test, implement, and debug your feature. Test it in-game afterwards.
4. Put up a PR for your feature and wait for another developer to approve and merge it.
5. Watch for your feature to land in a SAT build, and test that build as soon as it's put up while it is in web store approvals.
6. If you want feedback, make a post somewhere so people will try your feature.

## Reviewer

As a reviewer, it's your goal to keep an eye on incoming PRs in the
main repository, and when you see one you are qualified to review
do the following steps:

1. Review the code. It's OK to comment on code where changes are not needed but make it clear those comments are optional.
2. Only require changes for out-and-out bugs. Don't require changes to pre-existing code. Don't ask for changes unrelated to the PR's functionality.
3. If no required changes exist, test the branch.
4. If the branch works in your games, merge the PR.

## Release

If you're responsible for releasing Stoned Ape Tools (SAT):

1. Have a quick look at all landed PRs since the previous build.
2. Run npm run sat to produce a .zip of the build.
3. Test the .zip file. If in grave doubt, get another developer to test it too.
4. Upload nightly build to the Chrome web store with npm run deploy-sat

Note that this last workflow is a bit of fiction as the build process
is not fully implemented yet.
