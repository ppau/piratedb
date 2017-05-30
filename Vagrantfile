# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/xenial64"
  config.vm.define "piratedb-server"

  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.network "forwarded_port", guest: 3001, host: 3001
  config.vm.network "forwarded_port", guest: 3002, host: 3002
  config.vm.network "forwarded_port", guest: 9876, host: 9876
  config.vm.network "forwarded_port", guest: 5432, host: 54321

  config.vm.provider "virtualbox" do |v|
    v.memory = 1512
    v.cpus = 2
  end

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "provisioning/dev.yml"
  end
end
