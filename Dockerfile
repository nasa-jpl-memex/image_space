FROM ubuntu:14.04
MAINTAINER Jeffrey Baumes <jeff.baumes@kitware.com>

# The environment variables beginning with KWDEMO can be used to map this demo
# to the main url space
ENV KWDEMO_READY FALSE
ENV KWDEMO_NAME ImageSpace
ENV KWDEMO_KEY imagespace
ENV KWDEMO_SRCURL https://github.com/memex-explorer/image_space
ENV KWDEMO_DESC Image exploration and search
ENV KWDEMO_IMG /geoapp.png

EXPOSE 8080

RUN apt-get update && apt-get install -y curl \
    software-properties-common \
    python-software-properties \
    build-essential \
    libffi-dev \
    libpython-dev \
    python-pip \
    vim \
    git

# Get nodejs apt source
RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
# Add mongo apt source
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 && \
    echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
# Install packages requiring additional sources
RUN apt-get update && apt-get install -y \
    mongodb-org-shell \
    mongodb-org-tools \
    nodejs

RUN npm install -g grunt-cli

# bower does't work particularly well as root, so we create a non-root user
# called kwuser, but give it sudo ability.
RUN adduser --disabled-password --gecos '' kwuser && \
    adduser kwuser sudo && \
    echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER kwuser

WORKDIR /home/kwuser

RUN mkdir /home/kwuser/logs

# XDATA's proxy can't use the git protocol
RUN git config --global url."https://".insteadOf git://

RUN git clone git://github.com/girder/girder.git
RUN git clone git://github.com/memex-explorer/image_space.git && \
    cd image_space && \
    git checkout 635565f3e72cd315704cf97fcff378541695e0fe && \
    git reset --hard
RUN ln -s /home/kwuser/image_space/imagespace /home/kwuser/girder/plugins/imagespace
WORKDIR /home/kwuser/girder

RUN npm install && \
    grunt init && \
    grunt

# COPY .vimrc /home/kwuser/.vimrc
# RUN sudo chown kwuser:kwuser /home/kwuser/.vimrc
# COPY makelocalcfg.py /home/kwuser/makelocalcfg.py

ENV KWDEMO_READY TRUE

WORKDIR /home/kwuser/girder
# CMD ["sh", "-c", "python /home/kwuser/makelocalcfg.py > conf/geoapp.local.cfg && python server/main.py"]
CMD ["sh", "-c", "python -m girder"]
