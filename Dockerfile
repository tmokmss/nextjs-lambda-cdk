# Multi-stage buildでNext.jsをビルド
FROM node:16 AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

# ベースイメージの変更
FROM amazon/aws-lambda-nodejs:16

# Lambda Web Adapterのインストール
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.5.0 /lambda-adapter /opt/extensions/lambda-adapter
ENV PORT=3000

COPY --from=builder /build/next.config.js ./
COPY --from=builder /build/public ./public
COPY --from=builder /build/.next/static ./.next/static
COPY --from=builder /build/.next/standalone ./

# ベースイメージ変更に伴う調整
ENTRYPOINT ["node"]
CMD ["server.js"]
