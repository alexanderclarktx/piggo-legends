FROM oven/bun

ADD package.json package.json
ADD web web
ADD server server
ADD modules modules

RUN bun install
EXPOSE 3000

CMD [ "bun", "start" ]