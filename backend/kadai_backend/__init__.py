import pymysql

# Fake the version info to satisfy Django's requirement (2.2.1 or newer)
pymysql.version_info = (2, 2, 1, 'final', 0)
pymysql.install_as_MySQLdb()
