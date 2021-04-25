FROM ubuntu:14.04
MAINTAINER paul.tunison@kitware.com

# System setup and package installation
RUN rm /bin/sh \
 && ln -s /bin/bash /bin/sh \
 && apt-get -y update \
 && apt-get -y install git cmake curl wget \
                       libatlas-base-dev libatlas-dev \
                       libboost1.55-all-dev \
                       libprotobuf-dev protobuf-compiler \
                       libgoogle-glog-dev libgflags-dev \
                       libhdf5-dev \
                       libopencv-dev \
                       liblmdb-dev \
                       libleveldb-dev \
                       libsnappy-dev


# Miniconda setup + dependency install
ENV PATH "/miniconda/bin:${PATH}"
RUN curl --insecure https://repo.continuum.io/miniconda/Miniconda2-latest-Linux-x86_64.sh >/miniconda2-latest-linux-x86_64.sh \
 && bash /miniconda2-latest-linux-x86_64.sh -b -p /miniconda \
 && rm /miniconda2-latest-linux-x86_64.sh \
 && conda update --all \
 && pip install numpy scipy matplotlib scikit-image protobuf \
 && conda install psycopg2

# Caffe installation
# - Download caffe master as of 2016/05/20
RUN mkdir /caffe /caffe/models /caffe/build \
 && curl -L https://github.com/BVLC/caffe/archive/e79bc8f.tar.gz >caffe-e79bc8f1f6df4db3a293ef057b7ca5299c01074a.tar.gz \
 && tar -xzf caffe-e79bc8f1f6df4db3a293ef057b7ca5299c01074a.tar.gz \
 && mv caffe-e79bc8f1f6df4db3a293ef057b7ca5299c01074a /caffe/source \
 && rm caffe-e79bc8f1f6df4db3a293ef057b7ca5299c01074a.tar.gz
# - Fetching data and model files
RUN /caffe/source/data/ilsvrc12/get_ilsvrc_aux.sh \
 && /caffe/source/scripts/download_model_binary.py /caffe/source/models/bvlc_alexnet \
 && mv /caffe/source/data/ilsvrc12/imagenet_mean.binaryproto /caffe/models/ \
 && mv /caffe/source/models/bvlc_alexnet/bvlc_alexnet.caffemodel /caffe/models/ \
 && mv /caffe/source/models/bvlc_alexnet/deploy.prototxt /caffe/models/
# - Build, linking to deps
RUN cd /caffe/build \
 && cmake \
    -DAtlas_BLAS_LIBRARY:PATH=/usr/lib/libatlas.so \
    -DAtlas_CBLAS_LIBRARY:PATH=/usr/lib/libcblas.so \
    -DAtlas_LAPACK_LIBRARY:PATH=/usr/lib/liblapack_atlas.so \
    -DCMAKE_BUILD_TYPE:STRING=Release \
    -DCPU_ONLY:BOOL=ON \
    -DPYTHON_EXECUTABLE:PATH=/miniconda/bin/python2.7 \
    -DPYTHON_INCLUDE_DIR:PATH=/miniconda/include/python2.7 \
    -DPYTHON_INCLUDE_DIR2:PATH=/miniconda/include/python2.7 \
    -DPYTHON_LIBRARY:PATH=/miniconda/lib/libpython2.7.so \
    -DUSE_CUDNN:BOOL=OFF \
    -DCMAKE_INSTALL_PREFIX:PATH=/caffe/install \
    /caffe/source \
 && make install -j12 \
 && cd \
 && rm -r /caffe/source /caffe/build
ENV PATH="/caffe/install/bin:${PATH}" \
    PYTHONPATH="/caffe/install/python:${PYTHONPATH}"

# SMQTK
#ENV SMQTK_VERSION "master"
ENV SMQTK_VERSION "ae84ec445b578eb09137e54190244f14281b2620"
RUN mkdir -p /smqtk/build \
 && curl -L https://github.com/Kitware/SMQTK/archive/${SMQTK_VERSION}.tar.gz >SMQTK-${SMQTK_VERSION}.tar.gz \
 && tar xf SMQTK-${SMQTK_VERSION}.tar.gz \
 && mv /SMQTK-${SMQTK_VERSION} /smqtk/source \
 && rm SMQTK-${SMQTK_VERSION}.tar.gz
RUN pip install -r /smqtk/source/requirements.txt
 && cd /smqtk/build \
 && cmake -DCMAKE_INSTALL_PREFIX:PATH=/smqtk/install /smqtk/source \
 && make install -j12 \
 && rm -r /smqtk/source /smqtk/build

# Application setup
RUN mkdir -p /data \
             /app /app/scripts /app/configs \
             /app/models /app/models/itq /app/models/lsh /app/models/flann \
             /logs
VOLUME /data /logs

ADD *.json /app/configs/
ADD *.sh /app/scripts/
ENTRYPOINT ["/app/scripts/entrypoint.sh"]

EXPOSE 12345
EXPOSE 12346
