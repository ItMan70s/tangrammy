FROM alexellis2/node4.x-arm:v6

# Added following line to fix error: Hash sum mismatch
# sed -i "s|http://archive.ubuntu.com|http://mirrors.163.com|g" /etc/apt/sources.list && rm -Rf /var/lib/apt/lists/* &&

RUN apt-get -y update && \
    apt-get install -qy nginx && \   
	apt-get install -y mongodb && \
    apt-get install -y nodejs nodejs-legacy npm && \
    apt-get install -y p7zip-full && \
    apt-get install -y git && \
    apt-get autoremove 

EXPOSE 80
WORKDIR /root/
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log
