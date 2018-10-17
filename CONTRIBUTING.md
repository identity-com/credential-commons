# How to Contribute
We’re still working out the kinks to make contributing to this project as easy and transparent as possible, but we’re not quite there yet. Hopefully this document makes the process for contributing clear and answers some questions that you may have.

# Code of Conduct
Identity.com has adopted a [Code of Conduct](CODE_OF_CONDUCT.md) that we expect project participants to adhere to. Please read the full text so that you can understand what actions will and will not be tolerated.

# Contributors & Team Members Development
Most internal changes made by Civic & Identity.com engineers will be synced to GitHub. Civic & Identity.com use this code in production. The team is likely to have an enterprise version of the code containing specific environment details and that part is not synced with the code here. 
Changes from the community are handled through GitHub pull requests which go through our review process. Once a change made on GitHub is approved, it will be imported to the Civic & Identity.com internal repositories.

# Branch Organization
We will do our best to keep the master branch in good shape, with tests passing at all times. But in order to move fast, we will make API changes that your application might not be compatible with. We recommend that you use the latest stable and published version.
If you send a pull request, please do it against the master branch. We maintain stable branches for major versions separately.We accept pull requests against latest major branch directly if it is a bugfix related to its version. This fix will be also applied to the master branch by the Core team.

# Semantic Versioning
This software follows semantic versioning. We release patch versions for bug fixes, minor versions for new features, and major versions for any breaking changes. When we make breaking changes, we also introduce deprecation warnings in a minor version so that our users learn about the upcoming changes and migrate their code in advance.
Every significant change is documented in the changelog file.

# Bugs
## Where to Find Known Issues
We are using GitHub Issues for our public bugs. Core team will keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new task, try to make sure your problem doesn’t already exist.
## Reporting New Issues
The best way to get your bug fixed is to provide a reduced test case.
How to Get in Touch

GitHub Issues: Create a ticket with the specific tag: [question] ; [feature request]; [suggestion] ; [discussion]
Identity.com website contact form

# Proposing a Change
If you intend to change the public API, or make any non-trivial changes to the implementation, we recommend filing an issue. This lets us reach an agreement on your proposal before you put significant effort into it.
If you’re only fixing a bug, it’s fine to submit a pull request right away but we still recommend to file an issue detailing what you’re fixing. This is helpful in case we don’t accept that specific fix but want to keep track of the issue.

# Your First Pull Request
Working on your first Pull Request? You can learn how from this free video series:
[How to Contribute](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github) to an Open Source Project on GitHub
If you decide to fix an issue, please be sure to check the comment thread in case somebody is already working on a fix. If nobody is working on it at the moment, please leave a comment stating that you intend to work on it so other people don’t accidentally duplicate your effort.
If somebody claims an issue but doesn’t follow up for more than two weeks, it’s fine to take it over but you should still leave a comment.

# Sending a Pull Request
The Identity.com team is monitoring for pull requests. We will review your pull request and either merge it, request changes to it, or close it with an explanation.
Before submitting a pull request, please make sure the following is done:
Fork the repository and create your branch from master.
Run `npm install` in the repository root.
If you’ve fixed a bug or added code that should be tested, add tests!
Ensure the test suite passes (`npm test`). 
Format your code with eslint (`npm run lint`).
If you haven’t already, complete the CLA.

# Contributor License Agreement (CLA)
By contributing to Identity.com projects, you agree that your contributions will be licensed under its MIT license.
Contribution Prerequisites

# Prerequisites
Please follow [README](README.md) instructions.

# Development Workflow
Please follow [README](README.md) instructions.

# Style Guide
We use an automatic code formatter called ESLint. Run `npm run lint` after making any changes to the code.
Then, our linter will catch most issues that may exist in your code.
However, there are still some styles that the linter cannot pick up. If you are unsure about something, looking at Airbnb’s Style Guide will guide you in the right direction.

# License
By contributing to Identity.com projects, you agree that your contributions will be licensed under its MIT license.
