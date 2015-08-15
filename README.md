# draft

## Make virtualenv
mkvirtualenv draft --python=/usr/local/bin/python3.4

## Install R
https://cran.r-project.org/bin/macosx/


## Install requirements
pip install -r ./server/requirements.txt

## Install glpk
http://ftp.gnu.org/gnu/glpk/

./configure --prefix=/usr/local # see note [1]
make
sudo make install

## Install Rglpk + slam
https://cran.r-project.org/web/packages/Rglpk/index.html
https://cran.r-project.org/web/packages/slam/index.html

R CMD INSTALL <file>.tar.gz

## Create database
mysql -u root -p
create database draft;

## Install npm deps
cd client
npm update

## Run client
grunt serve