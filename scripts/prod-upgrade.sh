#!/bin/bash

set -e

: "${MEMBERS_SERVER:?Expecting MEMBERS_SERVER to be set}"
: "${DB_PASSWORD:?Expecting DB_PASSWORD to be set}"
: "${SESSION_SECRET:?Expecting SESSION_SECRET to be set}"
: "${STRIPE_PUBLIC_KEY:?Expecting STRIPE_PUBLIC_KEY to be set}"
: "${STRIPE_SECRET_KEY:?Expecting STRIPE_SECRET_KEY to be set}"

ansible-playbook -i "$MEMBERS_SERVER," -u root -k ../provisioning/upgrade.yml --verbose
