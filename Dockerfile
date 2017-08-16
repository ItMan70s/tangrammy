FROM nginx
RUN apt-get update \
   && apt-get install -y mongodb \
   && apt-get install -y nodejs nodejs-legacy npm \
   && apt-get install -y p7zip-full \
   && apt-get install -y git \
   && git clone --progress -v "https://github.com/ItManTos/ItManTos.github.io.git" /opt/ItManTos \
   && git clone --progress -v "https://github.com/ItManTos/tangrammy.git" /opt/tangrammy \
   && git clone --progress -v "https://github.com/ItManTos/node-server.git" /opt/nserver \
   
   