## Nginx 配置
```nginx
server {
    listen 8080;
    listen [::]:8080;

    server_name xxx.xxx.xxx.xxx;

    root /var/www/html/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires max;
        log_not_found off;
    }
}
```
