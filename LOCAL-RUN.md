# 本机运行

本次配置使用 Node.js 22.16.0、PostgreSQL 16.15 和项目锁文件中的依赖。

- 网站：http://127.0.0.1:3000
- 后台：http://127.0.0.1:3000/admin
- 用户注册：http://127.0.0.1:3000/register
- 用户登录：http://127.0.0.1:3000/login
- 后台密码：查看 `.local/admin-password.txt`
- 数据库：`127.0.0.1:55432/jinghu_hub`，连接信息见 `.env`
- 数据目录：`.local/postgres`；与电脑已有的 PostgreSQL 服务独立。
- 上传文件：`public/uploads`
- Redis：Windows 社区移植版 8.10.1，安装在 `F:\redis`，监听 `127.0.0.1:6379`。
- Redis 数据：`F:\redis\data`；配置：`F:\redis\redis.conf`；日志：`F:\redis\redis.log`。

`.env` 和 `.local/` 已被 Git 忽略，不要提交其中的密钥或数据库文件。
Redis 已接入 `.env` 的 `REDIS_URL`，缓存上限为 256 MB，使用 allkeys-lru 淘汰策略和 AOF 持久化。
Redis 未启动时读写回退到 PostgreSQL；运行日志可能出现 Redis 连接警告。
首次调用内容接口时，项目会自动初始化演示数据。
普通用户自行注册邮箱账户，注册后自动登录；账户和会话保存到 PostgreSQL，无需增加认证环境变量。管理员密码仅用于后台登录。
当前不发送邮箱验证或找回密码邮件，邮箱也不代表已经认证校园身份。

## 重启

Redis 以后台进程运行，未配置开机自启。重启电脑后运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File F:\redis\start-redis.ps1
```

停止 Redis（保存数据后退出）：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File F:\redis\stop-redis.ps1
```

安装包来源：https://github.com/redis-windows/redis-windows/releases/tag/8.10.1 ，已核对发布包 SHA-256。

在 `F:\jinghu` 的 PowerShell 中，先检查并启动数据库：

```powershell
& 'D:\postgresql\bin\pg_ctl.exe' -D "$PWD\.local\postgres" status
# 如果未运行：
& 'D:\postgresql\bin\pg_ctl.exe' -D "$PWD\.local\postgres" -l "$PWD\.local\postgres.log" -o '-h 127.0.0.1 -p 55432' start
```

生产模式（首次运行或代码变更后需要构建）：

```powershell
npm.cmd run build
npm.cmd run start -- --hostname 127.0.0.1 --port 3000
```

开发模式：

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

停止前台网站使用 Ctrl+C；本次后台启动的网站 PID 保存在 `.local/web.pid`，可先用 `Get-Process -Id (Get-Content .local/web.pid)` 确认进程再停止。
停止本项目数据库：

```powershell
& 'D:\postgresql\bin\pg_ctl.exe' -D "$PWD\.local\postgres" stop -m fast
```

数据库程序路径为本机安装位置，换电脑时需要调整。该配置用于本机访问，没有配置公网域名或 HTTPS。
