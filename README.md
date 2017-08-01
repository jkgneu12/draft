# draft

## Setup Server

### Install Python3, virtualenv, virtualenvwrapper

### Make virtualenv
```
mkvirtualenv draft --python=`which python3`
```

### Install R
https://cran.r-project.org/bin/macosx/

### Install requirements
```
cd server
pip install -r ./server/requirements.txt
```

### Install glpk
http://ftp.gnu.org/gnu/glpk/

```
./configure --prefix=/usr/local
make
sudo make install
```

### Install Rglpk + slam

#### Download both:
https://cran.r-project.org/web/packages/Rglpk/index.html
https://cran.r-project.org/web/packages/slam/index.html

#### R Install both:
```
R CMD INSTALL <file>.tar.gz
```

### Install mysql

### Create a database
```
mysql -u root -p
create database draft;
```

### Run server
```
python server.py
```

## Setup Webapp

### Install npm deps
```
cd client
npm update
npm install
```

### Run client
```
grunt serve
```
