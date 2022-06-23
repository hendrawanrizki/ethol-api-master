## ETHOL REST API v2

### Deskripsi
Program ini ditulis sebagai pengembangan dari versi 1. 

### Konvensi
* Penulisan file, variable, fungsi selain bawaan dari library wajib menggunakan Bahasa Indonesia
* Penulisan nama file menggunakan lowercase dengan tanda penghubung (-) untuk nama file lebih dari satu kata. 
```
Contoh :
jurusan.js
informasi-umum.js
```
* Penulisan Variabel Konstanta menggunakan huruf kapital dengan tanda (_) untuk penghubung lebih dari satu kata, variabel biasa dan fungsi menggunakan camelCase

```
Contoh :
const INI_KONSTANTA = 5;
const iniVariabelBiasa = 7;
function iniFungsi() {

}
```


### Installasi

* Install library
```
$ npm install
```
* Setting Environment
<br />
  Oracle DB need env variable that call LD_LIBRARY_PATH. This environment value is path of Oracle Instant client. Open File /etc/environment and add this.
  ```
  LD_LIBRARY_PATH="<path of oracle instant client>"
  ```
* Run Application using PM2
```
$ pm2 start npm --no-automation --name "rest-api" -- run start
```
* Check log to ensure application running without error
```
$ pm2 log rest-api
```