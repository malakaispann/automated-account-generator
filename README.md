# Automated Account Generator

A serverless application for extracting information from a Google Form submission, creating a new user account, and notifying parties of interest.

Created for use with [Google Apps Script (GAS)](https://developers.google.com/apps-script).

## Use

### Pre-Requisites

#### Google Form & Apps Script Setup

Before using the application, you must create a Google Form and connect it to Google App Script.

Official documentation on how to do this can be found on [Google's dev docs](https://developers.google.com/apps-script/guides/bound).

#### Downloading the Application

This application is released as a single Javascript file. To retrieve the file:

1. Navigate to your [desired release](https://github.com/malakaispann/automated-account-generator/releases)
2. Assets -> "Standalone Script (GAS-Ready)" to download

The file contains all GAS-compatible dependencies and custom application code. All code is minimized to reduce file size.

> [!IMPORTANT]
> As with anything on the internet, don't download anything you don't trust. The file is just JS code that can't execute on it's own.
> Peruse the [build script](./build.ts) and other automated configurations ( i.e. [build](.github/workflows/build.yml) workflow, [release](.github/workflows/release.yml) workflow, and  [semantic release config](.releaserc.json)) if you're curious.

### Registering the Application in Google Apps Script

The app has a mechanism to self register.

After loading the app into GAS, whether by copy-pasting the file content or importing the entire file, select the `runSetup` method to register the app.

The app will now run whenever a **response is submitted** to the form.

> [!WARNING]
> If updating application, be sure to [delete any previously registered triggers](https://developers.google.com/apps-script/guides/triggers/installable#manage_triggers_manually) for the app.

### Application Configuration

This app is configurable by design.

**Prompt and organization configurations are very important.** See the [How it Works](#how-it-works) section for more information about how a particular configuration is used.

An exhaustive list of keys and their descriptions are below:

| Configuration Key                | Description                                                   | Allowed Values                  | Default Value                  |
| -------------------------------- | ------------------------------------------------------------- | :-----------------------------: | :----------------------------: |
| ADMIN_EMAIL_ALIAS                | The email to send admin related information to                | Any String                      | <admin@gmail.com>                |
| DEFAULT_ACCOUNT_SUB_ORGANIZATION | The sub-organization to stick all created accounts under      | Any String                      | /                              |
| DRY_RUN_CREATE_ACCOUNT           | When true, disables real API calls to create new accounts     | TRUE, FALSE                     | TRUE                           |
| DRY_RUN_SEND_EMAIL               | When true, disables real API calls to send out emails         | TRUE, FALSE                     | TRUE                           |
| EMAIL_ADDRESS_PROMPT             | The prompt used in the Form for the member's personal email   | Any String                      | Email                          |
| FIRST_NAME_PROMPT                | The prompt used in the Form for the member's first name       | Any String                      | First Name                     |
| LAST_NAME_PROMPT                 | The prompt used in the Form for the member's last name        | Any String                      | Last Name                      |
| LOGGING_LEVEL                    | Controls the verbosity of output from the script              | TRACE, DEBUG, INFO, WARN, ERROR | INFO                           |
| SENDER_DISPLAY_NAME              | The name shown to those receiving emails sent by the app      | Any String                      | Org Name + "Account Generator" |
| ORGANIZATION_DOMAIN              | The web domain of your organization (i.e. myorg.com)          | Any String                      | gmail.com                      |
| ORGANIZATION_NAME                | The name of your organization                                 | Any String                      | XYZ                            |

## How it Works

The application essentially works in 4 stages:

1. Configuration (see [section listing available configs](#application-configuration))
2. Response Parsing
3. Account creation
4. Notification

### Runtime configuration

Configurations are parsed from the [script properties](https://developers.google.com/apps-script/guides/properties), Google's version of environment variables, and are used to control various aspects of the apps's behavior.

Of note, the "dry run" configuration are a safety net that prevent any *real* damage from being done. These are set to `TRUE` by default to save heartache while getting setup. Be sure to set those to `FALSE`, **only after** you're confident everything is configured correctly.

The `LOGGING_LEVEL` configuration will be your best friend here. Start by setting it to "TRACE" and working your way up to "INFO".

Others configs, like the organization information, are used to control the account that gets [generated for the new member](#account-creation), customize the [welcome email](#notification) sent to the new member, and control what email address gets [notified](#notification) that a new member account has been created.

> [!NOTE]
> Configurations are parsed whenever a new response is submitted. This means that script properties can be added, removed, or modified without the need to update the code itself. Changes will take effect on the next execution / response submission.

### Response Parsing

The app takes the information from a response and transforms it into basic details for the new member's account. The key details the app looks for are the new member's:

- first name
- last name
- personal email address

The app is able to search for this information in the response by using the prompts (questions) from the form. Set the appropriate `_PROMPT` configurations to control this.

- For example, if your form asks "What is the member's first name?", set `FIRST_NAME_PROMPT` to "What is the member's first name?"

> [!IMPORTANT]
> Be sure to keep the prompts from your form and the configured prompts in sync. If you change your form, always do a sanity check on the app's prompt configuration.

Using the information from the response, it generates an email address of the form `firstInitial.lastName@organizationDomain`.
  
- The entire address will be lowercase
- For example, with `ORGANIZATION_DOMAIN` set to "apple.org" and the member's name being Jane Doe, the generated email address will be `j.doe@apple.org`

Some information validation does also occur here. For example, the app checks whether the response fields for those fields were blank; if so, it fails out.

> [!WARNING]
> Always use unique prompts. The information extraction logic may extract the wrong information otherwise.
> The app normalizes the configured prompts as well as the ones extracted from each response to prevent issues with problematic characters. Simply removing a punctuation mark from a duplicated prompt is not enough.

### Account Creation

After parsing out the information for the new member's account, the app sends a request out to Google to create the account.

A few key details on this:

- A random-enough, 15 character temporary password is created for the account. It *must* be changed after the first login.
  - This password gets sent to the new member's personal email address during the [notification stage](#notification). Other than that, it is not captured / saved anywhere else.
- The account is put under the sub-org specified by the `DEFAULT_ACCOUNT_SUB_ORGANIZATION` config.  See [official google docs for more on sub-orgs](https://developers.google.com/workspace/admin/directory/v1/guides/manage-org-units#manage).

### Notification

Finally, the application notifies parties of interest (the new member, and organization admins) that the new member's account has been created.

To do this, it sends two emails:

1. A welcome email containing the new account's credentials to the new member via the member's personal email address (extracted from response)
2. A generic "New Account Created" email to the admin alias set by the `ADMIN_EMAIL_ALIAS` configuration.

The emails will be sent from whatever account the Google Form & Apps Script are stored under. The display name of the sending account (that the receiver sees) can be controlled
using the `SENDER_DISPLAY_NAME`.

> [!IMPORTANT]
> Google sets a limit on how many emails can be sent via their APIsn. The app checks this limit before attempting to send any emails.
> If at least 2 emails cannot be sent, the app will fail out *post-account creation*. 

> [!WARNING]
> This is the only step that exposes the temporary password generated for the member's account. If the welcome email fails to send or the wrong email address is input to the form, be aware that account admins may need to take additional measures to generate a new temporary password or lock down the account for security purposes.

## Conclusion

This is a very purpose-bound application, but that doesn't mean it's complete; actually, far from it.
Some of the gotchas and quirky behavior listed within this README might need to be addressed in future dev cycles.

In addition, there's always more input validation, self-recovery functionality, or QOL improvements to make.

To request any additional features or report bugs, please use [open an issue](https://github.com/malakaispann/automated-account-generator/issues/new).

Be as descriptive as possible.
