#!/bin/bash

# 1. Start MariaDB in the background with minimal overhead
# --skip-grant-tables is dangerous but useful for "it just needs to work" tests
/usr/bin/mariadbd --user=mysql --datadir=/var/lib/mysql --skip-networking=0 --bind-address=0.0.0.0 --socket=/run/mysqld/mysqld.sock --skip-grant-tables &

# 2. Give MariaDB a moment to breathe
sleep 10

# 3. Start the Node app
# DO NOT use "set -e" at the top of the file if you want the app 
# to keep trying even if the DB fails initially
echo "Starting Node app..."
npm start