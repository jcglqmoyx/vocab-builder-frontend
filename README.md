## Nginx 配置
```nginx
server {
    listen 8085;
    listen [::]:8085;

    server_name 124.222.147.251;

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