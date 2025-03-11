FROM ubuntu:latest
LABEL authors="ars"

ENTRYPOINT ["top", "-b"]