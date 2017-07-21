#!/bin/bash

# Add your pgp public key files to the data/backup/keys directory and add this script to a crontab.
# Public key files should end in the .asc extension otherwise they will be ignored.
# You will find your backups in data/backup/savepoints as raw -> gz -> encrypted files.

# To retrieve a backup, from your machine with the pgp private key run something like $ gpg --output backup.gz --decrypt 20170101_000000.you@example.com.gz.gpg

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
mkdir -p $DIR/../data/backup/keys
mkdir -p $DIR/../data/backup/savepoints

cd "$DIR/../data/backup"
BACKUP_DIR="`pwd`"
KEYS_DIR="$BACKUP_DIR/keys"
SAVEPOINTS_DIR="$BACKUP_DIR/savepoints"

for f in "$KEYS_DIR/*.asc"
do
	gpg --no-default-keyring --keyring /tmp/piratedb_temp_keystore.gpg --import $f
done

RECIPIENTS="`gpg --no-default-keyring --keyring /tmp/piratedb_temp_keystore.gpg --list-public-keys | grep uid | sed -n -e 's/^.*<\(.*\)>/\1/p'`"

for recipient in $RECIPIENTS
do
    FILENAME="`date +"%Y%m%d_%H%M%S"`.$recipient.gz.gpg"
    FILEPATH="$SAVEPOINTS_DIR/$FILENAME"
    sudo su - postgres -c 'pg_dump -C -F p -d piratedb' | gzip | gpg --trust-model always --no-default-keyring --keyring /tmp/piratedb_temp_keystore.gpg --recipient $recipient --armor --output $FILEPATH --encrypt
done

rm /tmp/piratedb_temp_keystore.gpg*
exit