# PirateDB

[![Build status](https://img.shields.io/travis/ppau/piratedb.svg)](https://travis-ci.org/ppau/piratedb)
[![Dependency status](https://david-dm.org/ppau/piratedb.svg)](https://david-dm.org/ppau/piratedb)

A member engagement platform for the pirate movement, and anyone else. 

![screenshot](http://i.imgur.com/jzoM2E9.png)

## Development roadmap (not ordered)

1. White label refactor.
0. Community organising features.
0. Election and funding features.

## Developer setup

1. Install [vagrant](https://www.vagrantup.com/downloads.html)
0. Install [ansible](https://docs.ansible.com/ansible/intro_installation.html)
0. Clone the project

        git clone https://github.com/ppau/piratedb

0. Start the vagrant vm, system will `vagrant provision` on first 'up'.

        vagrant up

0. Log onto the vm

        vagrant ssh

0. Find the project files

        cd /vagrant

0. Install dependencies

        npm install

0. Create your environment configuration files

    Using the the *.json.example files in the repository root `config` folder, setup your environment.

    You will probably need to define sections for each of the following:

    * development
    * test
    * staging
    * production

0. Run migrations

    Check the status of migrations from the repository root with:

        sequelize db:migrate:status --config=src/backend/config/sequelize.js

    Run migrations forward from the repository root with:

        sequelize db:migrate --config=src/backend/config/sequelize.js

    Create new migrations:

        sequelize migration:create --name your_migration_name --config=src/backend/config/sequelize.js

0. Create an administrator user

        npm run manage

0. Start the dev server

        npm run dev 

    This will start three processes: 
    
    * auto-reloading jsx frontend compiler
    * auto-reloading node backend server
    * stylesheet sass compiler with watch
    
    These processes can be run individually, refer to the `package.json` scripts section.

## Production setup

WARNING: Do not use these deployment scripts against existing servers or systems, or any system not safely backed up.

WARNING: These provisioning scripts install and configure the entire system environment they target: system packages, firewalls, databases, user accounts etc.

WARNING: You get the message right? Use at your own risk.

Ansible 2.3+ is probably required, the `scripts` directory provides two scripts which may help you:

1. `prod-deploy.sh` for new servers, and;
1. `prod-upgrade.sh` for upgrading to new PirateDB application versions.

These scripts required some exported vars and should target Ubuntu 16.04 images dedicated to the PirateDB application and no other services or applications.

### Tests

0. Run server side tests TODO

        npm run serverTests

0. Run client side tests TODO

        npm run componentTests

### Utility scripts

0. Create an admin user to access the treasurer/secretary views

        npm run manage
