#!/bin/bash

# Removes backups older than a week
# (this script is also quite dangerous)

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
mkdir -p $DIR/../data/backup/savepoints

cd "$DIR/../data/backup"
BACKUP_DIR="`pwd`"
SAVEPOINTS_DIR="$BACKUP_DIR/savepoints"

find $SAVEPOINTS_DIR -name "*.gz.gpg" -type f -mtime +7 -delete