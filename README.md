# Contact Sheet — S3 Photo Gallery

A small full-stack project demonstrating React (frontend), Node.js/Express
(backend API), and AWS S3 (storage) working together. Uploads go directly
from the browser to S3 using short-lived presigned URLs — the Node server
never touches the file bytes.

```
┌─────────────┐   1. request upload URL   ┌─────────────┐
│   React     │ ─────────────────────────►│   Node.js    │
│  (Vite)     │◄───────────────────────── │   Express    │
└──────┬──────┘   2. presigned URL back    └──────┬───────┘
       │ 3. PUT file directly                      │ signs URLs with
       ▼                                            │ IAM credentials
┌──────────────────────────────────────────────────▼──┐
│                      AWS S3 bucket                    │
└────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+
- An AWS account
- AWS CLI v2 installed locally

## 1. Set up your AWS account (one-time, Console)

1. Create an account at aws.amazon.com if you don't have one.
2. Sign in as root → go to **IAM** → **Users** → **Create user**.
3. Name it e.g. `you-admin`, attach the **AdministratorAccess** policy
   (this is only for the personal user you'll use to provision resources —
   the app itself gets a far narrower policy in step 3 below).
4. On that user, go to **Security credentials** → **Create access key** →
   choose **Command Line Interface (CLI)**. Save the Access Key ID and
   Secret Access Key.

## 2. Install & configure the AWS CLI (on your machine)

macOS:
```bash
brew install awscli
```

Windows: download the MSI installer from AWS's official CLI page.

Linux:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

Then configure it with the keys from step 1:
```bash
aws configure
# AWS Access Key ID: <paste>
# AWS Secret Access Key: <paste>
# Default region name: ap-south-1   (or whichever region you're closest to)
# Default output format: json
```

Verify it works:
```bash
aws sts get-caller-identity
```
You should see your account ID and the `you-admin` user ARN printed back.
