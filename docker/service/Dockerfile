FROM server:latest

RUN git clone --progress -v "https://github.com/ItManTos/ItManTos.github.io.git" /opt/ItManTos && \
    git clone --progress -v "https://github.com/ItManTos/tangrammy.git" /opt/tangrammy && \
    git clone --progress -v "https://github.com/ItManTos/node-server.git" /opt/nserver


WORKDIR /etc/nginx/conf.d
ADD proxy.conf proxy.conf
EXPOSE 80
WORKDIR /root/
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

WORKDIR /opt/
ADD monitor.sh monitor.sh
RUN chmod +x /opt/monitor.sh

CMD ["/opt/monitor.sh"]
